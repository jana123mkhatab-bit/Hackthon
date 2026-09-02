import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${value} out of ${max} emphasis stars`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < value ? "fill-gold-border text-gold-border" : "fill-transparent text-border"
          )}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}
