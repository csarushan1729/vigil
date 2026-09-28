# Vigil

Vigil is a governed multi-agent care intelligence system for family caregivers.
It retrieves cited medical/teaching material, tracks medication conflicts,
prepares questions for the next care visit, and stays inside strict safety
guardrails (it never pretends to be a doctor).

Built with **Next.js (App Router)**, React 19, Tailwind CSS v4, and Radix UI.

## Getting started

```bash
npm install
npm run dev
```

The app runs at http://localhost:8080.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run typecheck` — TypeScript checks
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Project structure

```
app/
  layout.tsx          # root layout (fonts, metadata, toaster)
  page.tsx             # landing page
  console/
    layout.tsx          # header/footer shell for the console
    page.tsx             # case list
    [caseId]/page.tsx    # individual case workspace
  corpus/page.tsx      # retrieval corpus browser
  governance/page.tsx  # safety contracts + runtime docs
src/
  components/         # UI components (brand, layout, vigil-specific, shadcn-style primitives)
  lib/vigil/          # Core domain logic: cases, corpus, retrieval, graph, safety, briefs, the
                       # `runVigil` Server Action that calls the live model
public/                # Static assets (favicon, og image)
```

## Live model runs

`src/lib/vigil/run.ts` is a Next.js Server Action (`"use server"`) that calls
`https://api.x.ai/v1/chat/completions` (the Grok model) whenever someone asks
a custom question. Two ways to enable it:

1. **BYOK (bring your own key)** — click **Add xAI key** in the header, paste
   an xAI API key (get one at console.x.ai). It's stored only in that
   browser's `localStorage` and sent to the server action on each run — never
   persisted or logged server-side. Each visitor can use their own key.
2. **Server-side key** — set an `XAI_API_KEY` environment variable on your
   deployment. It's used as the fallback whenever a visitor hasn't set their
   own key. Note this means *you* pay for and rate-limit every run made by
   anyone without their own key — fine for a personal demo, riskier for a
   public one.

Without either key, custom questions fall back to an extractive (no-model)
brief — ranked corpus passages, no generation. The three demo cases (Elena,
Jamal, Priya) always replay a gold-standard brief regardless of any key.

After a run, the brief panel shows its source (`gold` / `live` / `extractive`)
so you can confirm whether a key is actually being used.


