import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCollection } from "@/lib/db";
import { attachSessionCookie, ensureSession } from "@/lib/server-session";
import { cleanText, tooLarge } from "@/lib/server-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await ensureSession();
  const courseId = new URL(request.url).searchParams.get("courseId")?.slice(0, 100);
  const conversations = await getCollection<Record<string, unknown>>("tutor_conversations");
  const filter: Record<string, unknown> = { userId: session.id };
  if (courseId) filter.courseId = courseId;
  const rows = conversations
    ? await conversations.find(filter, { projection: { _id: 0 } }).sort({ updatedAt: -1 }).limit(20).toArray()
    : [];
  const response = NextResponse.json({ conversations: rows.map((row) => ({
    id: row.id, course_id: row.courseId, title: row.title, created_at: row.createdAt, updated_at: row.updatedAt,
  })) });
  return session.isNew ? attachSessionCookie(response, session.id) : response;
}

export async function POST(request: Request) {
  if (tooLarge(request)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const session = await ensureSession();
  try {
    const body = await request.json() as { courseId?: unknown; title?: unknown };
    const courseId = cleanText(body.courseId, 100);
    if (!courseId) return NextResponse.json({ error: "courseId is required." }, { status: 400 });
    const id = randomUUID();
    const conversations = await getCollection("tutor_conversations");
    if (conversations) {
      const now = new Date();
      await conversations.insertOne({ id, userId: session.id, courseId,
        title: cleanText(body.title, 160) || "Ask My Lecture", createdAt: now, updatedAt: now });
    }
    const response = NextResponse.json({ id: conversations ? id : null, courseId }, { status: 201 });
    return session.isNew ? attachSessionCookie(response, session.id) : response;
  } catch {
    return NextResponse.json({ error: "Invalid conversation payload." }, { status: 400 });
  }
}
