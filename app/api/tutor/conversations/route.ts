import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCollection } from "@/lib/db";
import { requireStudentId, UnauthorizedError } from "@/lib/server-session";
import { cleanText, tooLarge } from "@/lib/server-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  let studentId: string;
  try {
    studentId = await requireStudentId();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    throw error;
  }
  const courseId = new URL(request.url).searchParams.get("courseId")?.slice(0, 100);
  const conversations = await getCollection<Record<string, unknown>>("tutor_conversations");
  const filter: Record<string, unknown> = { studentId };
  if (courseId) filter.courseId = courseId;
  const rows = conversations
    ? await conversations.find(filter, { projection: { _id: 0 } }).sort({ updatedAt: -1 }).limit(20).toArray()
    : [];
  return NextResponse.json({
    conversations: rows.map((row) => ({
      id: row.id,
      course_id: row.courseId,
      title: row.title,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    })),
  });
}

export async function POST(request: Request) {
  if (tooLarge(request)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  let studentId: string;
  try {
    studentId = await requireStudentId();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    throw error;
  }
  try {
    const body = (await request.json()) as { courseId?: unknown; title?: unknown };
    const courseId = cleanText(body.courseId, 100);
    if (!courseId) return NextResponse.json({ error: "courseId is required." }, { status: 400 });
    const id = randomUUID();
    const conversations = await getCollection("tutor_conversations");
    if (conversations) {
      const timestamp = new Date();
      await conversations.insertOne({
        id,
        studentId,
        courseId,
        title: cleanText(body.title, 160) || "Ask My Lecture",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
    return NextResponse.json({ id: conversations ? id : null, courseId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid conversation payload." }, { status: 400 });
  }
}
