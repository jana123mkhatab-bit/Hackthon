import "server-only";
import type { AssessmentQuestion, AssessmentResult, Course } from "@/lib/types";
import type { AssessmentDoc, AssessmentQuestionDoc } from "@/lib/models";
import { getCollection } from "@/lib/db";

export function toAssessmentQuestionDocs(questions: AssessmentQuestion[], course: Course): AssessmentQuestionDoc[] {
  return questions.map((q) => ({
    id: q.id,
    conceptId: q.conceptId,
    question: q.prompt,
    type: q.type,
    options: q.choices,
    correctAnswer: q.choices?.[q.correctIndex ?? -1] ?? "",
    topic: course.concepts.find((c) => c.id === q.conceptId)?.name ?? q.conceptId,
    difficulty: q.difficulty,
  }));
}

export function toAssessmentQuestions(docs: AssessmentQuestionDoc[]): AssessmentQuestion[] {
  return docs.map((doc) => ({
    id: doc.id,
    type: doc.type,
    conceptId: doc.conceptId,
    prompt: doc.question,
    choices: doc.options ?? [],
    correctIndex: (doc.options ?? []).indexOf(doc.correctAnswer),
    difficulty: doc.difficulty,
  }));
}

/** Merges the student's submitted answers (choice indexes, keyed by question id) into the stored question docs. */
export function mergeGradedAnswers(docs: AssessmentQuestionDoc[], answers: Record<string, number>): AssessmentQuestionDoc[] {
  return docs.map((doc) => {
    const choiceIndex = answers[doc.id];
    const studentAnswer = choiceIndex !== undefined ? doc.options?.[choiceIndex] : undefined;
    const correctIndex = (doc.options ?? []).indexOf(doc.correctAnswer);
    return {
      ...doc,
      studentAnswer,
      isCorrect: choiceIndex !== undefined ? choiceIndex === correctIndex : undefined,
    };
  });
}

export function overallDifficulty(docs: AssessmentQuestionDoc[]): "easy" | "medium" | "hard" {
  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const doc of docs) counts[doc.difficulty]++;
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as "easy" | "medium" | "hard") ?? "medium";
}

function toAssessmentResult(row: AssessmentDoc): AssessmentResult {
  return {
    id: row._id,
    courseId: row.courseId,
    date: (row.completedAt as Date).toISOString(),
    scorePct: row.score ?? 0,
    strengths: [...new Set(row.questions.filter((q) => q.isCorrect).map((q) => q.topic))],
    gaps: [...new Set(row.questions.filter((q) => q.isCorrect === false).map((q) => q.topic))],
    aiExplanation: row.aiFeedback ?? "",
  };
}

/** Completed assessments for a course, reconstructed as the frontend's AssessmentResult history shape. */
export async function getAssessmentHistoryForCourse(studentId: string, courseId: string): Promise<AssessmentResult[]> {
  const assessments = await getCollection<AssessmentDoc>("assessments");
  const rows = (await assessments?.find({ studentId, courseId, completedAt: { $ne: null } }).sort({ completedAt: 1 }).toArray()) ?? [];
  return rows.map(toAssessmentResult);
}

/** Most recently completed assessments across all of a student's courses. */
export async function getRecentAssessmentsForStudent(studentId: string, limit = 5): Promise<AssessmentResult[]> {
  const assessments = await getCollection<AssessmentDoc>("assessments");
  const rows =
    (await assessments?.find({ studentId, completedAt: { $ne: null } }).sort({ completedAt: -1 }).limit(limit).toArray()) ?? [];
  return rows.map(toAssessmentResult);
}
