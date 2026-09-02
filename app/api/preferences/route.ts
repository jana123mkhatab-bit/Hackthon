import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { attachSessionCookie, ensureSession } from "@/lib/server-session";
import { MAX_JSON_BYTES, tooLarge } from "@/lib/server-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await ensureSession();
  const preferencesCollection = await getCollection<{ preferences: unknown }>("user_preferences");
  const row = await preferencesCollection?.findOne(
    { userId: session.id },
    { projection: { _id: 0, preferences: 1 } }
  );
  const response = NextResponse.json({ preferences: row?.preferences ?? null });
  return session.isNew ? attachSessionCookie(response, session.id) : response;
}

export async function PUT(request: Request) {
  if (tooLarge(request, MAX_JSON_BYTES)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const session = await ensureSession();
  try {
    const body = (await request.json()) as { name?: unknown; preferences?: unknown };
    const preferences = body.preferences && typeof body.preferences === "object" ? body.preferences : {};
    const users = await getCollection("users");
    const preferenceCollection = await getCollection<Record<string, unknown>>("user_preferences");
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
    if (users && name) await users.updateOne({ id: session.id }, { $set: { name, updatedAt: new Date() } });
    if (preferenceCollection) {
      const existing = await preferenceCollection.findOne({ userId: session.id });
      const merged = {
        ...(existing?.preferences && typeof existing.preferences === "object" ? existing.preferences : {}),
        ...preferences,
      };
      await preferenceCollection.updateOne(
        { userId: session.id },
        { $set: { preferences: merged, updatedAt: new Date() }, $setOnInsert: { userId: session.id } },
        { upsert: true }
      );
    }
    const response = NextResponse.json({ ok: true });
    return session.isNew ? attachSessionCookie(response, session.id) : response;
  } catch {
    return NextResponse.json({ error: "Invalid preferences payload." }, { status: 400 });
  }
}
