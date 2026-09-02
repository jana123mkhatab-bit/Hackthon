import { NextResponse } from "next/server";
import { COURSES } from "@/lib/mock-data";
import { getCollection } from "@/lib/db";
import { attachSessionCookie, ensureSession } from "@/lib/server-session";
import { cleanText, tooLarge } from "@/lib/server-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await ensureSession();
  const coursesCollection = await getCollection<Record<string, unknown>>("courses");
  const rows = coursesCollection
    ? await coursesCollection.find({ userId: session.id }, { projection: { _id: 0, id: 1, code: 1, name: 1, subject: 1, professor: 1, metadata: 1 } }).sort({ createdAt: 1 }).toArray()
    : [];
  const courses = rows.length
    ? rows.map((row) => ({ ...row, ...((row.metadata as Record<string, unknown> | null) ?? {}) }))
    : COURSES;
  const response = NextResponse.json({ courses });
  return session.isNew ? attachSessionCookie(response, session.id) : response;
}

export async function POST(request: Request) {
  if (tooLarge(request)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const session = await ensureSession();
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = cleanText(body.id, 100);
    const name = cleanText(body.name, 200);
    if (!id || !name) return NextResponse.json({ error: "id and name are required." }, { status: 400 });
    const courses = await getCollection("courses");
    if (courses) {
      const now = new Date();
      await courses.updateOne(
        { id, userId: session.id },
        {
          $set: {
            code: cleanText(body.code, 40),
            name,
            subject: cleanText(body.subject, 80) || "Other",
            professor: cleanText(body.professor, 120),
            metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {},
            updatedAt: now,
          },
          $setOnInsert: { id, userId: session.id, createdAt: now },
        },
        { upsert: true }
      );
    }
    const response = NextResponse.json({ ok: true, course: { id, name } }, { status: 201 });
    return session.isNew ? attachSessionCookie(response, session.id) : response;
  } catch {
    return NextResponse.json({ error: "Invalid course payload." }, { status: 400 });
  }
}
