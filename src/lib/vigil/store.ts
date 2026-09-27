import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cloneDemoCases } from "./cases";
import type { CareCase, OrchestrationResult } from "./types";

interface VigilState {
  cases: CareCase[];
  lastRun: Record<string, OrchestrationResult>;
  apiKey: string | null;
  hydrateDemos: () => void;
  upsertCase: (c: CareCase) => void;
  saveRun: (r: OrchestrationResult) => void;
  setApiKey: (key: string | null) => void;
}

export const useVigilStore = create<VigilState>()(
  persist(
    (set, get) => ({
      cases: cloneDemoCases(),
      lastRun: {},
      apiKey: null,
      hydrateDemos: () => {
        const have = new Set(get().cases.map((c) => c.id));
        const missing = cloneDemoCases().filter((c) => !have.has(c.id));
        if (missing.length) set({ cases: [...missing, ...get().cases] });
      },
      upsertCase: (c) =>
        set({
          cases: [c, ...get().cases.filter((x) => x.id !== c.id)],
        }),
      saveRun: (r) => set({ lastRun: { ...get().lastRun, [r.caseId]: r } }),
      setApiKey: (key) => set({ apiKey: key && key.trim() ? key.trim() : null }),
    }),
    { name: "vigil-care-os" },
  ),
);
