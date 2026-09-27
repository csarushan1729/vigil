"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentPipeline } from "@/components/vigil/pipeline";
import { CareGraph } from "@/components/vigil/care-graph";
import { BriefPanel } from "@/components/vigil/brief-panel";
import { runVigil } from "@/lib/vigil/run";
import { goldResult, isDefaultDemoQuery } from "@/lib/vigil/briefs";
import { useVigilStore } from "@/lib/vigil/store";
import type { CareCase, OrchestrationResult, TraceStatus } from "@/lib/vigil/types";
import { GRAPH_ORDER } from "@/lib/vigil/types";
import { cn } from "@/lib/utils";

type Tab = "file" | "run" | "brief";

export function CaseWorkspace({ careCase }: { careCase: CareCase }) {
  const saveRun = useVigilStore((s) => s.saveRun);
  const stored = useVigilStore((s) => s.lastRun[careCase.id]);
  const apiKey = useVigilStore((s) => s.apiKey);
  const [query, setQuery] = useState(careCase.defaultQuery);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(stored ?? null);
  const [revealed, setRevealed] = useState(GRAPH_ORDER.length);
  const [tab, setTab] = useState<Tab>("run");

  useEffect(() => {
    setQuery(careCase.defaultQuery);
    setResult(stored ?? null);
    setRevealed(GRAPH_ORDER.length);
  }, [careCase.id, careCase.defaultQuery, stored]);

  const statuses = useMemo(() => {
    const map: Record<string, TraceStatus> = {};
    for (const id of GRAPH_ORDER) map[id] = "idle";
    if (!result) return map;
    result.traces.forEach((t, i) => {
      if (i < revealed) map[t.agent] = t.status;
    });
    if (busy) {
      const next = result.traces[revealed];
      if (next) map[next.agent] = "running";
    }
    return map;
  }, [result, revealed, busy]);

  const visibleTraces = result ? result.traces.slice(0, revealed) : [];
  const briefReady = result && revealed >= result.traces.length;

  async function run() {
    setBusy(true);
    setRevealed(0);
    setTab("run");
    try {
      let next: OrchestrationResult | null = null;
      if (isDefaultDemoQuery(careCase, query)) {
        next = goldResult(careCase, query);
      }
      if (!next) {
        next = await runVigil({ careCase, query, apiKey });
      }
      saveRun(next);
      setResult(next);
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setRevealed(next.traces.length);
      } else {
        for (let i = 0; i < next.traces.length; i++) {
          const wait = Math.max(60, (next.traces[i]?.atMs ?? 0) - (next.traces[i - 1]?.atMs ?? 0));
          await new Promise((r) => setTimeout(r, Math.min(wait, 280)));
          setRevealed(i + 1);
        }
      }
      setTab("brief");
      requestAnimationFrame(() => {
        document.getElementById("vigil-brief")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Vigil could not finish this run.");
      setRevealed(GRAPH_ORDER.length);
    } finally {
      setBusy(false);
    }
  }

  const statusTone =
    careCase.status === "unstable" ? "warn" : careCase.status === "new" ? "accent" : "mute";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/console"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        All cases
      </Link>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone}>{careCase.status}</Badge>
            <span className="font-mono text-[11px] text-subtle">{careCase.setting}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
            {careCase.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {careCase.caregiver} · {careCase.conditionLine}
          </p>
        </div>
        <Button size="lg" onClick={() => void run()} disabled={busy || !query.trim()}>
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Play className="size-4" />}
          {busy ? "Running graph" : "Run Vigil"}
        </Button>
      </div>

      <div className="mt-6 flex gap-1 rounded-lg bg-surface p-1 shadow-[var(--shadow-border)] sm:hidden">
        {(["file", "run", "brief"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "h-11 flex-1 rounded-md text-sm capitalize",
              tab === t ? "bg-surface-2 text-fg" : "text-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className={cn("space-y-4", tab !== "file" && "max-sm:hidden")}>
          <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Case file
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{careCase.summary}</p>
            <ul className="mt-4 space-y-2">
              {careCase.medications.map((m) => (
                <li
                  key={m.name + m.dose}
                  className="flex flex-col rounded-md bg-surface-2 px-3 py-2 text-sm sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span className="font-medium text-fg">{m.name}</span>
                  <span className="text-muted">
                    {m.dose} · {m.schedule}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          {careCase.documents.map((d) => (
            <section
              key={d.id}
              className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                {d.kind} · {d.date}
              </p>
              <h3 className="mt-1 font-medium">{d.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d.body}</p>
            </section>
          ))}
          <CareGraph careCase={careCase} />
        </div>

        <div className="space-y-4">
          <section
            className={cn(
              "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
              tab !== "run" && "max-sm:hidden",
            )}
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Caregiver question
            </h2>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={5}
              className="mt-3 w-full resize-y rounded-md bg-surface-2 px-3 py-3 text-sm leading-relaxed text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus:shadow-[var(--shadow-border-hover)]"
            />
            <p className="mt-2 text-xs text-subtle">
              Demo questions replay a gold brief. Edit the question to run live retrieval and
              the model under the Governor.{" "}
              {apiKey ? "Using your saved xAI key." : "No key set — live runs use the extractive fallback."}
            </p>
            <div className="mt-4">
              <AgentPipeline
                statuses={statuses}
                active={visibleTraces.at(-1)?.agent}
              />
            </div>
            <ol className="mt-4 max-h-56 space-y-2 overflow-auto">
              {visibleTraces.map((t) => (
                <li key={t.id} className="flex gap-3 text-sm">
                  <span className="w-20 shrink-0 font-mono text-[11px] text-subtle">
                    {t.agent}
                  </span>
                  <span className="text-muted">
                    <span className="text-fg">{t.title}.</span> {t.detail}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <div id="vigil-brief" className={cn("scroll-mt-20", tab !== "brief" && "max-sm:hidden")}>
            {briefReady && result ? (
              <BriefPanel result={result} />
            ) : (
              <div className="rounded-xl bg-surface px-5 py-12 text-center shadow-[var(--shadow-border)]">
                <p className="font-display text-xl text-fg">No brief yet</p>
                <p className="mt-2 text-sm text-muted">
                  Run the graph to generate a grounded visit packet for {careCase.name}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
