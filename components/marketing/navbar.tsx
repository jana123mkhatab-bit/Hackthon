"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#professor-focus", label: "Professor Focus" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-transparent bg-bg-warm/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 md:px-20">
        <Link href="/" className="flex items-center gap-2.5 font-serif-display text-2xl">
          <PenLine className="size-6 text-terracotta" strokeWidth={2} />
          StudyPilot AI
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-body hover:text-ink">
              {l.label}
            </a>
          ))}
          <Button href="/onboarding?source=signin" variant="secondary" size="sm" className="normal-case font-semibold">
            Sign In
          </Button>
          <Button href="/onboarding?source=get-started" size="sm">
            Get Started
          </Button>
        </div>

        <button
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-border bg-paper px-6 py-4 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-[4px] px-2 py-2.5 text-sm font-medium text-body"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2 flex gap-2">
            <Button href="/onboarding?source=signin" variant="secondary" size="sm" className="flex-1 normal-case font-semibold">
              Sign In
            </Button>
            <Button href="/onboarding?source=get-started" size="sm" className="flex-1">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
