"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/logo";
import { ApiKeySettings } from "@/components/vigil/api-key-settings";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Index" },
  { to: "/console", label: "Console" },
  { to: "/corpus", label: "Corpus" },
  { to: "/governance", label: "Governance" },
] as const;

export function SiteHeader({ quiet = false }: { quiet?: boolean }) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md",
        quiet && "bg-bg",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-fg">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname?.startsWith(l.to);
            return (
              <Link
                key={l.to}
                href={l.to}
                className={cn(
                  "rounded-sm px-2.5 py-2 text-xs font-medium text-muted transition-colors duration-150 hover:text-fg sm:text-sm",
                  active && "text-fg",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <ApiKeySettings />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Vigil is educational care intelligence. It is not medical care.</p>
        <p className="font-mono tracking-wide">C1–C8 live on every run</p>
      </div>
    </footer>
  );
}
