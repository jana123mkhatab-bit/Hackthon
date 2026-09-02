import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] border border-border px-2.5 py-1 text-[11px] text-body",
        className
      )}
      {...props}
    />
  );
}

export function ChipButton({
  className,
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] border px-3 py-2 text-[13px] font-medium transition-colors",
        active
          ? "border-terracotta bg-terracotta-tint text-terracotta"
          : "border-border text-body hover:border-faint hover:text-ink",
        className
      )}
      {...props}
    />
  );
}
