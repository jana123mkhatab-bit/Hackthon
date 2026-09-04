import "server-only";
import { randomUUID } from "node:crypto";
import type { AnalysisResult } from "@/lib/types";
import type { LectureAnalysisDoc } from "@/lib/models";
import { now } from "@/lib/db";

export function toLectureAnalysisDoc(result: AnalysisResult, materialId: string, courseId: string): LectureAnalysisDoc {
  return {
    _id: randomUUID(),
    materialId,
    courseId,
    learningObjectives: result.learningObjectives,
    keyTopics: result.importantConcepts.map((c) => c.name),
    importantConcepts: result.importantConcepts,
    professorFocus: result.assessmentPatterns,
    difficultyLevels: {},
    generatedAt: now(),
    assessmentPatterns: result.assessmentPatterns,
    dependencies: result.dependencies,
  };
}

export function toAnalysisResult(doc: LectureAnalysisDoc, fileName: string): AnalysisResult {
  return {
    fileName,
    courseId: doc.courseId,
    learningObjectives: doc.learningObjectives,
    importantConcepts: doc.importantConcepts,
    assessmentPatterns: doc.assessmentPatterns ?? doc.professorFocus,
    dependencies: doc.dependencies ?? [],
  };
}
