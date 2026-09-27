import type { EvidenceBrief, OrchestrationResult } from "@/lib/vigil/types";
import { citationSource, citationTitle } from "@/lib/vigil/graph";
import { CORPUS_BY_ID } from "@/lib/vigil/corpus";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function Severity({ s }: { s: "info" | "watch" | "urgent" }) {
  return (
    <Badge tone={s === "urgent" ? "danger" : s === "watch" ? "warn" : "mute"}>
      {s}
    </Badge>
  );
}

export function BriefPanel({
  result,
  className,
}: {
  result: OrchestrationResult;
  className?: string;
}) {
  const b = result.brief;
  return (
    <article
      className={cn(
        "rounded-xl bg-paper text-ink shadow-[var(--shadow-paper)]",
        className,
      )}
    >
      <header className="border-b border-ink/10 px-5 py-5 sm:px-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          Evidence brief · {result.source} · {result.intent.replaceAll("_", " ")}
        </p>
        <h2 className="mt-3 font-display text-2xl leading-snug tracking-tight text-ink sm:text-3xl">
          {b.headline}
        </h2>
        {result.crisis.level !== "none" && (
          <p className="mt-3 border-l-2 border-danger pl-3 text-sm text-ink">
            {result.crisis.action}
          </p>
        )}
      </header>
      <div className="space-y-6 px-5 py-6 sm:px-7">
        <p className="text-[15px] leading-relaxed text-ink">{b.plainLanguage}</p>
        <p className="text-sm italic text-ink-muted">{b.whatThisIsNot}</p>

        <section>
          <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
            Findings
          </h3>
          <ul className="mt-3 space-y-4">
            {b.findings.map((f) => (
              <li key={f.title} className="rounded-md bg-ink/[0.04] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Severity s={f.severity} />
                  <p className="font-medium text-ink">{f.title}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{f.body}</p>
                {f.citations.length > 0 && (
                  <p className="mt-2 font-mono text-[11px] text-ink-muted">
                    {f.citations.map((id) => citationTitle(id)).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <List title="Red flags — skip the brief" items={b.redFlags} />
          <List title="Ask your clinician" items={b.askYourClinician} />
          <List title="Next 72 hours" items={b.next72h} />
          <List title="Next 7 days" items={b.next7d} />
        </div>

        {b.caregiverNote && (
          <p className="border-t border-ink/10 pt-5 font-display text-lg leading-snug text-ink">
            {b.caregiverNote}
          </p>
        )}

        {b.ungrounded.length > 0 && (
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
              Ungrounded — not treated as fact
            </h3>
            <ul className="mt-2 list-disc pl-4 text-sm text-ink-muted">
              {b.ungrounded.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
        )}

        <Citations brief={b} />
      </div>
    </article>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">{title}</h3>
      <ol className="mt-2 space-y-2">
        {items.map((item, i) => (
          <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink/85">
            <span className="font-mono text-[11px] text-ink-muted">{i + 1}.</span>
            {item}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Citations({ brief }: { brief: EvidenceBrief }) {
  const ids = [...new Set(brief.citations)];
  if (!ids.length) return null;
  return (
    <section className="border-t border-ink/10 pt-5">
      <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
        Grounding
      </h3>
      <ol className="mt-3 space-y-2">
        {ids.map((id) => {
          const c = CORPUS_BY_ID[id];
          return (
            <li key={id} className="text-xs leading-relaxed text-ink-muted">
              <span className="font-mono text-ink/70">{id}</span>
              {" — "}
              {c ? (
                <a
                  href={c.sourceUrl}
                  className="underline decoration-ink/20 underline-offset-2 hover:text-ink"
                  target="_blank"
                  rel="noreferrer"
                >
                  {citationTitle(id)} · {citationSource(id)}
                </a>
              ) : (
                citationTitle(id)
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
