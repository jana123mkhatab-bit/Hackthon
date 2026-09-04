import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { attachSessionCookie } from "@/lib/server-session";
import { createSessionToken, verifyPassword } from "@/lib/auth-server";
import { MAX_JSON_BYTES, tooLarge, cleanText, rateLimited } from "@/lib/server-http";
import { toPublicStudent, type Student } from "@/lib/models/student";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INVALID_CREDENTIALS = { error: "Invalid email or password." } as const;

export async function POST(request: Request) {
  if (tooLarge(request, MAX_JSON_BYTES)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = cleanText(body.email, 200).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });

  if (rateLimited(`login:${email}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const students = await getCollection<Student>("students");
  if (!students) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });

  const student = await students.findOne({ email });
  if (!student) return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });

  const valid = await verifyPassword(password, student.passwordHash);
  if (!valid) return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });

  const token = await createSessionToken(student._id);
  const response = NextResponse.json({ student: toPublicStudent(student) });
  return attachSessionCookie(response, token);
}
