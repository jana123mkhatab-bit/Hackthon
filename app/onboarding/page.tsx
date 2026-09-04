"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { checkAuthenticated, setRedirectTarget } from "@/lib/auth";

type Mode = "signin" | "get-started";

const INPUT_CLASS =
  "rounded-[4px] border border-border bg-bg-warm px-3 py-2.5 text-sm text-ink outline-none ring-0 transition-colors focus:border-terracotta";

export default function OnboardingPage() {
  const router = useRouter();
  const [source, setSource] = useState<Mode>("get-started");
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticatedState] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextSource = params.get("source") === "signin" ? "signin" : "get-started";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSource(nextSource);

    let cancelled = false;
    async function check() {
      const isAuthed = await checkAuthenticated();
      if (cancelled) return;
      if (isAuthed && nextSource === "signin") {
        setRedirectTarget("/dashboard");
        router.replace("/dashboard");
        return;
      }
      setAuthenticatedState(isAuthed);
      setReady(true);
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) return;
    if (source === "get-started" && (!firstName.trim() || !lastName.trim())) {
      setError("First and last name are required.");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = source === "signin" ? "/api/auth/login" : "/api/auth/register";
      const body =
        source === "signin"
          ? { email: email.trim(), password }
          : { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Something went wrong. Please try again.");
        return;
      }
      const target = source === "signin" ? "/dashboard" : "/onboarding";
      setRedirectTarget(target);
      if (source === "signin") {
        router.replace(target);
      } else {
        setAuthenticatedState(true);
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return null;

  if (!authenticated) {
    const isSignin = source === "signin";
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6 py-12">
        <div className="w-full rounded-[8px] border border-border bg-paper p-7 shadow-[0_8px_24px_rgba(44,43,41,0.05)]">
          <div className="mb-6 flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-terracotta">
              {isSignin ? "Welcome back" : "Get started"}
            </span>
            <h1 className="font-serif-display text-[32px] leading-tight">
              {isSignin ? "Sign in to continue" : "Create your account"}
            </h1>
            <p className="text-sm text-body">
              {isSignin
                ? "Use your account to continue to the correct next step in your study flow."
                : "Tell us who you are — you'll set up your courses and preferences next."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isSignin && (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
                  First name
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Mariam"
                    className={INPUT_CLASS}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
                  Last name
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Mohamed"
                    className={INPUT_CLASS}
                  />
                </label>
              </div>
            )}

            <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@school.edu"
                className={INPUT_CLASS}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className={INPUT_CLASS}
              />
            </label>

            {error && <p className="text-sm text-terracotta">{error}</p>}

            <Button type="submit" className="mt-2 w-full justify-center" size="md" disabled={submitting}>
              {submitting ? "Please wait..." : isSignin ? "Continue to StudyPilot" : "Create Account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-faint">
            {isSignin ? (
              <>
                New here?{" "}
                <a href="/onboarding?source=get-started" className="font-semibold text-terracotta">
                  Create an account
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a href="/onboarding?source=signin" className="font-semibold text-terracotta">
                  Sign in
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  return <OnboardingWizard />;
}
