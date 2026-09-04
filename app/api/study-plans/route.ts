import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCollection, now } from "@/lib/db";
import { requireStudentId, UnauthorizedError } from "@/lib/server-session";
import { MAX_JSON_BYTES, tooLarge } from "@/lib/server-http";
import { toStudySessionDocs, toStudySessions } from "@/lib/study-plan-mapper";
import type { StudyPlanDoc } from "@/lib/models";
import type { StudySession } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let studentId: string;
  try {
    studentId = await requireStudentId();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    throw error;
  }
  const plans = await getCollection<StudyPlanDoc>("studyPlans");
  const rows = plans ? await plans.find({ studentId }).sort({ createdAt: -1 }).limit(10).toArray() : [];
  return NextResponse.json({
    plans: rows.map((plan) => ({
      id: plan._id,
      mode: plan.mode,
      created_at: plan.createdAt,
      sessions: toStudySessions(plan.sessions),
    })),
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
    const body = (await request.json()) as { mode?: unknown; sessions?: unknown };
    const mode = body.mode === "normal" ? "normal" : "exam";
    const sessions = (Array.isArray(body.sessions) ? body.sessions.slice(0, 200) : []) as StudySession[];

    const plans = await getCollection<StudyPlanDoc>("studyPlans");
    const timestamp = now();
    const today = timestamp.toISOString().slice(0, 10);
    const endDate = new Date(timestamp.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const plan: StudyPlanDoc = {
      _id: randomUUID(),
      studentId,
      mode,
      startDate: today,
      endDate,
      status: "active",
      sessions: toStudySessionDocs(sessions),
      createdAt: timestamp,
    };
    await plans?.insertOne(plan);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid study plan payload." }, { status: 400 });
  }
}
