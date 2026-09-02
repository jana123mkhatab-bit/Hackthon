import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCollection } from "@/lib/db";
import { attachSessionCookie, ensureSession } from "@/lib/server-session";
import { cleanText, tooLarge } from "@/lib/server-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await ensureSession();
  const { conversationId } = await params;
  const conversations = await getCollection("tutor_conversations");
  const messages = await getCollection<Record<string, unknown>>("tutor_messages");
  const owner = await conversations?.findOne({ id: conversationId, userId: session.id });
  const rows = owner && messages
    ? await messages.find({ conversationId }, { projection: { _id: 0 } }).sort({ createdAt: 1 }).limit(100).toArray()
    : [];
  const response = NextResponse.json({ messages: rows.map((row) => ({
    id: row.id, role: row.role, content: row.content, grounded_in: row.groundedIn, created_at: row.createdAt,
  })) });
  return session.isNew ? attachSessionCookie(response, session.id) : response;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  if (tooLarge(request)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const session = await ensureSession();
  const { conversationId } = await params;
  try {
    const body = await request.json() as { role?: unknown; content?: unknown; groundedIn?: unknown };
    const role = body.role === "assistant" || body.role === "user" ? body.role : "";
    const content = cleanText(body.content, 8_000);
    if (!role || !content) return NextResponse.json({ error: "role and content are required." }, { status: 400 });
    const conversations = await getCollection("tutor_conversations");
    const messages = await getCollection("tutor_messages");
    const owner = await conversations?.findOne({ id: conversationId, userId: session.id });
    if (conversations && messages) {
      if (!owner) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
      await messages.insertOne({ id: randomUUID(), conversationId, role, content,
        groundedIn: cleanText(body.groundedIn, 200) || null, createdAt: new Date() });
      await conversations.updateOne({ id: conversationId, userId: session.id }, { $set: { updatedAt: new Date() } });
    }
    const response = NextResponse.json({ ok: true }, { status: 201 });
    return session.isNew ? attachSessionCookie(response, session.id) : response;
  } catch {
    return NextResponse.json({ error: "Invalid message payload." }, { status: 400 });
  }
}
