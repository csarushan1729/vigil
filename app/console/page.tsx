"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewCaseForm } from "@/components/vigil/new-case";
import { useVigilStore } from "@/lib/vigil/store";
import { DEMO_CASES } from "@/lib/vigil/cases";

export default function ConsoleIndex() {
  const cases = useVigilStore((s) => s.cases);
  const hydrate = useVigilStore((s) => s.hydrateDemos);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  const list = ready ? cases : DEMO_CASES;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Console</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
            Open a case file
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Start with a gold-standard family, or paste a kitchen-table list. Vigil never
            stores this outside your browser unless you run a live question.
          </p>
        </div>
        <Button variant={open ? "ghost" : "primary"} onClick={() => setOpen((v) => !v)}>
          <Plus className="size-4" />
          {open ? "Close form" : "New case"}
        </Button>
      </div>

      {open && (
        <div className="mt-8 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <NewCaseForm onDone={() => setOpen(false)} />
        </div>
      )}

      <ul className="mt-8 grid gap-4 lg:grid-cols-3">
        {list.map((c) => (
          <li key={c.id}>
            <Link
              href={`/console/${c.id}`}
              className="group flex h-full flex-col rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge
                  tone={
                    c.status === "unstable" ? "warn" : c.status === "new" ? "accent" : "mute"
                  }
                >
                  {c.status}
                </Badge>
                <span className="font-mono text-[11px] text-subtle">
                  {c.medications.length} meds
                </span>
              </div>
              <h2 className="mt-4 font-display text-2xl tracking-tight">{c.name}</h2>
              <p className="mt-1 text-sm text-muted">{c.caregiver}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{c.summary}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm text-fg">
                Open
                <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
