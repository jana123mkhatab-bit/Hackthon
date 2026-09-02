"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { STUDENT } from "@/lib/mock-data";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col justify-between border-r border-border bg-paper px-5 py-6 lg:flex">
      <div className="flex flex-col gap-8">
        <Link href="/dashboard" className="flex items-center gap-2 px-1">
          <span className="font-serif-display text-xl">StudyPilot AI</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-terracotta-tint text-terracotta"
                    : "text-body hover:bg-bg-warm hover:text-ink"
                )}
              >
                <Icon className="size-4" strokeWidth={2.25} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/dashboard"
          className="flex items-center justify-between rounded-[6px] border-2 border-ink bg-terracotta px-4 py-3 text-xs font-bold uppercase tracking-wide text-paper shadow-[0_4px_8px_rgba(44,43,41,0.07)] transition-colors hover:bg-[#c25f39]"
        >
          Continue Learning
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-[6px] border border-border bg-bg-warm p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-gold-bg text-sm font-bold text-terracotta">
            {STUDENT.firstName[0]}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{STUDENT.firstName}</span>
            <span className="text-[11px] text-faint">Signed in</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-terracotta">
          <Flame className="size-3.5" strokeWidth={2.5} />
          {STUDENT.streakDays}-day streak
        </div>
      </div>
    </aside>
  );
}
