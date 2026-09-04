import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCollection, now } from "@/lib/db";
import { attachSessionCookie } from "@/lib/server-session";
import { createSessionToken, hashPassword } from "@/lib/auth-server";
import { MAX_JSON_BYTES, tooLarge, cleanText } from "@/lib/server-http";
import {
  defaultAcademicInfo,
  defaultLearningPreferences,
  defaultSettings,
  toPublicStudent,
  type Student,
} from "@/lib/models/student";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (tooLarge(request, MAX_JSON_BYTES)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const firstName = cleanText(body.firstName, 80);
  const lastName = cleanText(body.lastName, 80);
  const email = cleanText(body.email, 200).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const genderRaw = cleanText(body.gender, 10);
  const gender = genderRaw === "male" || genderRaw === "female" ? genderRaw : undefined;

  if (!firstName || !lastName) return NextResponse.json({ error: "First and last name are required." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const students = await getCollection<Student>("students");
  if (!students) return NextResponse.json({ error: "Database is unavailable." }, { status: 503 });

  const passwordHash = await hashPassword(password);
  const timestamp = now();
  const student: Student = {
    _id: randomUUID(),
    firstName,
    lastName,
    email,
    passwordHash,
    ...(gender ? { gender } : {}),
    academicInfo: defaultAcademicInfo(),
    learningPreferences: defaultLearningPreferences(),
    settings: defaultSettings(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  try {
    await students.insertOne(student);
  } catch (error) {
    const code = (error as { code?: number } | null)?.code;
    if (code === 11000) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }

  const token = await createSessionToken(student._id);
  const response = NextResponse.json({ student: toPublicStudent(student) }, { status: 201 });
  return attachSessionCookie(response, token);
}
