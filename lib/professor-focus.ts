import "server-only";
import type { ProfessorFocusItem } from "@/lib/types";
import type { LectureAnalysisDoc, MaterialDoc } from "@/lib/models";
import { getCollection } from "@/lib/db";
import { slugifyTopic } from "@/lib/server-course";

/**
 * Ranks the topics that recur most across everything the student has uploaded for this course,
 * used as evidence for "what does the professor seem to emphasize?" — a pattern read from the
 * material, not a claim about intent.
 */
export async function getProfessorFocusForCourse(studentId: string, courseId: string): Promise<ProfessorFocusItem[]> {
  const materials = await getCollection<MaterialDoc>("materials");
  const analyses = await getCollection<LectureAnalysisDoc>("lectureAnalyses");
  const materialIds = ((await materials?.find({ studentId, courseId }, { projection: { _id: 1 } }).toArray()) ?? []).map(
    (m) => m._id
  );
  if (materialIds.length === 0) return [];

  const docs = (await analyses?.find({ materialId: { $in: materialIds } }).toArray()) ?? [];
  const counts = new Map<string, number>();
  for (const doc of docs) {
    const topics = doc.professorFocus.length ? doc.professorFocus : doc.keyTopics;
    for (const topic of topics) counts.set(topic, (counts.get(topic) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCount = ranked[0]?.[1] ?? 1;

  return ranked.map(([topic, count]) => ({
    conceptId: slugifyTopic(topic),
    conceptName: topic,
    stars: Math.max(1, Math.min(5, Math.round((count / maxCount) * 5))) as 1 | 2 | 3 | 4 | 5,
    evidence: [`Appears in ${count} uploaded lecture${count === 1 ? "" : "s"}`],
    rationale: `${topic} recurs across what you've uploaded for this course so far — treat it as a signal worth prioritizing, not a guarantee of exam content.`,
  }));
}
