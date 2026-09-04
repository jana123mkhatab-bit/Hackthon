import { NextResponse } from "next/server";
import { getCollection, now } from "@/lib/db";
import { requireStudentId, UnauthorizedError } from "@/lib/server-session";
import { MAX_JSON_BYTES, tooLarge } from "@/lib/server-http";
import type { LearningPreferences, Student, StudentSettings } from "@/lib/models/student";
import { defaultLearningPreferences, defaultSettings, explanationStyleAliases } from "@/lib/models/student";
import type { AccessibilityState } from "@/lib/accessibility-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_ACCESSIBILITY: AccessibilityState = {
  learningPreferences: [],
  accessibilityPreferences: [],
  supportModes: [],
  language: "en",
  reducedMotion: false,
  onboarded: false,
};

/** Best-effort reconstruction of the UI's AccessibilityState from the spec's students.learningPreferences/settings fields — used only when a student has no raw blob yet (e.g. seeded demo data). */
function deriveAccessibilityState(learning: LearningPreferences, settings: StudentSettings): AccessibilityState {
  const styleAliases = explanationStyleAliases(learning.explanationStyle);
  const learningPreferences: AccessibilityState["learningPreferences"] = [];
  if (styleAliases.stepByStep) learningPreferences.push("step-by-step");
  if (styleAliases.brief) learningPreferences.push("simplified");
  if (styleAliases.examplesFirst) learningPreferences.push("examples-first");
  if (learning.explanationStyle === "visual") learningPreferences.push("visual");
  if (learning.audioLearning) learningPreferences.push("audio");
  if (learning.preferredContent.includes("text")) learningPreferences.push("text");
  for (const technique of learning.preferredStudyTechniques) {
    if (["short-sessions", "frequent-quizzes", "active-recall", "practice-heavy"].includes(technique)) {
      learningPreferences.push(technique as AccessibilityState["learningPreferences"][number]);
    }
  }

  const accessibilityPreferences: AccessibilityState["accessibilityPreferences"] = [];
  if (settings.largerText) accessibilityPreferences.push("larger-text");
  if (settings.highContrast) accessibilityPreferences.push("high-contrast");
  if (settings.textToSpeech) accessibilityPreferences.push("text-to-speech");
  if (settings.speechToText) accessibilityPreferences.push("speech-to-text");
  if (settings.lowConnectivityMode) accessibilityPreferences.push("low-connectivity");

  const supportModes: AccessibilityState["supportModes"] = [];
  if (settings.dyslexiaMode) supportModes.push("dyslexia");
  if (settings.focusMode) supportModes.push("adhd");

  return {
    learningPreferences: [...new Set(learningPreferences)],
    accessibilityPreferences: [...new Set(accessibilityPreferences)],
    supportModes,
    language: learning.language === "ar-en" ? "both" : learning.language,
    reducedMotion: settings.reducedMotion,
    onboarded: true,
  };
}

/** Derives the spec's students.learningPreferences/settings fields from the UI's AccessibilityState, so AI personalization and seed/demo data stay meaningful even though the raw blob is the source of truth for the UI itself. */
function deriveSpecFields(state: AccessibilityState): { learningPreferences: LearningPreferences; settings: StudentSettings } {
  const hasLearning = (p: string) => state.learningPreferences.includes(p as never);
  const hasMode = (m: string) => state.supportModes.includes(m as never);
  const has = (p: string) => state.accessibilityPreferences.includes(p as never);

  const explanationStyle: LearningPreferences["explanationStyle"] = hasMode("dyslexia") || hasLearning("step-by-step")
    ? "step-by-step"
    : hasLearning("examples-first")
      ? "example-driven"
      : hasLearning("simplified")
        ? "concise"
        : hasLearning("visual")
          ? "visual"
          : "step-by-step";

  const preferredStudyTechniques = state.learningPreferences.filter((p) =>
    ["short-sessions", "frequent-quizzes", "active-recall", "practice-heavy"].includes(p)
  );
  const preferredContent = state.learningPreferences.filter((p) => ["text", "audio", "text-audio", "visual"].includes(p));

  const learningPreferences: LearningPreferences = {
    language: state.language === "both" ? "ar-en" : state.language,
    preferredContent,
    explanationStyle,
    visualLearning: hasLearning("visual"),
    audioLearning: hasLearning("audio") || hasLearning("text-audio"),
    preferredSessionDuration: hasMode("adhd") || hasLearning("short-sessions") ? 15 : 25,
    preferredStudyTechniques,
  };

  const settings: StudentSettings = {
    dyslexiaMode: hasMode("dyslexia"),
    focusMode: hasMode("adhd"),
    largerText: has("larger-text"),
    highContrast: has("high-contrast"),
    reducedMotion: state.reducedMotion,
    textToSpeech: has("text-to-speech"),
    speechToText: has("speech-to-text"),
    lowConnectivityMode: has("low-connectivity"),
  };

  return { learningPreferences, settings };
}

export async function GET() {
  let studentId: string;
  try {
    studentId = await requireStudentId();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ preferences: null }, { status: 401 });
    throw error;
  }

  const students = await getCollection<Student>("students");
  const student = await students?.findOne(
    { _id: studentId },
    { projection: { learningPreferences: 1, settings: 1, accessibilityStateRaw: 1 } }
  );

  const accessibility =
    (student?.accessibilityStateRaw as AccessibilityState | undefined) ??
    (student
      ? deriveAccessibilityState(student.learningPreferences ?? defaultLearningPreferences(), student.settings ?? defaultSettings())
      : DEFAULT_ACCESSIBILITY);

  return NextResponse.json({ preferences: { accessibility } });
}

export async function PUT(request: Request) {
  if (tooLarge(request, MAX_JSON_BYTES)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

  let studentId: string;
  try {
    studentId = await requireStudentId();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    throw error;
  }

  try {
    const body = (await request.json()) as { preferences?: { accessibility?: AccessibilityState } };
    const accessibility = body.preferences?.accessibility;
    if (!accessibility || typeof accessibility !== "object") {
      return NextResponse.json({ error: "preferences.accessibility is required." }, { status: 400 });
    }

    const { learningPreferences, settings } = deriveSpecFields(accessibility);
    const students = await getCollection<Student>("students");
    await students?.updateOne(
      { _id: studentId },
      { $set: { learningPreferences, settings, accessibilityStateRaw: { ...accessibility }, updatedAt: now() } }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid preferences payload." }, { status: 400 });
  }
}
