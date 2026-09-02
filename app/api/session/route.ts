import { NextResponse } from "next/server";
import { attachSessionCookie, ensureSession } from "@/lib/server-session";
import { getCollection } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await ensureSession();
  let user: Record<string, unknown> = { id: session.id, name: null };
  const users = await getCollection<{ id: string; name: string | null }>("users");
  const row = await users?.findOne({ id: session.id }, { projection: { _id: 0, id: 1, name: 1 } });
  if (row) user = row;
  const response = NextResponse.json({ user, anonymous: true });
  return session.isNew ? attachSessionCookie(response, session.id) : response;
}
