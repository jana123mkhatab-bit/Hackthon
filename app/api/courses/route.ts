import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCollection, now } from "@/lib/db";
import { requireStudentId, UnauthorizedError } from "@/lib/server-session";
import { getCoursesForStudent, mapCourseDoc } from "@/lib/server-course";
import { cleanText, tooLarge } from "@/lib/server-http";
import type { CourseDoc } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIORITIES = new Set(["low", "medium", "high"]);
const COLORS = new Set(["terracotta", "sage", "gold"]);

export async function GET() {
  let studentId: string;
  try {
    studentId = await requireStudentId();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    throw error;
  }
  const courses = await getCoursesForStudent(studentId);
  return NextResponse.json({ courses });
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
    const body = (await request.json()) as Record<string, unknown>;
    const courseName = cleanText(body.courseName ?? body.name, 200);
    if (!courseName) return NextResponse.json({ error: "courseName is required." }, { status: 400 });

    const priorityRaw = cleanText(body.priority, 10);
    const colorRaw = cleanText(body.color, 20);
    const timestamp = now();
    const courseDoc: CourseDoc = {
      _id: randomUUID(),
      studentId,
      courseName,
      courseCode: cleanText(body.courseCode ?? body.code, 40),
      instructor: cleanText(body.instructor ?? body.professor, 120),
      credits: Math.max(0, Math.round(Number(body.credits) || 0)),
      confidenceLevel: Math.min(5, Math.max(0, Math.round(Number(body.confidenceLevel) || 0))),
      priority: PRIORITIES.has(priorityRaw) ? (priorityRaw as CourseDoc["priority"]) : "medium",
      subject: cleanText(body.subject, 80) || undefined,
      color: COLORS.has(colorRaw) ? (colorRaw as CourseDoc["color"]) : undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const courses = await getCollection<CourseDoc>("courses");
    await courses?.insertOne(courseDoc);

    return NextResponse.json({ course: mapCourseDoc(courseDoc, [], undefined, false) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid course payload." }, { status: 400 });
  }
}
