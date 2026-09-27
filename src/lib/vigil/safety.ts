import type { CrisisVerdict, EvidenceBrief, SafetyReport } from "./types";

export const SAFETY_CONTRACTS = [
  {
    id: "C1",
    name: "No diagnosis",
    rule: "Vigil never names a disease the person 'has'. It may only restate what is already in the case file and point to educational material.",
  },
  {
    id: "C2",
    name: "No prescribing",
    rule: "No start, stop, or dose-change instructions. Medication notes are conflict watches to take to a clinician.",
  },
  {
    id: "C3",
    name: "Crisis before generation",
    rule: "The Sentinel node is deterministic regex/pattern routing and always runs before any model call.",
  },
  {
    id: "C4",
    name: "Ground or label",
    rule: "Claims must cite a corpus chunk id. Anything the Auditor cannot ground is listed as ungrounded, never as fact.",
  },
  {
    id: "C5",
    name: "Human handoff",
    rule: "Emergency or urgent verdicts force a handoff banner. The graph cannot 'resolve' a crisis.",
  },
  {
    id: "C6",
    name: "Local memory",
    rule: "Case files live in this browser. Only the snapshot the user submits is sent to the model.",
  },
  {
    id: "C7",
    name: "Refuse clinician roleplay",
    rule: "The Governor strips first-person doctor voice ('I recommend you take…').",
  },
  {
    id: "C8",
    name: "Dual audience",
    rule: "Every brief has a family-readable body and a 'show your clinician' question list.",
  },
] as const;

const PRESCRIBE =
  /\b(take \d+|start taking|stop (the |your )?(tablet|pill|medication|drug)|increase (the )?dose|i (recommend|prescribe|advise you to take))\b/i;
const DIAGNOSE = /\b(you (have|have got)|this (confirms|proves) you|my diagnosis is)\b/i;
const DOCTOR_VOICE = /\b(as your (doctor|physician|clinician)|i'?m (your )?doctor)\b/i;

export function applyGovernor(
  brief: EvidenceBrief,
  crisis: CrisisVerdict,
): { brief: EvidenceBrief; safety: SafetyReport } {
  const blocked: string[] = [];
  const next: EvidenceBrief = {
    ...brief,
    findings: brief.findings.map((f) => ({ ...f })),
    redFlags: [...brief.redFlags],
    askYourClinician: [...brief.askYourClinician],
    next72h: [...brief.next72h],
    next7d: [...brief.next7d],
    citations: [...brief.citations],
    ungrounded: [...brief.ungrounded],
  };

  const scan = (text: string, label: string) => {
    if (PRESCRIBE.test(text)) blocked.push(`Prescribing language in ${label}`);
    if (DIAGNOSE.test(text)) blocked.push(`Diagnostic language in ${label}`);
    if (DOCTOR_VOICE.test(text)) blocked.push(`Clinician roleplay in ${label}`);
  };

  scan(next.plainLanguage, "plain language");
  scan(next.headline, "headline");
  next.findings.forEach((f, i) => scan(`${f.title} ${f.body}`, `finding ${i + 1}`));
  next.next72h.forEach((t, i) => scan(t, `72h item ${i + 1}`));
  next.next7d.forEach((t, i) => scan(t, `7d item ${i + 1}`));

  next.whatThisIsNot =
    next.whatThisIsNot ||
    "This is not a diagnosis, prescription, or emergency service. It is an educational briefing for a family caregiver to take to a licensed clinician.";

  if (crisis.level === "emergency") {
    next.headline = "Stop — this looks like an emergency, not a briefing";
  }

  const humanHandoff = crisis.level !== "none";

  return {
    brief: next,
    safety: {
      contractsApplied: SAFETY_CONTRACTS.map((c) => c.id),
      blockedActions: blocked,
      crisis,
      humanHandoff,
    },
  };
}
