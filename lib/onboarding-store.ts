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
  name: string;
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
  name: "",
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

export function saveOnboarding(data: OnboardingData) {
  if (typeof window === "undefined") return;
  // Keep the browser cache as an offline fallback, while making the server
  // source of truth whenever a MongoDB database is configured.
  void fetch("/api/preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: data.name, preferences: { onboarding: data } }),
  }).catch(() => undefined);
  const courses = [
    ...COURSES.filter((course) => data.selectedCourseIds.includes(course.id)),
    ...data.customCourses,
  ];
  for (const course of courses) {
    void fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: course.id,
        code: "code" in course ? course.code : "",
        name: course.name,
        subject: course.subject,
        professor: "professor" in course ? course.professor : "",
        metadata: course,
      }),
    }).catch(() => undefined);
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // best-effort only
  }
}
