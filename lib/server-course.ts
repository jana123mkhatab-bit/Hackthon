import "server-only";
import { COURSES } from "@/lib/mock-data";
import type { Concept, Course, MasteryState, SubjectCategory } from "@/lib/types";
import { getCollection } from "@/lib/db";

const SUBJECTS: SubjectCategory[] = [
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Science",
  "Humanities",
];
const COLORS = new Set<Course["color"]>(["terracotta", "sage", "gold"]);

function boundedString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function masteryState(value: unknown, mastery: number): MasteryState {
  if (value === "strong" || value === "practicing" || value === "weak" || value === "untested") return value;
  if (mastery >= 75) return "strong";
  if (mastery >= 45) return "practicing";
  return mastery > 0 ? "weak" : "untested";
}

function normalizeConcept(value: unknown, index: number): Concept | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const name = boundedString(item.name, 160);
  if (!name) return null;
  const id = boundedString(item.id, 100) || `concept-${index + 1}`;
  const mastery = Math.min(100, Math.max(0, Math.round(Number(item.mastery) || 0)));
  const dependsOn = Array.isArray(item.dependsOn)
    ? item.dependsOn.filter((dependency): dependency is string => typeof dependency === "string").map((dependency) => dependency.slice(0, 100)).slice(0, 8)
    : undefined;
  return { id, name, mastery, state: masteryState(item.state, mastery), ...(dependsOn?.length ? { dependsOn } : {}) };
}

export function sanitizeCourseInput(courseId: string, value: unknown): Course | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (boundedString(item.id, 100) !== courseId) return null;
  const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata as Record<string, unknown> : {};
  const rawConcepts = Array.isArray(item.concepts) ? item.concepts : Array.isArray(metadata.concepts) ? metadata.concepts : [];
  const concepts = rawConcepts.map(normalizeConcept).filter((concept): concept is Concept => Boolean(concept)).slice(0, 50);
  const subject = boundedString(item.subject, 80);
  const color = boundedString(item.color ?? metadata.color, 20) as Course["color"];
  return {
    id: courseId,
    code: boundedString(item.code, 40),
    name: boundedString(item.name, 200) || "Untitled course",
    professor: boundedString(item.professor, 120),
    subject: SUBJECTS.includes(subject as SubjectCategory) ? subject as SubjectCategory : "Humanities",
    color: COLORS.has(color) ? color : "sage",
    concepts,
    examDate: typeof (item.examDate ?? metadata.examDate) === "string" ? String(item.examDate ?? metadata.examDate).slice(0, 40) : undefined,
    progressPct: Math.min(100, Math.max(0, Math.round(Number(item.progressPct ?? metadata.progressPct) || 0))),
    hasMaterials: true,
  };
}

/** Resolve built-in or user-created course metadata without trusting JSON fields. */
export async function resolveCourse(courseId: string, userId?: string): Promise<Course | null> {
  const builtIn = COURSES.find((course) => course.id === courseId);
  if (builtIn) return builtIn;
  if (!userId) return null;
  const courses = await getCollection<Record<string, unknown>>("courses");
  if (!courses) return null;
  const row = await courses.findOne({ id: courseId, userId });
  if (!row) return null;
  return sanitizeCourseInput(courseId, { ...row, ...((row.metadata as Record<string, unknown> | null) ?? {}) });
}
