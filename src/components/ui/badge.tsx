import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "mute",
  className,
}: {
  children: ReactNode;
  tone?: "mute" | "ok" | "warn" | "danger" | "accent";
  className?: string;
}) {
  const tones = {
    mute: "text-muted shadow-[var(--shadow-border)]",
    ok: "text-ok shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-ok)_45%,transparent)]",
    warn: "text-warn shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warn)_45%,transparent)]",
    danger:
      "text-danger shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-danger)_50%,transparent)]",
    accent: "text-accent-fg bg-accent",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
