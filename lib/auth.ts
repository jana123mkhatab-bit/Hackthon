const AUTH_KEY = "studypilot.auth.v1";
const REDIRECT_KEY = "studypilot.auth.redirect.v1";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_KEY) === "true";
}

export function setAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_KEY, String(value));
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
