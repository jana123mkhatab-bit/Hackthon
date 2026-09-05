"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useToast, type ToastTone } from "@/lib/toast-context";
import { cn } from "@/lib/utils";

const TONE_CONFIG: Record<ToastTone, { bar: string; icon: typeof CheckCircle2; iconClass: string }> = {
  success: { bar: "bg-sage", icon: CheckCircle2, iconClass: "text-sage" },
  warning: { bar: "bg-terracotta", icon: AlertTriangle, iconClass: "text-terracotta" },
  info: { bar: "bg-gold-border", icon: Info, iconClass: "text-[#8a6a1a]" },
};

export function ToastViewport() {
  const { toasts, dismiss } = useToast();
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2.5 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[340px]">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { bar, icon: Icon, iconClass } = TONE_CONFIG[toast.tone];
          return (
            <motion.div
              key={toast.id}
              role="status"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, x: 8 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="adaptive-shadow pointer-events-auto relative w-full overflow-hidden rounded-[6px] border border-border bg-paper shadow-[0_4px_12px_rgba(44,43,41,0.12)]"
            >
              <div className={cn("absolute inset-y-0 left-0 w-1", bar)} />
              <div className="flex items-start gap-2.5 py-3 pl-4 pr-3">
                <Icon className={cn("mt-0.5 size-4 shrink-0", iconClass)} strokeWidth={2.25} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{toast.title}</p>
                  {toast.message && <p className="mt-0.5 text-xs text-body">{toast.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 text-faint transition-colors hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
