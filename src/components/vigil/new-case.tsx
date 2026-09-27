"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useVigilStore } from "@/lib/vigil/store";
import type { CareCase } from "@/lib/vigil/types";

export function NewCaseForm({ onDone }: { onDone?: () => void }) {
  const upsert = useVigilStore((s) => s.upsertCase);
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("70");
  const [caregiver, setCaregiver] = useState("");
  const [summary, setSummary] = useState("");
  const [meds, setMeds] = useState("");
  const [query, setQuery] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const id = `c-${Date.now().toString(36)}`;
    const medications = meds
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [namePart, ...rest] = line.split(",");
        return {
          name: (namePart ?? "Medicine").trim(),
          dose: rest[0]?.trim() || "as listed",
          schedule: rest[1]?.trim() || "as listed",
          notes: rest.slice(2).join(",").trim() || undefined,
        };
      });
    const c: CareCase = {
      id,
      name: name.trim() || "Unnamed",
      age: Number(age) || 0,
      relationship: "Family",
      caregiver: caregiver.trim() || "You",
      setting: "Home",
      conditionLine: summary.trim().slice(0, 80) || "Custom case",
      summary: summary.trim(),
      status: "custom",
      medications,
      documents: [
        {
          id: `${id}-note`,
          title: "Caregiver note",
          kind: "note",
          date: "today",
          body: summary.trim(),
        },
      ],
      graph: {
        nodes: [
          { id: "p", label: name.trim() || "Person", kind: "person" },
          { id: "cg", label: caregiver.trim() || "Caregiver", kind: "person" },
        ],
        edges: [{ from: "cg", to: "p", label: "cares for" }],
      },
      defaultQuery: query.trim() || "What should I watch and what do I ask at the next visit?",
      isDemo: false,
    };
    upsert(c);
    onDone?.();
    router.push(`/console/${id}`);
  }

  const field =
    "mt-1 w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus:shadow-[var(--shadow-border-hover)]";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-muted">
          Name
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block text-sm text-muted">
          Age
          <input className={field} value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
      </div>
      <label className="block text-sm text-muted">
        Your name (caregiver)
        <input className={field} value={caregiver} onChange={(e) => setCaregiver(e.target.value)} />
      </label>
      <label className="block text-sm text-muted">
        What is going on
        <textarea
          className={field + " min-h-24"}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
          placeholder="Discharge, new symptoms, who lives in the house…"
        />
      </label>
      <label className="block text-sm text-muted">
        Medicines, one per line (name, dose, schedule)
        <textarea
          className={field + " min-h-24 font-mono text-xs"}
          value={meds}
          onChange={(e) => setMeds(e.target.value)}
          placeholder={"Lisinopril, 10 mg, morning\nIbuprofen, 400 mg, evening"}
        />
      </label>
      <label className="block text-sm text-muted">
        First question for Vigil
        <textarea
          className={field + " min-h-20"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Open case
      </Button>
      <p className="text-xs text-subtle">
        Stays in this browser. Do not paste identifiers you would not write on a paper list.
      </p>
    </form>
  );
}
