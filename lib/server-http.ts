import "server-only";
import { NextResponse } from "next/server";

export const MAX_JSON_BYTES = 256_000;
export const MAX_TEXT_CHARS = 150_000;

const buckets = new Map<string, { started: number; count: number }>();

/** Best-effort per-instance limiter; durable throttling should be added at the edge. */
export function rateLimited(key: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.started >= windowMs) {
    if (buckets.size > 1_000) {
      for (const [candidate, value] of buckets) {
        if (now - value.started >= windowMs) buckets.delete(candidate);
      }
    }
    buckets.set(key, { started: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

export function tooLarge(request: Request, max = MAX_JSON_BYTES): boolean {
  const length = Number(request.headers.get("content-length") || 0);
  return Number.isFinite(length) && length > max;
}

export function errorResponse(error: unknown, fallback = "Unable to process the request."): NextResponse {
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ error: message }, { status: 400 });
}

export function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
