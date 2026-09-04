import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCollection, now } from "@/lib/db";
import { requireStudentId, UnauthorizedError } from "@/lib/server-session";
import { cleanText, tooLarge } from "@/lib/server-http";
import type { ExamDoc } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXAM_TYPES = new Set(["quiz", "midterm", "final", "exam"]);
const PRIORITIES = new Set(["low", "medium", "high"]);

export async function GET(request: Request) {
  let studentId: string;
  try {
    studentId = await requireStudentId();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    throw error;
  }
  const courseId = new URL(request.url).searchParams.get("courseId")?.slice(0, 100);
  const exams = await getCollection<ExamDoc>("exams");
  const filter: Record<string, unknown> = { studentId };
  if (courseId) filter.courseId = courseId;
  const rows = exams ? await exams.find(filter).sort({ examDate: 1 }).toArray() : [];
  return NextResponse.json({ exams: rows });
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
    const courseId = cleanText(body.courseId, 100);
    const examDate = cleanText(body.examDate, 40);
    if (!courseId || !examDate) return NextResponse.json({ error: "courseId and examDate are required." }, { status: 400 });

    const courses = await getCollection<{ _id: string; studentId: string }>("courses");
    const owns = await courses?.findOne({ _id: courseId, studentId });
    if (!owns) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    const examTypeRaw = cleanText(body.examType, 10);
    const priorityRaw = cleanText(body.priority, 10);
    const exam: ExamDoc = {
      _id: randomUUID(),
      studentId,
      courseId,
      examType: EXAM_TYPES.has(examTypeRaw) ? (examTypeRaw as ExamDoc["examType"]) : "exam",
      examDate,
      priority: PRIORITIES.has(priorityRaw) ? (priorityRaw as ExamDoc["priority"]) : "medium",
      readinessScore: Math.min(100, Math.max(0, Math.round(Number(body.readinessScore) || 0))),
      createdAt: now(),
    };

    const exams = await getCollection<ExamDoc>("exams");
    await exams?.insertOne(exam);

    return NextResponse.json({ exam }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid exam payload." }, { status: 400 });
  }
}
