import { cn } from "@/lib/utils";
import type { MasteryState } from "@/lib/types";

const STATE_COLOR: Record<MasteryState, string> = {
  strong: "bg-state-strong",
  practicing: "bg-state-practice",
  weak: "bg-state-weak",
  untested: "bg-faint",
};

export function ProgressBar({
  value,
  state,
  className,
  trackClassName,
}: {
  value: number;
  state?: MasteryState;
  className?: string;
  trackClassName?: string;
}) {
  const color = state ? STATE_COLOR[state] : "bg-terracotta";
  return (
    <div
      className={cn("h-2.5 rounded-full bg-border overflow-hidden", trackClassName)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", color, className)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/** Monospace-ish tick meter, for a less "generic progress bar" feel where wanted. */
export function TickMeter({ value, state }: { value: number; state: MasteryState }) {
  const filled = Math.round((value / 100) * 15);
  const color =
    state === "strong" ? "text-sage" : state === "weak" ? "text-[#c1503e]" : "text-[#8a6a1a]";
  return (
    <div className={cn("flex gap-[2px]", color)}>
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className={cn("w-1.5 h-4", i < filled ? "bg-current" : "bg-border")}
        />
      ))}
    </div>
  );
}
