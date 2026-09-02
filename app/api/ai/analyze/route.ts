import { NextResponse } from "next/server";
import { AIInputError, AIProviderError, analyzeLecture, extractMaterialText } from "@/lib/ai";
import { resolveCourse } from "@/lib/server-course";
import { sanitizeCourseInput } from "@/lib/server-course";
import { getCollection } from "@/lib/db";
import { attachSessionCookie, ensureSession } from "@/lib/server-session";
import { rateLimited } from "@/lib/server-http";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await ensureSession();
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > 10 * 1024 * 1024 + 64 * 1024) {
    return NextResponse.json({ error: "Uploads must be smaller than 10 MB." }, { status: 413 });
  }
  if (rateLimited(`analysis:${session.id}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many analysis requests. Please try again shortly." }, { status: 429 });
  }
  try {
    const form = await request.formData();
    const courseId = form.get("courseId");
    const fileName = form.get("fileName");
    const file = form.get("file");
    if (typeof courseId !== "string" || typeof fileName !== "string" || !(file instanceof File)) {
      return NextResponse.json({ error: "courseId, fileName, and a file are required." }, { status: 400 });
    }
    let course = await resolveCourse(courseId, session.id);
    if (!course) {
      const rawCourse = form.get("course");
      if (typeof rawCourse === "string") {
        try {
          course = sanitizeCourseInput(courseId, JSON.parse(rawCourse));
        } catch {
          course = null;
        }
      }
    }
    if (!course) throw new AIInputError("Unknown course.");
    const material = await extractMaterialText(file);
    const result = await analyzeLecture(courseId, fileName.slice(0, 200), material, course);
    const courses = await getCollection("courses");
    const materials = await getCollection("materials");
    const analyses = await getCollection("lecture_analyses");
    if (courses && materials && analyses) {
      const now = new Date();
      await courses.updateOne({ id: course.id, userId: session.id }, { $setOnInsert: {
        id: course.id, userId: session.id, code: course.code, name: course.name,
        subject: course.subject, professor: course.professor, metadata: course, createdAt: now, updatedAt: now,
      } }, { upsert: true });
      const materialId = randomUUID();
      await materials.insertOne({ id: materialId, userId: session.id, courseId,
        fileName: fileName.slice(0, 200), mimeType: file.type || "text/plain",
        extractedText: material, sizeBytes: file.size, createdAt: now });
      await analyses.insertOne({ id: randomUUID(), userId: session.id, materialId, courseId, result, createdAt: now });
    }
    const response = NextResponse.json({ ...result, material });
    return session.isNew ? attachSessionCookie(response, session.id) : response;
  } catch (error) {
    const status = error instanceof AIInputError ? 400 : error instanceof AIProviderError ? 502 : 500;
    const message =
      error instanceof AIProviderError
        ? "The analysis service is temporarily unavailable. Please try again."
        : error instanceof Error
          ? error.message
          : "Unable to analyze this material.";
    return NextResponse.json({ error: message }, { status });
  }
}
