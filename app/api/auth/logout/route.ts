import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/server-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
