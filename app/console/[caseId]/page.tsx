"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { CaseWorkspace } from "@/components/vigil/case-workspace";
import { useVigilStore } from "@/lib/vigil/store";
import { DEMO_CASES } from "@/lib/vigil/cases";

export default function CasePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const hydrate = useVigilStore((s) => s.hydrateDemos);
  const fromStore = useVigilStore((s) => s.cases.find((c) => c.id === caseId));
  const careCase = fromStore ?? DEMO_CASES.find((c) => c.id === caseId);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!careCase) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl">No case with that id</h1>
        <p className="mt-3 text-muted">It may have been local to another browser.</p>
        <Link href="/console" className="mt-6 inline-block text-sm text-accent hover:text-fg">
          Back to console
        </Link>
      </div>
    );
  }

  return <CaseWorkspace careCase={careCase} />;
}
