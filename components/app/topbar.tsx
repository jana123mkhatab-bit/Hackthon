"use client";

import Link from "next/link";
import { Flame, Search } from "lucide-react";
import { useCommandPalette } from "./command-palette-context";

/** Mobile-only top strip — the sidebar already carries branding on desktop. */
export function Topbar({ firstName, streakDays }: { firstName: string; streakDays: number }) {
  const { setOpen: setCommandPaletteOpen } = useCommandPalette();

  return (
    <header className="flex items-center justify-between border-b border-border bg-paper px-5 py-4 lg:hidden">
      <Link href="/dashboard" className="font-serif-display text-lg">
        StudyPilot AI
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Search"
          className="flex size-8 items-center justify-center rounded-full border border-border bg-bg-warm text-faint"
        >
          <Search className="size-3.5" />
        </button>
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
      </div>
    </header>
  );
}
