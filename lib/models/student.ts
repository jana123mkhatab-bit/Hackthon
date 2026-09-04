export interface AcademicInfo {
  university: string;
  faculty: string;
  major: string;
  academicYear: number;
  semester: number;
}

export type ExplanationStyle =
  | "step-by-step"
  | "concise"
  | "example-driven"
  | "visual"
  // Aliases accepted from alternate seed/import data — see explanationStyleAliases() below.
  | "simple"
  | "detailed"
  | "example_based";

export interface LearningPreferences {
  language: "ar" | "ar-en" | "en";
  preferredContent: string[];
  explanationStyle: ExplanationStyle;
  visualLearning: boolean;
  audioLearning: boolean;
  preferredSessionDuration: number;
  preferredStudyTechniques: string[];
}

export interface StudyPreferences {
  availableHoursPerDay: number;
  preferredStudyTime: string;
  preferredDays: string[];
}

export interface StudentSettings {
  dyslexiaMode: boolean;
  focusMode: boolean;
  largerText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  textToSpeech: boolean;
  speechToText: boolean;
  lowConnectivityMode: boolean;
}

export interface StudyStats {
  streakDays: number;
  focusMinutesThisWeek: number;
  weeklyGoalMinutes: number;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  gender?: "male" | "female";
  academicInfo: AcademicInfo;
  learningPreferences: LearningPreferences;
  settings: StudentSettings;
  /** Not in the spec's required field list — how much time/which days the student can study, used by the AI study plan scheduler. */
  studyPreferences?: StudyPreferences;
  /** Not in the spec's required field list — the frontend's full AccessibilityState, kept for lossless round-tripping of UI toggles that don't map 1:1 onto the spec's fields. */
  accessibilityStateRaw?: Record<string, unknown>;
  /** Not in the spec's required field list — lightweight dashboard stats with no other source of truth yet. */
  stats?: StudyStats;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicStudent = Omit<Student, "passwordHash">;

export function toPublicStudent(student: Student): PublicStudent {
  const { passwordHash: _passwordHash, ...rest } = student;
  return rest;
}

export function defaultLearningPreferences(): LearningPreferences {
  return {
    language: "en",
    preferredContent: [],
    explanationStyle: "step-by-step",
    visualLearning: true,
    audioLearning: false,
    preferredSessionDuration: 30,
    preferredStudyTechniques: [],
  };
}

export function defaultSettings(): StudentSettings {
  return {
    dyslexiaMode: false,
    focusMode: false,
    largerText: false,
    highContrast: false,
    reducedMotion: false,
    textToSpeech: false,
    speechToText: false,
    lowConnectivityMode: false,
  };
}

export function defaultAcademicInfo(): AcademicInfo {
  return { university: "", faculty: "", major: "", academicYear: 1, semester: 1 };
}

/** Normalizes the alternate style labels seen in some seed/import data onto the tutor's actual prompt behavior. */
export function explanationStyleAliases(style: ExplanationStyle): {
  stepByStep: boolean;
  brief: boolean;
  examplesFirst: boolean;
} {
  return {
    stepByStep: style === "step-by-step",
    brief: style === "concise" || style === "simple",
    examplesFirst: style === "example-driven" || style === "example_based",
  };
}

export function defaultStats(): StudyStats {
  return { streakDays: 0, focusMinutesThisWeek: 0, weeklyGoalMinutes: 300 };
}
