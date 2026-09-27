"use server";

import { extractiveBrief, runOrchestrator, type GraphState } from "./graph";
import type { CareCase, EvidenceBrief } from "./types";

const SYSTEM = `You are a specialist node inside Vigil, a governed care-intelligence OS for family caregivers.
You are NOT a doctor. You never diagnose, never prescribe, never give milligram instructions, never say "you have X", never roleplay as the clinician.
You write educational briefings a caregiver can take to a licensed human.

Output ONLY valid JSON matching this schema:
{
  "headline": string,
  "plainLanguage": string,
  "whatThisIsNot": string,
  "findings": [{"title": string, "body": string, "severity": "info"|"watch"|"urgent", "citations": string[]}],
  "redFlags": string[],
  "askYourClinician": string[],
  "next72h": string[],
  "next7d": string[],
  "caregiverNote": string,
  "citations": string[],
  "ungrounded": string[]
}

Rules:
- citations and finding.citations MUST be corpus chunk ids from the retrieved list. If you cannot ground a sentence, put it in ungrounded, not in findings.
- next72h items are observations and call-thresholds, never "take/stop/increase" a medicine.
- If crisis is urgent, lead with same-day clinician contact.
- Keep plainLanguage under 160 words. Max 4 findings.`;

function parseBrief(text: string, fallback: EvidenceBrief): EvidenceBrief {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return fallback;
  try {
    const raw = JSON.parse(text.slice(start, end + 1)) as EvidenceBrief;
    if (!raw.plainLanguage || !Array.isArray(raw.findings)) return fallback;
    return {
      headline: String(raw.headline ?? fallback.headline).slice(0, 180),
      plainLanguage: String(raw.plainLanguage).slice(0, 1400),
      whatThisIsNot: String(raw.whatThisIsNot ?? fallback.whatThisIsNot).slice(0, 500),
      findings: (raw.findings ?? []).slice(0, 5).map((f) => ({
        title: String(f.title ?? "").slice(0, 120),
        body: String(f.body ?? "").slice(0, 600),
        severity: f.severity === "urgent" || f.severity === "watch" ? f.severity : "info",
        citations: Array.isArray(f.citations) ? f.citations.map(String).slice(0, 6) : [],
      })),
      redFlags: (raw.redFlags ?? []).map(String).slice(0, 6),
      askYourClinician: (raw.askYourClinician ?? []).map(String).slice(0, 8),
      next72h: (raw.next72h ?? []).map(String).slice(0, 6),
      next7d: (raw.next7d ?? []).map(String).slice(0, 6),
      caregiverNote: String(raw.caregiverNote ?? "").slice(0, 400),
      citations: (raw.citations ?? []).map(String).slice(0, 12),
      ungrounded: (raw.ungrounded ?? []).map(String).slice(0, 6),
    };
  } catch {
    return fallback;
  }
}

async function liveBrief(state: GraphState, apiKey?: string | null): Promise<EvidenceBrief | null> {
  const key = apiKey?.trim() || process.env.XAI_API_KEY;
  if (!key) return null;

  const retrieved = state.retrieved
    .map(
      (r, i) =>
        `[${i + 1}] id=${r.chunk.id} source=${r.chunk.source}\n${r.chunk.title}\n${r.chunk.body}`,
    )
    .join("\n\n");

  const meds = state.careCase.medications
    .map((m) => `- ${m.name} ${m.dose} ${m.schedule}${m.notes ? ` (${m.notes})` : ""}`)
    .join("\n");

  const docs = state.careCase.documents.map((d) => `${d.title}: ${d.body}`).join("\n\n");

  const user = `CASE: ${state.careCase.name}, ${state.careCase.age}, caregiver ${state.careCase.caregiver}
SETTING: ${state.careCase.setting}
FILE SUMMARY: ${state.careCase.summary}
MEDS:\n${meds}
DOCUMENTS:\n${docs}
CAREGIVER QUERY: ${state.query.slice(0, 1200)}
CRISIS VERDICT: ${state.crisis.level} — ${state.crisis.action}
INTENT: ${state.intent}

RETRIEVED CORPUS (cite by id only):\n${retrieved}`;

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.2,
      max_tokens: 1600,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  if (!text) return null;
  return parseBrief(text, extractiveBrief(state.query, state.retrieved));
}

export async function runVigil(input: { careCase: CareCase; query: string; apiKey?: string | null }) {
  if (!input?.careCase?.id || !input.query) {
    throw new Error("A case and a question are required.");
  }
  return runOrchestrator({
    careCase: input.careCase,
    query: String(input.query).slice(0, 2000),
    live: (state) => liveBrief(state, input.apiKey),
  });
}
