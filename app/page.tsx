import Link from "next/link";
import { ArrowRight, ShieldCheck, GitBranch, BookOpen, Eye } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VigilMark } from "@/components/brand/logo";
import { DEMO_CASES } from "@/lib/vigil/cases";
import { AGENT_META, GRAPH_ORDER } from "@/lib/vigil/types";
import { PipelinePreview } from "@/components/vigil/pipeline";

export default function Home() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="stagger-in max-w-2xl">
              <p className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                <VigilMark className="size-4" />
                Care intelligence OS
              </p>
              <h1 className="font-display text-4xl leading-[1.12] tracking-tight text-fg sm:text-5xl lg:text-6xl">
                The hospital sent her home with nine bottles and a daughter.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Vigil is a governed multi-agent system for family caregivers. It retrieves
                cited teaching material, watches medication conflict classes, writes the
                questions for the next 15-minute visit, and refuses to pretend it is a
                doctor.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/console">
                  <Button size="lg">
                    Open the console
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/governance">
                  <Button size="lg" variant="ghost">
                    Read the contracts
                  </Button>
                </Link>
              </div>
            </div>
            <PipelinePreview />
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-border sm:grid-cols-4">
            {[
              { k: "63M", v: "US adults providing unpaid care" },
              { k: "11%", v: "received any training in daily care tasks" },
              { k: "10M", v: "projected health-worker shortfall by 2030" },
              { k: "0", v: "diagnoses Vigil is allowed to make" },
            ].map((s) => (
              <div key={s.k} className="bg-bg px-4 py-8 sm:px-6">
                <p className="font-display text-3xl tracking-tight text-fg sm:text-4xl">{s.k}</p>
                <p className="mt-2 text-sm text-muted">{s.v}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Why this exists</p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl tracking-tight sm:text-4xl">
            The last mile of medicine is a kitchen table. Nobody trained the person sitting at it.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: GitBranch,
                t: "Orchestration, not a chat box",
                d: "A typed state graph runs Sentinel → RAG → specialists → Auditor → Governor. You can watch every node. That is the product, not a hidden prompt.",
              },
              {
                icon: BookOpen,
                t: "Retrieval before generation",
                d: "Hybrid BM25 over a cited public-health corpus. Claims that cannot be grounded are labeled ungrounded, not dressed as advice.",
              },
              {
                icon: ShieldCheck,
                t: "Safety as code",
                d: "Crisis routing is deterministic and happens before any model call. Eight contracts fire on every brief. Emergency language never becomes a lifestyle tip.",
              },
            ].map((c) => (
              <article
                key={c.t}
                className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
              >
                <c.icon className="size-5 text-accent" strokeWidth={1.5} />
                <h3 className="mt-4 font-medium text-fg">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Walk a case
                </p>
                <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
                  Three families. One night watch.
                </h2>
              </div>
              <Link href="/console" className="text-sm text-accent hover:text-fg">
                All cases in the console
              </Link>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {DEMO_CASES.map((c) => (
                <Link
                  key={c.id}
                  href={`/console/${c.id}`}
                  className="group flex flex-col rounded-xl bg-bg p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                >
                  <div className="flex items-center justify-between">
                    <Badge tone={c.status === "unstable" ? "warn" : c.status === "new" ? "accent" : "mute"}>
                      {c.status}
                    </Badge>
                    <span className="font-mono text-[11px] text-subtle">{c.age} yrs</span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl tracking-tight">{c.name}</h3>
                  <p className="mt-1 text-sm text-muted">{c.caregiver}</p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{c.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm text-fg">
                    Open case
                    <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">The graph</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
            Ten nodes. One refusal to play doctor.
          </h2>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {GRAPH_ORDER.map((id, i) => {
              const m = AGENT_META[id];
              return (
                <li
                  key={id}
                  className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]"
                >
                  <p className="font-mono text-[11px] text-subtle">
                    {String(i + 1).padStart(2, "0")} · {m.lane}
                  </p>
                  <p className="mt-2 font-medium">{m.label}</p>
                  <p className="mt-1 text-sm text-muted">{m.role}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl tracking-tight">
                Run Elena. Then read the contracts.
              </h2>
              <p className="mt-3 text-muted">
                The demo cases replay gold-standard briefs so you can see the OS without
                waiting on a model. Custom questions go through live retrieval and the
                Governor.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/console/elena">
                <Button size="lg">
                  <Eye className="size-4" />
                  Run Elena
                </Button>
              </Link>
              <Link href="/governance">
                <Button size="lg" variant="outline">
                  Governance
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
