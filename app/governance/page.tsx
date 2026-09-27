import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/site-header";
import { SAFETY_CONTRACTS } from "@/lib/vigil/safety";
import { Button } from "@/components/ui/button";
import { AGENT_META, GRAPH_ORDER } from "@/lib/vigil/types";

export default function GovernancePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Governance</p>
        <h1 className="mt-2 max-w-3xl font-display text-3xl tracking-tight sm:text-5xl">
          A model that cannot refuse a crisis is not a care product.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
          Vigil treats safety as a runtime, not a footer. The Sentinel node is deterministic
          and always precedes generation. The Governor is the last node and can demote a brief
          to a handoff. This page is the contract the graph actually runs — not a policy PDF.
        </p>

        <div className="mt-12 overflow-hidden rounded-xl shadow-[var(--shadow-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-5">Id</th>
                <th className="px-4 py-3 font-medium sm:px-5">Contract</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell sm:px-5">Rule</th>
              </tr>
            </thead>
            <tbody>
              {SAFETY_CONTRACTS.map((c) => (
                <tr key={c.id} className="border-t border-border bg-surface">
                  <td className="px-4 py-4 font-mono text-xs text-accent sm:px-5">{c.id}</td>
                  <td className="px-4 py-4 font-medium sm:px-5">
                    {c.name}
                    <p className="mt-1 font-normal text-muted sm:hidden">{c.rule}</p>
                  </td>
                  <td className="hidden px-4 py-4 text-muted sm:table-cell sm:px-5">{c.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Runtime</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            A typed state graph (nodes, ordered edges, reducers on a single{" "}
            <span className="font-mono text-fg">GraphState</span>) — the LangGraph pattern,
            implemented in-process so every specialist is observable. Specialists are logically
            parallel; live runs batch them into one structured completion to bound cost, then
            the Auditor and Governor run as deterministic nodes.
          </p>
          <ol className="mt-8 grid gap-2 sm:grid-cols-2">
            {GRAPH_ORDER.map((id, i) => (
              <li
                key={id}
                className="flex gap-4 rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]"
              >
                <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-medium">{AGENT_META[id].label}</p>
                  <p className="text-sm text-muted">{AGENT_META[id].role}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "Crisis is not a prompt",
              d: "Regex and pattern contracts fire before the API. Suicidal language, stroke signs, and respiratory failure never wait on a token.",
            },
            {
              t: "Gold traces for the demo families",
              d: "Elena, Jamal, and Priya replay reviewed briefs so the OS can be judged without spending inference. Edit the question to leave gold mode.",
            },
            {
              t: "Extractive fallback",
              d: "If the model is down, Vigil returns ranked corpus passages and refuses to paraphrase. Silence is safer than invention.",
            },
          ].map((x) => (
            <article key={x.t} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <h3 className="font-medium">{x.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{x.d}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8">
          <h2 className="font-display text-2xl tracking-tight">Scope</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Vigil is an educational product for family caregivers. It does not provide medical
            advice, diagnosis, or treatment. Emergency services and 988 (US) remain the correct
            path for crisis. Case files stay in this browser unless you submit a live question,
            in which case a snapshot is sent to generate a brief.
          </p>
          <div className="mt-6">
            <Link href="/console/elena">
              <Button>See the contracts on Elena&apos;s brief</Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
