import "server-only";
import { randomUUID } from "node:crypto";
import { getCollection, now } from "@/lib/db";
import type { KnowledgeProfileDoc, KnowledgeTopic, MasteryStatus } from "@/lib/models";

export interface GradedTopicResult {
  topic: string;
  correct: boolean;
}

function statusFor(mastery: number, attempts: number): MasteryStatus {
  if (attempts === 0) return "untested";
  if (mastery >= 75) return "strong";
  if (mastery >= 45) return "practicing";
  return "weak";
}

function mergeTopic(existing: KnowledgeTopic | undefined, topic: string, results: GradedTopicResult[]): KnowledgeTopic {
  const priorAttempts = existing?.attempts ?? 0;
  const priorMastery = existing?.mastery ?? 0;
  const priorCorrect = Math.round((priorMastery / 100) * priorAttempts);

  const newCorrect = results.filter((r) => r.correct).length;
  const totalAttempts = priorAttempts + results.length;
  const totalCorrect = priorCorrect + newCorrect;
  const mastery = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return {
    topic,
    mastery,
    status: statusFor(mastery, totalAttempts),
    lastAssessed: now(),
    attempts: totalAttempts,
  };
}

/** Updates (or creates) the student's knowledge profile for a course based on freshly graded questions. */
export async function updateKnowledgeProfile(
  studentId: string,
  courseId: string,
  gradedResults: GradedTopicResult[]
): Promise<void> {
  if (gradedResults.length === 0) return;
  const knowledgeProfiles = await getCollection<KnowledgeProfileDoc>("knowledgeProfiles");
  if (!knowledgeProfiles) return;

  const resultsByTopic = new Map<string, GradedTopicResult[]>();
  for (const result of gradedResults) {
    const bucket = resultsByTopic.get(result.topic) ?? [];
    bucket.push(result);
    resultsByTopic.set(result.topic, bucket);
  }

  const existing = await knowledgeProfiles.findOne({ studentId, courseId });
  const existingByTopic = new Map((existing?.topics ?? []).map((t) => [t.topic, t]));

  const updatedTopics: KnowledgeTopic[] = [...(existing?.topics ?? [])];
  for (const [topic, results] of resultsByTopic) {
    const merged = mergeTopic(existingByTopic.get(topic), topic, results);
    const index = updatedTopics.findIndex((t) => t.topic === topic);
    if (index >= 0) updatedTopics[index] = merged;
    else updatedTopics.push(merged);
  }

  await knowledgeProfiles.updateOne(
    { studentId, courseId },
    { $set: { topics: updatedTopics }, $setOnInsert: { _id: existing?._id ?? randomUUID(), studentId, courseId } },
    { upsert: true }
  );
}
