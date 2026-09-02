const MATERIAL_PREFIX = "studypilot:material:";
const MAX_MATERIAL_CHARS = 150_000;

export function getCourseMaterial(courseId: string): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(`${MATERIAL_PREFIX}${courseId}`) ?? "";
  } catch {
    return "";
  }
}

export async function getCourseMaterialAsync(courseId: string): Promise<string> {
  try {
    const response = await fetch(`/api/materials?courseId=${encodeURIComponent(courseId)}`);
    if (response.ok) {
      const payload = (await response.json()) as { material?: { extracted_text?: unknown } | null };
      if (typeof payload.material?.extracted_text === "string" && payload.material.extracted_text.trim()) {
        return payload.material.extracted_text.slice(0, MAX_MATERIAL_CHARS);
      }
    }
  } catch {
    // The local cache is intentionally retained for offline/demo mode.
  }
  return getCourseMaterial(courseId);
}

export function saveCourseMaterial(courseId: string, material: string): void {
  if (typeof window === "undefined") return;
  const text = material.slice(0, MAX_MATERIAL_CHARS);
  void fetch("/api/materials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, text, fileName: "Imported material", mimeType: "text/plain" }),
  }).catch(() => undefined);
  cacheCourseMaterial(courseId, text);
}

/** Cache only, used after /api/ai/analyze already persisted the material. */
export function cacheCourseMaterial(courseId: string, material: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${MATERIAL_PREFIX}${courseId}`, material.slice(0, MAX_MATERIAL_CHARS));
  } catch {
    // Storage can be unavailable or full; the current analysis still remains usable.
  }
}
