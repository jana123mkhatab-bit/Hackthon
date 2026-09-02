import { NextResponse } from "next/server";
import { COURSES } from "@/lib/mock-data";
import { getCollection } from "@/lib/db";
import { attachSessionCookie, ensureSession } from "@/lib/server-session";
import { cleanText, tooLarge } from "@/lib/server-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await ensureSession();
  const { courseId } = await params;
  const courses = await getCollection<Record<string, unknown>>("courses");
  const row = await courses?.findOne({ userId: session.id, id: courseId },
    { projection: { _id: 0, id: 1, code: 1, name: 1, subject: 1, professor: 1, metadata: 1 } });
  const course = row
    ? { ...((row.metadata as Record<string, unknown> | null) ?? {}), ...row }
    : COURSES.find((item) => item.id === courseId) ?? null;
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  const response = NextResponse.json({ course });
  return session.isNew ? attachSessionCookie(response, session.id) : response;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  if (tooLarge(request)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const session = await ensureSession();
  const { courseId } = await params;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const courses = await getCollection<Record<string, unknown>>("courses");
    if (courses) {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      const name = cleanText(body.name, 200);
      const professor = cleanText(body.professor, 120);
      if (name) updates.name = name;
      if (professor) updates.professor = professor;
      if (body.metadata && typeof body.metadata === "object") {
        const metadata = body.metadata as Record<string, unknown>;
        for (const [key, value] of Object.entries(metadata).slice(0, 50)) {
          if (/^[A-Za-z][A-Za-z0-9_]{0,50}$/.test(key)) updates[`metadata.${key}`] = value;
        }
      }
      await courses.updateOne({ userId: session.id, id: courseId }, { $set: updates });
    }
    const response = NextResponse.json({ ok: true });
    return session.isNew ? attachSessionCookie(response, session.id) : response;
  } catch {
    return NextResponse.json({ error: "Invalid course payload." }, { status: 400 });
  }
}
