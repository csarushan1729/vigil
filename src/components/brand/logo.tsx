import { cn } from "@/lib/utils";

export function VigilMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect x="15.15" y="8" width="1.7" height="16" rx="0.85" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 text-fg", className)}>
      <VigilMark />
      <span className="font-display text-xl tracking-tight">Vigil</span>
    </span>
  );
}
