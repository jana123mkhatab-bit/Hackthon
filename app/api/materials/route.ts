import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { COURSES } from "@/lib/mock-data";
import { getCollection } from "@/lib/db";
import { attachSessionCookie, ensureSession } from "@/lib/server-session";
import { cleanText, MAX_JSON_BYTES, MAX_TEXT_CHARS, tooLarge } from "@/lib/server-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await ensureSession();
  const courseId = new URL(request.url).searchParams.get("courseId")?.slice(0, 100);
  if (!courseId) return NextResponse.json({ error: "courseId is required." }, { status: 400 });
  const materials = await getCollection<Record<string, unknown>>("materials");
  const analyses = await getCollection<Record<string, unknown>>("lecture_analyses");
  const material = materials ? await materials.findOne(
    { userId: session.id, courseId }, { projection: { _id: 0 }, sort: { createdAt: -1 } }
  ) : null;
  if (material && analyses) {
    const analysis = await analyses.findOne(
      { userId: session.id, materialId: material.id },
      { projection: { _id: 0, result: 1 }, sort: { createdAt: -1 } }
    );
    if (analysis) material.analysis = analysis.result;
  }
  const response = NextResponse.json({ material: material ? {
    id: material.id, file_name: material.fileName,
    extracted_text: String(material.extractedText ?? "").slice(0, MAX_TEXT_CHARS),
    created_at: material.createdAt, analysis: material.analysis ?? null,
  } : null });
  return session.isNew ? attachSessionCookie(response, session.id) : response;
}

export async function POST(request: Request) {
  if (tooLarge(request, MAX_JSON_BYTES)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const session = await ensureSession();
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const courseId = cleanText(body.courseId, 100);
    const text = cleanText(body.text, MAX_TEXT_CHARS);
    if (!courseId || text.length < 20) return NextResponse.json(
      { error: "courseId and at least 20 characters of text are required." }, { status: 400 }
    );
    const materials = await getCollection("materials");
    const courses = await getCollection("courses");
    let materialId: string | null = null;
    if (materials && courses) {
      const course = COURSES.find((item) => item.id === courseId);
      const now = new Date();
      await courses.updateOne({ id: courseId, userId: session.id }, { $setOnInsert: {
        id: courseId, userId: session.id, code: course?.code ?? "",
        name: course?.name ?? (cleanText(body.courseName, 200) || courseId),
        subject: course?.subject ?? (cleanText(body.subject, 80) || "Other"),
        professor: course?.professor ?? cleanText(body.professor, 120),
        metadata: course ?? {}, createdAt: now, updatedAt: now,
      } }, { upsert: true });
      materialId = randomUUID();
      await materials.insertOne({ id: materialId, userId: session.id, courseId,
        fileName: cleanText(body.fileName, 200) || "Imported material",
        mimeType: cleanText(body.mimeType, 120) || "text/plain", extractedText: text,
        sizeBytes: text.length, createdAt: now });
    }
    const response = NextResponse.json({ id: materialId, courseId, fileName: cleanText(body.fileName, 200), text }, { status: 201 });
    return session.isNew ? attachSessionCookie(response, session.id) : response;
  } catch {
    return NextResponse.json({ error: "Invalid material payload." }, { status: 400 });
  }
}
