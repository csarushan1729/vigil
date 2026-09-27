import { AGENT_META, GRAPH_ORDER } from "@/lib/vigil/types";
import { cn } from "@/lib/utils";

export function PipelinePreview() {
  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Graph runtime
        </p>
        <span className="flex items-center gap-2 font-mono text-[11px] text-ok">
          <span className="size-1.5 rounded-full bg-ok node-live" />
          live
        </span>
      </div>
      <svg viewBox="0 0 360 70" className="mb-4 h-12 w-full text-muted" aria-hidden="true">
        <path
          className="ecg-line"
          d="M0 40 H40 L52 40 L60 12 L70 58 L80 40 H140 L152 40 L160 22 L172 52 L180 40 H360"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-2">
        {GRAPH_ORDER.map((id, i) => {
          const m = AGENT_META[id];
          const on = i < 4;
          return (
            <li
              key={id}
              className={cn(
                "flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs",
                on ? "bg-surface-2 text-fg" : "text-muted",
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  on ? "bg-ok" : "bg-subtle",
                )}
              />
              {m.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AgentPipeline({
  active,
  statuses,
}: {
  active?: string;
  statuses: Record<string, "idle" | "running" | "ok" | "warn" | "blocked">;
}) {
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {GRAPH_ORDER.map((id) => {
        const m = AGENT_META[id];
        const st = statuses[id] ?? "idle";
        return (
          <li
            key={id}
            className={cn(
              "rounded-md px-3 py-2 shadow-[var(--shadow-border)] transition-colors duration-200",
              st === "running" || active === id ? "bg-surface-2" : "bg-surface",
            )}
          >
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  st === "ok" && "bg-ok",
                  st === "warn" && "bg-warn",
                  st === "blocked" && "bg-danger",
                  st === "running" && "bg-accent node-live",
                  st === "idle" && "bg-subtle",
                )}
              />
              {st}
            </p>
            <p className="mt-1 text-sm font-medium text-fg">{m.label}</p>
          </li>
        );
      })}
    </ol>
  );
}
