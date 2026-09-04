import Link from "next/link";
import { Flame } from "lucide-react";

/** Mobile-only top strip — the sidebar already carries branding on desktop. */
export function Topbar({ firstName, streakDays }: { firstName: string; streakDays: number }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-paper px-5 py-4 lg:hidden">
      <Link href="/dashboard" className="font-serif-display text-lg">
        StudyPilot AI
      </Link>
      <Link
        href="/settings/accessibility"
        className="flex items-center gap-2 rounded-full border border-border bg-bg-warm py-1 pl-1 pr-3"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-gold-bg text-xs font-bold text-terracotta">
          {firstName[0]}
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-terracotta">
          <Flame className="size-3" strokeWidth={2.5} />
          {streakDays}
        </span>
      </Link>
    </header>
  );
}
