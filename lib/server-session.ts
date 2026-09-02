import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

export const SESSION_COOKIE = "studypilot_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 180;

export async function readSessionId(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/** Gets an anonymous session and creates its database user when possible. */
export async function ensureSession(): Promise<{ id: string; isNew: boolean }> {
  const existing = await readSessionId();
  if (existing && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existing)) {
    await ensureUserRow(existing);
    return { id: existing, isNew: false };
  }
  const id = randomUUID();
  await ensureUserRow(id);
  return { id, isNew: true };
}

export function attachSessionCookie(response: NextResponse, id: string): NextResponse {
  response.cookies.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

export async function ensureUserRow(id: string): Promise<void> {
  const users = await getCollection("users");
  if (!users) return;
  await users.updateOne(
    { id },
    { $setOnInsert: { id, sessionToken: id, createdAt: new Date(), updatedAt: new Date(), name: null } },
    { upsert: true }
  );
}

export async function sessionUserId(): Promise<string> {
  const { id } = await ensureSession();
  await ensureUserRow(id);
  return id;
}
