import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Plain paper card — the default surface for most panels. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "adaptive-shadow bg-paper border border-border rounded-[6px] shadow-[0_2px_4px_rgba(44,43,41,0.06)]",
        className
      )}
      {...props}
    />
  );
}

/** Index-card style with the signature red-ish top accent + washi tape, for "hero" content. */
export function AccentCard({
  className,
  accent = "terracotta",
  tape = true,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  accent?: "terracotta" | "sage" | "gold";
  tape?: boolean;
}) {
  const accentColor =
    accent === "sage" ? "bg-sage" : accent === "gold" ? "bg-gold-border" : "bg-terracotta";
  return (
    <div
      className={cn(
        "adaptive-shadow relative bg-paper border border-border rounded-[6px] shadow-[0_4px_8px_rgba(44,43,41,0.07)] overflow-visible",
        className
      )}
      {...props}
    >
      <div className={cn("absolute -top-px -left-px -right-px h-1 rounded-t-[6px]", accentColor)} />
      {tape && <div className="washi-tape" />}
      {children}
    </div>
  );
}

/** Handwritten-feel sticky note — reserved for AI-authored annotations. */
export function StickyNote({
  className,
  tone = "gold",
  rotate = "-rotate-1",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: "gold" | "terracotta";
  rotate?: string;
}) {
  const toneClasses =
    tone === "terracotta"
      ? "bg-terracotta-tint border-terracotta"
      : "bg-gold-bg border-gold-border";
  return (
    <div
      className={cn(
        "adaptive-shadow relative border p-4 shadow-[0_2px_4px_rgba(44,43,41,0.06)] font-hand text-[17px] leading-snug",
        toneClasses,
        rotate,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-bg-sage-tint border border-border rounded-[6px] p-6",
        className
      )}
      {...props}
    />
  );
}
