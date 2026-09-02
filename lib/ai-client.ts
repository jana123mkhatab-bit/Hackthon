import type {
  AnalysisResult,
  AssessmentQuestion,
  ExplanationSettings,
  GradeResult,
  TutorMessage,
  Course,
} from "./types";

export const ANALYSIS_STEPS = [
  { label: "Reading uploaded material..." },
  { label: "Identifying concepts..." },
  { label: "Comparing against past assessments..." },
  { label: "Finding learning objectives..." },
  { label: "Mapping professor emphasis..." },
  { label: "Building your knowledge map..." },
];

async function readResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | T
    | null;
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "The AI service is temporarily unavailable. Please try again.";
    throw new Error(message);
  }
  return payload as T;
}

export async function analyzeUploadedLecture(courseId: string, file: File, course?: Course): Promise<AnalysisResult & { material: string }> {
  const form = new FormData();
  form.append("courseId", courseId);
  form.append("fileName", file.name);
  form.append("file", file);
  if (course) form.append("course", JSON.stringify(course));
  return readResponse(await fetch("/api/ai/analyze", { method: "POST", body: form }));
}

export async function askTutor(
  courseId: string,
  question: string,
  settings: ExplanationSettings,
  material: string,
  history: TutorMessage[],
  course?: Course
): Promise<TutorMessage> {
  return readResponse(
    await fetch("/api/ai/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, question, settings, material, history, course }),
    })
  );
}

export async function generateAssessment(
  courseId: string,
  material: string,
  course?: Course
): Promise<AssessmentQuestion[]> {
  const response = await readResponse<{ questions: AssessmentQuestion[] }>(
    await fetch("/api/ai/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate", courseId, material, course }),
    })
  );
  return response.questions;
}

export async function gradeAssessment(
  courseId: string,
  questions: AssessmentQuestion[],
  answers: Record<string, number>,
  material: string,
  course?: Course
): Promise<GradeResult> {
  const response = await readResponse<{ result: GradeResult }>(
    await fetch("/api/ai/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grade", courseId, questions, answers, material, course }),
    })
  );
  return response.result;
}
