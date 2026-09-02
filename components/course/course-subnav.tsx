"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function CourseSubnav({ courseId }: { courseId: string }) {
  const pathname = usePathname();
  const base = `/courses/${courseId}`;
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/professor-focus`, label: "Professor Focus" },
    { href: `${base}/knowledge-map`, label: "Knowledge Map" },
    { href: `${base}/exam-analysis`, label: "Exam Analysis" },
    { href: `${base}/tutor`, label: "Ask My Lecture" },
  ];

  return (
    <div className="-mx-5 flex gap-1 overflow-x-auto border-b border-border px-5 md:mx-0 md:px-0">
      {tabs.map((t) => {
        const active = t.href === base ? pathname === base : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "shrink-0 border-b-2 px-3 py-3 text-sm font-semibold whitespace-nowrap transition-colors",
              active ? "border-terracotta text-terracotta" : "border-transparent text-faint hover:text-ink"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
