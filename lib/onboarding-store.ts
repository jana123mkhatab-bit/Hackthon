"use client";

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
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // best-effort only
  }
}
