import { NextResponse } from "next/server";
import { AIInputError, AIProviderError, askTutor } from "@/lib/ai";
import type { ExplanationSettings, TutorMessage } from "@/lib/types";
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
  if (rateLimited(`tutor:${session.id}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many tutor requests. Please try again shortly." }, { status: 429 });
  }
  if (tooLarge(request)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  try {
    const body = (await request.json()) as {
      courseId?: unknown;
      question?: unknown;
      material?: unknown;
      settings?: Partial<ExplanationSettings>;
      history?: unknown;
      course?: unknown;
    };
    if (typeof body.courseId !== "string" || typeof body.question !== "string") {
      throw new AIInputError("courseId and question are required.");
    }
    const question = body.question.trim();
    if (!question || question.length > 2_000) throw new AIInputError("Question must be between 1 and 2,000 characters.");
    const settings: ExplanationSettings = {
      length: body.settings?.length === "brief" || body.settings?.length === "detailed" ? body.settings.length : "standard",
      stepByStep: Boolean(body.settings?.stepByStep),
      simplifiedVocabulary: Boolean(body.settings?.simplifiedVocabulary),
      examplesFirst: Boolean(body.settings?.examplesFirst),
      chunked: Boolean(body.settings?.chunked),
    };
    const history = Array.isArray(body.history)
      ? body.history
          .filter((item): item is TutorMessage =>
            Boolean(
              item &&
                typeof item === "object" &&
                ["user", "assistant"].includes((item as TutorMessage).role) &&
                typeof (item as TutorMessage).content === "string"
            )
          )
          .slice(-8)
          .map((item) => ({ ...item, content: item.content.slice(0, 4_000) }))
      : [];
    let material = typeof body.material === "string" ? body.material.slice(0, 150_000) : "";
    if (!material) {
      const materials = await getCollection<{ extractedText?: string }>("materials");
      const row = await materials?.findOne({ userId: session.id, courseId: body.courseId },
        { projection: { extractedText: 1 }, sort: { createdAt: -1 } });
      material = row?.extractedText?.slice(0, 150_000) || "";
    }
    const course = (await resolveCourse(body.courseId, session.id)) ??
      sanitizeCourseInput(body.courseId, body.course);
    if (!course) throw new AIInputError("Course not found. Select a saved course first.");
    const reply = await askTutor(
      body.courseId,
      question,
      settings,
      material,
      history,
      course
    );
    const conversations = await getCollection<Record<string, unknown>>("tutor_conversations");
    const messages = await getCollection("tutor_messages");
    const courses = await getCollection("courses");
    if (conversations && messages && courses) {
      const builtInCourse = COURSES.find((item) => item.id === body.courseId);
      if (builtInCourse) {
        const now = new Date();
        await courses.updateOne({ id: builtInCourse.id, userId: session.id }, { $setOnInsert: {
          id: builtInCourse.id, userId: session.id, code: builtInCourse.code, name: builtInCourse.name,
          subject: builtInCourse.subject, professor: builtInCourse.professor, metadata: builtInCourse, createdAt: now, updatedAt: now,
        } }, { upsert: true });
      }
      const existingConversation = await conversations.findOne({ userId: session.id, courseId: body.courseId },
        { sort: { updatedAt: -1 }, projection: { _id: 0, id: 1 } });
      let conversationId = typeof existingConversation?.id === "string" ? existingConversation.id : undefined;
      if (!conversationId) {
        conversationId = randomUUID();
        const now = new Date();
        await conversations.insertOne({ id: conversationId, userId: session.id, courseId: body.courseId,
          title: "Ask My Lecture", createdAt: now, updatedAt: now });
      }
      await messages.insertMany([
        { id: randomUUID(), conversationId, role: "user", content: question, createdAt: new Date() },
        { id: randomUUID(), conversationId, role: "assistant", content: reply.content, createdAt: new Date() },
      ]);
      await conversations.updateOne({ id: conversationId, userId: session.id }, { $set: { updatedAt: new Date() } });
    }
    const response = NextResponse.json(reply);
    return session.isNew ? attachSessionCookie(response, session.id) : response;
  } catch (error) {
    const status = error instanceof AIInputError ? 400 : error instanceof AIProviderError ? 502 : 500;
    const message =
      error instanceof AIProviderError
        ? "The AI tutor is temporarily unavailable. Please try again."
        : error instanceof Error
          ? error.message
          : "Unable to answer right now.";
    return NextResponse.json({ error: message }, { status });
  }
}
