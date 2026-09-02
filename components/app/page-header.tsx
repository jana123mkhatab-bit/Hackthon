import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-terracotta">{eyebrow}</span>
        )}
        <h1 className="font-serif-display text-[28px] leading-tight sm:text-[34px]">{title}</h1>
        {subtitle && <p className="max-w-2xl text-sm text-body sm:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
