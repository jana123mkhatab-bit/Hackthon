import { NextResponse } from "next/server";
import { getCollection, now } from "@/lib/db";
import { requireStudentId, UnauthorizedError } from "@/lib/server-session";
import { getCourseForStudent } from "@/lib/server-course";
import { cleanText, tooLarge } from "@/lib/server-http";
import type { CourseDoc } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIORITIES = new Set(["low", "medium", "high"]);
const COLORS = new Set(["terracotta", "sage", "gold"]);

export async function GET(_request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  let studentId: string;
  try {
    studentId = await requireStudentId();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    throw error;
  }
  const { courseId } = await params;
  const course = await getCourseForStudent(studentId, courseId);
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  return NextResponse.json({ course });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  if (tooLarge(request)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  let studentId: string;
  try {
    studentId = await requireStudentId();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    throw error;
  }
  const { courseId } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updates: Partial<CourseDoc> = { updatedAt: now() };

    const courseName = cleanText(body.courseName ?? body.name, 200);
    const courseCode = cleanText(body.courseCode ?? body.code, 40);
    const instructor = cleanText(body.instructor ?? body.professor, 120);
    const subject = cleanText(body.subject, 80);
    const priorityRaw = cleanText(body.priority, 10);
    const colorRaw = cleanText(body.color, 20);

    if (courseName) updates.courseName = courseName;
    if (courseCode) updates.courseCode = courseCode;
    if (instructor) updates.instructor = instructor;
    if (subject) updates.subject = subject;
    if (PRIORITIES.has(priorityRaw)) updates.priority = priorityRaw as CourseDoc["priority"];
    if (COLORS.has(colorRaw)) updates.color = colorRaw as CourseDoc["color"];
    if (body.credits !== undefined) updates.credits = Math.max(0, Math.round(Number(body.credits) || 0));
    if (body.confidenceLevel !== undefined) {
      updates.confidenceLevel = Math.min(5, Math.max(0, Math.round(Number(body.confidenceLevel) || 0)));
    }

    const courses = await getCollection<CourseDoc>("courses");
    await courses?.updateOne({ _id: courseId, studentId }, { $set: updates });

    const course = await getCourseForStudent(studentId, courseId);
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
    return NextResponse.json({ ok: true, course });
  } catch {
    return NextResponse.json({ error: "Invalid course payload." }, { status: 400 });
  }
}
