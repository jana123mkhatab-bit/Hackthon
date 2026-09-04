import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { AIInputError, AIProviderError, generateAssessment, gradeAssessment } from "@/lib/ai";
import type { AssessmentQuestion } from "@/lib/types";
import { getCourseForStudent } from "@/lib/server-course";
import { mergeGradedAnswers, overallDifficulty, toAssessmentQuestionDocs, toAssessmentQuestions } from "@/lib/assessment-mapper";
import { updateKnowledgeProfile } from "@/lib/knowledge-profile";
import { getCollection, now } from "@/lib/db";
import { requireStudentId, UnauthorizedError } from "@/lib/server-session";
import { rateLimited, tooLarge } from "@/lib/server-http";
import type { AssessmentDoc, MaterialDoc } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  let studentId: string;
  try {
    studentId = await requireStudentId();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    throw error;
  }
  if (rateLimited(`assessment:${studentId}`, 15, 60_000)) {
    return NextResponse.json({ error: "Too many assessment requests. Please try again shortly." }, { status: 429 });
  }
  if (tooLarge(request)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

  try {
    const body = (await request.json()) as {
      action?: unknown;
      courseId?: unknown;
      material?: unknown;
      questions?: unknown;
      answers?: unknown;
    };
    if (typeof body.courseId !== "string" || (body.action !== "generate" && body.action !== "grade")) {
      throw new AIInputError("A valid courseId and action are required.");
    }
    const courseId = body.courseId;

    let material = typeof body.material === "string" ? body.material.slice(0, 150_000) : "";
    if (!material) {
      const materials = await getCollection<MaterialDoc>("materials");
      const row = await materials?.find({ studentId, courseId }).sort({ uploadDate: -1 }).limit(1).next();
      material = row?.extractedText?.slice(0, 150_000) || "";
    }

    const course = await getCourseForStudent(studentId, courseId);
    if (!course) throw new AIInputError("Course not found. Select a saved course first.");

    const assessments = await getCollection<AssessmentDoc>("assessments");

    if (body.action === "generate") {
      const questions = await generateAssessment(courseId, material, course);
      const docs = toAssessmentQuestionDocs(questions, course);
      await assessments?.insertOne({
        _id: randomUUID(),
        studentId,
        courseId,
        type: "assessment",
        difficulty: overallDifficulty(docs),
        questions: docs,
        score: null,
        completedAt: null,
        aiFeedback: null,
        createdAt: now(),
      });
      return NextResponse.json({ questions });
    }

    if (!Array.isArray(body.questions) || !body.answers || typeof body.answers !== "object") {
      throw new AIInputError("Questions and answers are required for grading.");
    }
    const answers = Object.fromEntries(
      Object.entries(body.answers as Record<string, unknown>)
        .filter(([key, value]) => key.length <= 100 && typeof value === "number" && Number.isInteger(value))
        .slice(0, 20)
    ) as Record<string, number>;

    const stored = await assessments?.find({ studentId, courseId }).sort({ createdAt: -1 }).limit(1).next();
    const questionsForGrade = stored ? toAssessmentQuestions(stored.questions) : (body.questions as AssessmentQuestion[]);

    const result = await gradeAssessment(courseId, questionsForGrade, answers, material, course);

    if (stored) {
      const mergedQuestions = mergeGradedAnswers(stored.questions, answers);
      await assessments?.updateOne(
        { _id: stored._id },
        {
          $set: {
            questions: mergedQuestions,
            score: result.scorePct,
            completedAt: now(),
            aiFeedback: result.aiExplanation,
          },
        }
      );
      const gradedResults = mergedQuestions
        .filter((q) => q.isCorrect !== undefined)
        .map((q) => ({ topic: q.topic, correct: Boolean(q.isCorrect) }));
      await updateKnowledgeProfile(studentId, courseId, gradedResults);
    }

    return NextResponse.json({ result });
  } catch (error) {
    const status = error instanceof AIInputError ? 400 : error instanceof AIProviderError ? 502 : 500;
    const message =
      error instanceof AIProviderError
        ? "The assessment AI is temporarily unavailable. Please try again."
        : error instanceof Error
          ? error.message
          : "Unable to process the assessment.";
    return NextResponse.json({ error: message }, { status });
  }
}
