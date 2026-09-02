import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCollection } from "@/lib/db";
import { attachSessionCookie, ensureSession } from "@/lib/server-session";
import { MAX_JSON_BYTES, tooLarge } from "@/lib/server-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await ensureSession();
  const plansCollection = await getCollection<Record<string, unknown>>("study_plans");
  const plans = plansCollection
    ? await plansCollection.find({ userId: session.id }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(10).toArray()
    : [];
  const sessions = await getCollection<Record<string, unknown>>("study_sessions");
  if (sessions) {
    for (const plan of plans) {
      plan.sessions = await sessions.find({ planId: plan.id }, { projection: { _id: 0, session: 1, id: 1 } })
        .sort({ id: 1 }).map((item) => item.session ?? item).toArray();
    }
  }
  const response = NextResponse.json({ plans: plans.map((plan) => ({
    id: plan.id, mode: plan.mode, preferences: plan.preferences, created_at: plan.createdAt, sessions: plan.sessions ?? [],
  })) });
  return session.isNew ? attachSessionCookie(response, session.id) : response;
}

export async function POST(request: Request) {
  if (tooLarge(request, MAX_JSON_BYTES)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const session = await ensureSession();
  try {
    const body = await request.json() as { mode?: unknown; preferences?: unknown; sessions?: unknown };
    const mode = body.mode === "normal" ? "normal" : "exam";
    const items = Array.isArray(body.sessions) ? body.sessions.slice(0, 200) : [];
    const plans = await getCollection("study_plans");
    const studySessions = await getCollection("study_sessions");
    if (plans && studySessions) {
      const id = randomUUID();
      const now = new Date();
      await plans.insertOne({ id, userId: session.id, mode,
        preferences: body.preferences && typeof body.preferences === "object" ? body.preferences : {},
        createdAt: now });
      if (items.length) {
        await studySessions.insertMany(items.filter((item) => item && typeof item === "object").map((item) => {
          const value = item as Record<string, unknown>;
          return { id: randomUUID(), planId: id, courseId: typeof value.courseId === "string" ? value.courseId.slice(0, 100) : "",
            session: value };
        }));
      }
    }
    const response = NextResponse.json({ ok: true }, { status: 201 });
    return session.isNew ? attachSessionCookie(response, session.id) : response;
  } catch {
    return NextResponse.json({ error: "Invalid study plan payload." }, { status: 400 });
  }
}
