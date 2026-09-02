import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  id: string;
}) {
  return (
    <span className="relative inline-flex h-5 w-9 shrink-0">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
        aria-label={label}
      />
      <span
        className={cn(
          "absolute inset-0 rounded-[4px] transition-colors",
          checked ? "bg-gold-border" : "bg-border"
        )}
      />
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-4 rounded-[2px] bg-paper transition-transform",
          checked && "translate-x-[18px] bg-ink"
        )}
      />
      <span className="pointer-events-none absolute inset-0 rounded-[4px] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-terracotta peer-focus-visible:outline-offset-2" />
    </span>
  );
}
