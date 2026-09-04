const REDIRECT_KEY = "studypilot.auth.redirect.v1";

/** Asks the server whether the current session cookie belongs to a real, logged-in student. */
export async function checkAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/me");
    if (!response.ok) return false;
    const payload = (await response.json()) as { student?: unknown };
    return Boolean(payload.student);
  } catch {
    return false;
  }
}

export function getRedirectTarget(): string {
  if (typeof window === "undefined") return "/dashboard";
  const value = window.localStorage.getItem(REDIRECT_KEY);
  return value && value.startsWith("/") ? value : "/dashboard";
}

export function setRedirectTarget(target: string) {
  if (typeof window === "undefined") return;
  const nextTarget = target && target.startsWith("/") ? target : "/dashboard";
  window.localStorage.setItem(REDIRECT_KEY, nextTarget);
}

export function clearRedirectTarget() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REDIRECT_KEY);
}
