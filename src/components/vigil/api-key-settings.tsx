"use client";

import { useEffect, useRef, useState } from "react";
import { KeyRound, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useVigilStore } from "@/lib/vigil/store";
import { cn } from "@/lib/utils";

export function ApiKeySettings() {
  const apiKey = useVigilStore((s) => s.apiKey);
  const setApiKey = useVigilStore((s) => s.setApiKey);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) setDraft(apiKey ?? "");
  }, [open, apiKey]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const hasKey = mounted && !!apiKey;

  function save() {
    setApiKey(draft);
    toast.success(draft.trim() ? "Key saved for this browser." : "Key cleared.");
    setOpen(false);
  }

  function clear() {
    setApiKey(null);
    setDraft("");
    toast("Key cleared.");
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium shadow-[var(--shadow-border)] transition-colors",
          hasKey ? "text-accent" : "text-muted hover:text-fg",
        )}
      >
        <KeyRound className="size-3.5" />
        {hasKey ? "Your key active" : "Add xAI key"}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl bg-surface p-4 shadow-[var(--shadow-border-hover)]">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Bring your own key
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Paste an xAI API key to run live questions through the real model instead of the
            extractive fallback. Stored only in this browser (localStorage) and sent directly
            to Vigil&apos;s server action on each run — never logged or saved server-side.
          </p>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="xai-••••••••••••••••"
            className="mt-3 h-10 w-full rounded-md bg-surface-2 px-3 font-mono text-xs text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus:shadow-[var(--shadow-border-hover)]"
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <a
              href="https://console.x.ai"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:text-fg"
            >
              Get a key at console.x.ai
            </a>
            <div className="flex gap-2">
              {hasKey && (
                <Button type="button" variant="ghost" size="sm" onClick={clear}>
                  <X className="size-3.5" />
                  Clear
                </Button>
              )}
              <Button type="button" size="sm" onClick={save}>
                <Check className="size-3.5" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
