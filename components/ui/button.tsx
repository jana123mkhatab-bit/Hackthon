import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline-sage";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-terracotta text-paper border-2 border-ink shadow-[0_4px_8px_rgba(44,43,41,0.07)] hover:bg-[#c25f39]",
  secondary:
    "bg-paper text-ink border-[1.5px] border-border shadow-[0_2px_4px_rgba(44,43,41,0.06)] hover:border-[#cfc8b8]",
  ghost: "bg-transparent text-body hover:text-ink",
  "outline-sage":
    "bg-bg-sage-tint text-sage border border-sage hover:bg-[#e6ede2]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs gap-1.5",
  md: "px-6 py-3 text-sm gap-2",
  lg: "px-7 py-3.5 text-[15px] gap-2",
};

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    BaseProps {
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, href, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-[4px] font-bold font-sans uppercase tracking-wide transition-colors disabled:opacity-50 disabled:pointer-events-none",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
