"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, Sparkles, ClipboardList, BrainCircuit, Network } from "lucide-react";
import { NAV_ITEMS } from "@/components/app/nav-items";
import type { Course } from "@/lib/types";

interface CommandItem {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  href: string;
  category: "Pages" | "Courses" | "Actions" | "Topics";
}

function buildCommands(courses: Course[]): CommandItem[] {
  const pageCommands: CommandItem[] = NAV_ITEMS.map((item) => ({
    id: `page-${item.href}`,
    icon: <item.icon size={16} />,
    title: item.label,
    href: item.href,
    category: "Pages",
  }));

  const courseCommands: CommandItem[] = courses.map((course) => ({
    id: `course-${course.id}`,
    icon: <BookOpen size={16} />,
    title: `${course.code} — ${course.name}`,
    subtitle: course.professor,
    href: `/courses/${course.id}`,
    category: "Courses",
  }));

  const actionCommands: CommandItem[] = courses
    .filter((c) => c.hasMaterials)
    .flatMap((course) => [
      {
        id: `tutor-${course.id}`,
        icon: <BrainCircuit size={16} />,
        title: `Ask AI Tutor — ${course.code}`,
        href: `/courses/${course.id}/tutor`,
        category: "Actions" as const,
      },
      {
        id: `assessment-${course.id}`,
        icon: <ClipboardList size={16} />,
        title: `Take Assessment — ${course.code}`,
        href: `/courses/${course.id}/assessment`,
        category: "Actions" as const,
      },
      {
        id: `map-${course.id}`,
        icon: <Network size={16} />,
        title: `Knowledge Map — ${course.code}`,
        href: `/courses/${course.id}/knowledge-map`,
        category: "Actions" as const,
      },
    ]);

  const topicCommands: CommandItem[] = courses
    .flatMap((course) => course.concepts.filter((c) => c.state === "weak").map((concept) => ({ course, concept })))
    .sort((a, b) => a.concept.mastery - b.concept.mastery)
    .slice(0, 6)
    .map(({ course, concept }) => ({
      id: `topic-${course.id}-${concept.id}`,
      icon: <Sparkles size={16} />,
      title: concept.name,
      subtitle: `${course.code} · ${concept.mastery}% mastery`,
      href: "/knowledge",
      category: "Topics" as const,
    }));

  return [...pageCommands, ...courseCommands, ...actionCommands, ...topicCommands];
}

export function CommandPalette({ courses, onClose }: { courses: Course[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const allCommands = useMemo(() => buildCommands(courses), [courses]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = query.trim()
    ? allCommands.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  function go(item: CommandItem) {
    router.push(item.href);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIdx]) go(filtered[activeIdx]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    (acc[cmd.category] ??= []).push(cmd);
    return acc;
  }, {});

  let flatIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search and navigate"
    >
      <div
        className="adaptive-shadow flex w-full max-w-[540px] flex-col overflow-hidden rounded-[6px] border-2 border-ink bg-paper shadow-[0_12px_32px_rgba(44,43,41,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          <Search className="size-4 shrink-0 text-faint" />
          <input
            ref={inputRef}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
            placeholder="Search pages, courses, actions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Search"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-faint transition-colors hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2" role="listbox">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-1">
              <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-faint">
                {category}
              </div>
              {items.map((item) => {
                const idx = flatIdx++;
                const active = idx === activeIdx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    role="option"
                    aria-selected={active}
                    className={`flex w-full items-center gap-3 rounded-[4px] px-2.5 py-2.5 text-left transition-colors ${
                      active ? "bg-terracotta-tint text-terracotta" : "text-ink hover:bg-bg-warm"
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold">{item.title}</span>
                      {item.subtitle && (
                        <span className="truncate text-xs font-normal text-faint">{item.subtitle}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-2.5 py-6 text-center text-sm text-faint">No results for &ldquo;{query}&rdquo;</div>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border bg-bg-warm px-4 py-2.5 text-[11px] font-medium text-faint">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded-[3px] border border-border bg-paper px-1.5 py-0.5 font-sans">↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded-[3px] border border-border bg-paper px-1.5 py-0.5 font-sans">↵</kbd> Open
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded-[3px] border border-border bg-paper px-1.5 py-0.5 font-sans">Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}
