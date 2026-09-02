import { cn } from "@/lib/utils";
import type { MasteryState } from "@/lib/types";
import { Check, TrendingUp, AlertTriangle, HelpCircle } from "lucide-react";

const CONFIG: Record<
  MasteryState,
  { label: string; classes: string; Icon: typeof Check }
> = {
  strong: { label: "Strong", classes: "bg-[rgba(110,127,94,0.14)] text-sage", Icon: Check },
  practicing: {
    label: "Practicing",
    classes: "bg-[rgba(223,186,75,0.18)] text-[#8a6a1a]",
    Icon: TrendingUp,
  },
  weak: { label: "Weak", classes: "bg-[rgba(193,80,62,0.14)] text-[#a8402c]", Icon: AlertTriangle },
  untested: { label: "Untested", classes: "bg-[rgba(146,142,137,0.14)] text-faint", Icon: HelpCircle },
};

export function MasteryBadge({
  state,
  className,
}: {
  state: MasteryState;
  className?: string;
}) {
  const { label, classes, Icon } = CONFIG[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[11px] font-bold uppercase tracking-wide",
        classes,
        className
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} />
      {label}
    </span>
  );
}
