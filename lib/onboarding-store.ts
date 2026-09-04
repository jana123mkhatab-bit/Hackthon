"use client";
import { COURSES } from "./mock-data";

/**
 * Lightweight persisted onboarding state. Separate from the accessibility
 * engine (lib/accessibility-context.tsx) so the 5-step wizard can be
 * re-entered, resumed, or skipped without touching accessibility settings,
 * which take effect immediately and independently as the student toggles
 * them in step 5.
 */

export interface OnboardingData {
  completed: boolean;
  selectedCourseIds: string[];
  customCourses: { id: string; name: string; subject: string }[];
  examDates: Record<string, string>; // courseId -> ISO date
  weeklyHours: number;
  preferredDays: string[];
  mode: "exam" | "normal";
}

const KEY = "studypilot.onboarding.v1";

export const DEFAULT_ONBOARDING: OnboardingData = {
  completed: false,
  selectedCourseIds: ["algorithms", "os", "biochem", "strategy"],
  customCourses: [],
  examDates: {},
  weeklyHours: 8,
  preferredDays: ["Mon", "Tue", "Wed", "Thu"],
  mode: "exam",
};

export function loadOnboarding(): OnboardingData {
  if (typeof window === "undefined") return DEFAULT_ONBOARDING;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_ONBOARDING;
    return { ...DEFAULT_ONBOARDING, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ONBOARDING;
  }
}

/** Local-only cache — safe to call on every keystroke/toggle, never hits the network. */
export function cacheOnboarding(data: OnboardingData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // best-effort only
  }
}

/**
 * Creates real `courses` (and `exams`, where a date was set) documents for
 * this student from the wizard's selections. Only call this once, when the
 * wizard is completed — each call creates fresh course documents, so
 * calling it on every intermediate state change would create duplicates.
 */
export async function syncOnboardingToServer(data: OnboardingData): Promise<void> {
  cacheOnboarding(data);
  const courses = [...COURSES.filter((course) => data.selectedCourseIds.includes(course.id)), ...data.customCourses];

  for (const course of courses) {
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: course.name,
          courseCode: "code" in course ? course.code : "",
          instructor: "professor" in course ? course.professor : "",
          subject: course.subject,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { course?: { id?: string } } | null;
      const newCourseId = payload?.course?.id;
      const examDate = data.examDates[course.id];
      if (newCourseId && examDate) {
        await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: newCourseId, examDate, examType: "exam", priority: "medium", readinessScore: 0 }),
        }).catch(() => undefined);
      }
    } catch {
      // best-effort only — the local cache still lets the wizard resume
    }
  }
}
