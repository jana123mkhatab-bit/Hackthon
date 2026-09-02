import { NextResponse } from "next/server";
import { AIInputError, AIProviderError, generateAssessment, gradeAssessment } from "@/lib/ai";
import type { AssessmentQuestion } from "@/lib/types";
import { COURSES } from "@/lib/mock-data";
import { resolveCourse, sanitizeCourseInput } from "@/lib/server-course";
import { getCollection } from "@/lib/db";
import { attachSessionCookie, ensureSession } from "@/lib/server-session";
import { rateLimited, tooLarge } from "@/lib/server-http";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await ensureSession();
  if (rateLimited(`assessment:${session.id}`, 15, 60_000)) {
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
      course?: unknown;
    };
    if (typeof body.courseId !== "string" || (body.action !== "generate" && body.action !== "grade")) {
      throw new AIInputError("A valid courseId and action are required.");
    }
    let material = typeof body.material === "string" ? body.material.slice(0, 150_000) : "";
    if (!material) {
      const materials = await getCollection<{ extractedText?: string }>("materials");
      const row = await materials?.findOne({ userId: session.id, courseId: body.courseId },
        { projection: { extractedText: 1 }, sort: { createdAt: -1 } });
      material = row?.extractedText?.slice(0, 150_000) || "";
    }
    if (body.action === "generate") {
      const course = (await resolveCourse(body.courseId, session.id)) ??
        sanitizeCourseInput(body.courseId, body.course);
      if (!course) throw new AIInputError("Course not found. Select a saved course first.");
      const questions = await generateAssessment(body.courseId, material, course);
      const assessments = await getCollection("assessments");
      const courses = await getCollection("courses");
      if (assessments && courses) {
        const builtInCourse = COURSES.find((item) => item.id === body.courseId);
        const now = new Date();
        if (builtInCourse) await courses.updateOne({ id: builtInCourse.id, userId: session.id }, { $setOnInsert: {
          id: builtInCourse.id, userId: session.id, code: builtInCourse.code, name: builtInCourse.name,
          subject: builtInCourse.subject, professor: builtInCourse.professor, metadata: builtInCourse, createdAt: now, updatedAt: now,
        } }, { upsert: true });
        await assessments.insertOne({ id: randomUUID(), userId: session.id, courseId: body.courseId, questions, createdAt: now });
      }
      const response = NextResponse.json({ questions });
      return session.isNew ? attachSessionCookie(response, session.id) : response;
    }
    if (!Array.isArray(body.questions) || !body.answers || typeof body.answers !== "object") {
      throw new AIInputError("Questions and answers are required for grading.");
    }
    const answers = Object.fromEntries(
      Object.entries(body.answers as Record<string, unknown>)
        .filter(([key, value]) => key.length <= 100 && typeof value === "number" && Number.isInteger(value))
        .slice(0, 20)
    ) as Record<string, number>;
    let questionsForGrade = body.questions as AssessmentQuestion[];
    let assessmentId: string | null = null;
    const assessments = await getCollection<{ id: string; questions: unknown }>("assessments");
    const stored = await assessments?.findOne({ userId: session.id, courseId: body.courseId },
      { projection: { id: 1, questions: 1 }, sort: { createdAt: -1 } });
    if (stored && Array.isArray(stored.questions)) {
      assessmentId = stored.id;
      questionsForGrade = stored.questions as AssessmentQuestion[];
    }
    const course = (await resolveCourse(body.courseId, session.id)) ??
      sanitizeCourseInput(body.courseId, body.course);
    if (!course) throw new AIInputError("Course not found. Select a saved course first.");
    const result = await gradeAssessment(
        body.courseId,
        questionsForGrade,
        answers,
        material,
        course
      );
    const attempts = await getCollection("assessment_attempts");
    if (attempts) await attempts.insertOne({ id: randomUUID(), assessmentId, userId: session.id,
      courseId: body.courseId, answers, result, createdAt: new Date() });
    const response = NextResponse.json({ result });
    return session.isNew ? attachSessionCookie(response, session.id) : response;
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
