import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCollection, now } from "@/lib/db";
import { requireStudentId, UnauthorizedError } from "@/lib/server-session";
import { cleanText, MAX_JSON_BYTES, MAX_TEXT_CHARS, tooLarge } from "@/lib/server-http";
import { toAnalysisResult } from "@/lib/lecture-analysis";
import type { CourseDoc, LectureAnalysisDoc, MaterialDoc } from "@/lib/models";

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
  if (!courseId) return NextResponse.json({ error: "courseId is required." }, { status: 400 });

  const materials = await getCollection<MaterialDoc>("materials");
  const analyses = await getCollection<LectureAnalysisDoc>("lectureAnalyses");
  const material = await materials?.find({ studentId, courseId }).sort({ uploadDate: -1 }).limit(1).next();

  let analysis: unknown = null;
  if (material && analyses) {
    const analysisDoc = await analyses.find({ materialId: material._id }).sort({ generatedAt: -1 }).limit(1).next();
    if (analysisDoc) analysis = toAnalysisResult(analysisDoc, material.fileName);
  }

  return NextResponse.json({
    material: material
      ? {
          id: material._id,
          file_name: material.fileName,
          extracted_text: (material.extractedText ?? "").slice(0, MAX_TEXT_CHARS),
          created_at: material.uploadDate,
          analysis,
        }
      : null,
  });
}

export async function POST(request: Request) {
  if (tooLarge(request, MAX_JSON_BYTES)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  let studentId: string;
  try {
    studentId = await requireStudentId();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    throw error;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const courseId = cleanText(body.courseId, 100);
    const text = cleanText(body.text, MAX_TEXT_CHARS);
    if (!courseId || text.length < 20) {
      return NextResponse.json({ error: "courseId and at least 20 characters of text are required." }, { status: 400 });
    }

    const courses = await getCollection<CourseDoc>("courses");
    const owns = await courses?.findOne({ _id: courseId, studentId });
    if (!owns) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    const materials = await getCollection<MaterialDoc>("materials");
    const materialId = randomUUID();
    const material: MaterialDoc = {
      _id: materialId,
      studentId,
      courseId,
      fileName: cleanText(body.fileName, 200) || "Imported material",
      fileType: cleanText(body.mimeType, 120) || "text/plain",
      fileUrl: null,
      materialType: "notes",
      uploadDate: now(),
      processingStatus: "completed",
      extractedText: text,
    };
    await materials?.insertOne(material);

    return NextResponse.json({ id: materialId, courseId, fileName: material.fileName, text }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid material payload." }, { status: 400 });
  }
}
