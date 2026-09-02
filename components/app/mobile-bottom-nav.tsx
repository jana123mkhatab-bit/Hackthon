"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

/**
 * Thumb-accessible bottom nav for narrow viewports — not a shrunk sidebar.
 * Fixed to the viewport bottom; app content adds bottom padding to clear it
 * (see AppShell's `pb-20 lg:pb-0`).
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-paper pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(44,43,41,0.06)] lg:hidden"
      aria-label="Primary"
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-[56px] flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold",
              active ? "text-terracotta" : "text-faint"
            )}
          >
            <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
