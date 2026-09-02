"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import {
  isAuthenticated,
  setAuthenticated,
  setRedirectTarget,
} from "@/lib/auth";

export default function OnboardingPage() {
  const router = useRouter();
  const [source, setSource] = useState<"signin" | "get-started">("get-started");
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextSource = params.get("source") === "signin" ? "signin" : "get-started";
    setSource(nextSource);

    if (isAuthenticated()) {
      const target = nextSource === "signin" ? "/dashboard" : "/onboarding";
      setRedirectTarget(target);
      router.replace(target);
      return;
    }

    setReady(true);
  }, [router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setAuthenticated(true);
    const target = source === "signin" ? "/dashboard" : "/onboarding";
    setRedirectTarget(target);
    router.replace(target);
  };

  if (!ready) return null;

  if (!isAuthenticated()) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6 py-12">
        <div className="w-full rounded-[8px] border border-border bg-paper p-7 shadow-[0_8px_24px_rgba(44,43,41,0.05)]">
          <div className="mb-6 flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-terracotta">
              Welcome back
            </span>
            <h1 className="font-serif-display text-[32px] leading-tight">Sign in to continue</h1>
            <p className="text-sm text-body">
              Use your account to continue to the correct next step in your study flow.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@school.edu"
                className="rounded-[4px] border border-border bg-bg-warm px-3 py-2.5 text-sm text-ink outline-none ring-0 transition-colors focus:border-terracotta"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="rounded-[4px] border border-border bg-bg-warm px-3 py-2.5 text-sm text-ink outline-none ring-0 transition-colors focus:border-terracotta"
              />
            </label>

            <Button type="submit" className="mt-2 w-full justify-center" size="md">
              Continue to StudyPilot
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <OnboardingWizard />;
}
