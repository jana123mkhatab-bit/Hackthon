import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getStudentId } from "@/lib/server-session";
import { toPublicStudent, type Student } from "@/lib/models/student";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const studentId = await getStudentId();
  if (!studentId) return NextResponse.json({ student: null });

  const students = await getCollection<Student>("students");
  const student = await students?.findOne({ _id: studentId });
  if (!student) return NextResponse.json({ student: null });

  return NextResponse.json({ student: toPublicStudent(student) });
}
