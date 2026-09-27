import type { CareCase, GraphNode } from "@/lib/vigil/types";
import { cn } from "@/lib/utils";

const KIND_X: Record<GraphNode["kind"], number> = {
  person: 18,
  condition: 36,
  medication: 54,
  symptom: 72,
  task: 54,
  place: 88,
};

const KIND_COLOR: Record<GraphNode["kind"], string> = {
  person: "var(--color-fg)",
  condition: "var(--color-accent)",
  medication: "var(--color-warn)",
  symptom: "var(--color-danger)",
  task: "var(--color-ok)",
  place: "var(--color-muted)",
};

export function CareGraph({ careCase, className }: { careCase: CareCase; className?: string }) {
  const { nodes, edges } = careCase.graph;
  const buckets = new Map<GraphNode["kind"], GraphNode[]>();
  for (const n of nodes) {
    const arr = buckets.get(n.kind) ?? [];
    arr.push(n);
    buckets.set(n.kind, arr);
  }
  const pos = new Map<string, { x: number; y: number }>();
  for (const n of nodes) {
    const list = buckets.get(n.kind) ?? [n];
    const i = list.findIndex((x) => x.id === n.id);
    const x = KIND_X[n.kind];
    const y = 18 + (i + 1) * (64 / (list.length + 1));
    pos.set(n.id, { x, y });
  }

  return (
    <div className={cn("overflow-hidden rounded-lg bg-surface-2", className)}>
      <svg viewBox="0 0 100 86" className="h-56 w-full sm:h-64" role="img" aria-label="Care graph">
        {edges.map((e, i) => {
          const a = pos.get(e.from);
          const b = pos.get(e.to);
          if (!a || !b) return null;
          return (
            <g key={`${e.from}-${e.to}-${i}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="currentColor"
                className="text-border-strong"
                strokeWidth="0.35"
              />
            </g>
          );
        })}
        {nodes.map((n) => {
          const p = pos.get(n.id);
          if (!p) return null;
          return (
            <g key={n.id}>
              <circle cx={p.x} cy={p.y} r="1.6" fill={KIND_COLOR[n.kind]} />
              <text
                x={p.x + 2.4}
                y={p.y + 1.1}
                fill="currentColor"
                className="text-muted"
                style={{ fontSize: "3.1px", fontFamily: "IBM Plex Sans, sans-serif" }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 border-t border-border px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-muted">
        {(["person", "condition", "medication", "symptom", "task"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ background: KIND_COLOR[k] }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
