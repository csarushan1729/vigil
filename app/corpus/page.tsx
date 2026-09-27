"use client";

import { useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/layout/site-header";
import { CORPUS } from "@/lib/vigil/corpus";
import { retrieve } from "@/lib/vigil/retrieve";

export default function CorpusPage() {
  const [q, setQ] = useState("ibuprofen heart failure apixaban");
  const ranked = useMemo(() => {
    if (!q.trim()) return CORPUS.map((chunk) => ({ chunk, score: 0, why: "browse" }));
    return retrieve(q, null, 12);
  }, [q]);

  const topics = [...new Set(CORPUS.map((c) => c.topic))];

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Retrieval corpus
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
          What the retriever is allowed to know
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          {CORPUS.length} educational chunks, cited to public-health sources. Hybrid BM25 with
          query expansion. The model may only speak through these ids — or label a claim as
          ungrounded.
        </p>

        <label className="mt-8 block text-sm text-muted">
          Probe the index
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-2 h-11 w-full rounded-md bg-surface px-3 text-sm text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus:shadow-[var(--shadow-border-hover)]"
            placeholder="weight gain pillows ibuprofen"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setQ(t)}
              className="rounded-full px-3 py-1.5 text-xs text-muted shadow-[var(--shadow-border)] hover:text-fg"
            >
              {t}
            </button>
          ))}
        </div>

        <ol className="mt-8 space-y-3">
          {ranked.map((r, i) => (
            <li
              key={r.chunk.id}
              className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[11px] text-subtle">
                  {String(i + 1).padStart(2, "0")} · {r.chunk.id}
                  {r.score ? ` · ${r.score.toFixed(2)}` : ""}
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{r.chunk.topic}</p>
              </div>
              <h2 className="mt-2 font-medium text-fg">{r.chunk.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.chunk.body}</p>
              <a
                href={r.chunk.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs text-accent hover:text-fg"
              >
                {r.chunk.source}
              </a>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </div>
  );
}
