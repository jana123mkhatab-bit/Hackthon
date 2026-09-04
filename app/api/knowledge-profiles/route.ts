import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { requireStudentId, UnauthorizedError } from "@/lib/server-session";
import type { KnowledgeProfileDoc } from "@/lib/models";

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
  const knowledgeProfiles = await getCollection<KnowledgeProfileDoc>("knowledgeProfiles");
  const filter: Record<string, unknown> = { studentId };
  if (courseId) filter.courseId = courseId;
  const rows = knowledgeProfiles ? await knowledgeProfiles.find(filter).toArray() : [];
  return NextResponse.json({ profiles: rows });
}
