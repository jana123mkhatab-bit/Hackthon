import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCollection } from "@/lib/db";
import { attachSessionCookie, ensureSession } from "@/lib/server-session";
import { tooLarge } from "@/lib/server-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await ensureSession();
  const courseId = new URL(request.url).searchParams.get("courseId")?.slice(0, 100);
  const assessmentsCollection = await getCollection<Record<string, unknown>>("assessments");
  const filter: Record<string, unknown> = { userId: session.id };
  if (courseId) filter.courseId = courseId;
  const rows = assessmentsCollection
    ? await assessmentsCollection.find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(20).toArray()
    : [];
  const response = NextResponse.json({ assessments: rows.map((row) => ({
    id: row.id, course_id: row.courseId, questions: row.questions, created_at: row.createdAt,
  })) });
  return session.isNew ? attachSessionCookie(response, session.id) : response;
}

export async function POST(request: Request) {
  if (tooLarge(request)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const session = await ensureSession();
  try {
    const body = await request.json() as { assessmentId?: unknown; courseId?: unknown; answers?: unknown; result?: unknown };
    const courseId = typeof body.courseId === "string" ? body.courseId.trim().slice(0, 100) : "";
    if (!courseId || !body.answers || !body.result || typeof body.answers !== "object" || typeof body.result !== "object") {
      return NextResponse.json({ error: "courseId, answers, and result are required." }, { status: 400 });
    }
    const attempts = await getCollection("assessment_attempts");
    if (attempts) await attempts.insertOne({
      id: randomUUID(), assessmentId: typeof body.assessmentId === "string" ? body.assessmentId : null,
      userId: session.id, courseId, answers: body.answers, result: body.result, createdAt: new Date(),
    });
    const response = NextResponse.json({ ok: true }, { status: 201 });
    return session.isNew ? attachSessionCookie(response, session.id) : response;
  } catch {
    return NextResponse.json({ error: "Invalid assessment attempt payload." }, { status: 400 });
  }
}
