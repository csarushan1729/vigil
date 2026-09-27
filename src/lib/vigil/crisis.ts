import type { CrisisVerdict } from "./types";

const EMERGENCY = [
  {
    re: /\b(chest pain|pressure in (the )?chest|crushing (chest|pain)|heart attack)\b/i,
    reason: "Possible cardiac emergency language",
  },
  {
    re: /\b(can('?t|not) breathe|severe (shortness of breath|dyspnea)|gasping|blue lips|turning blue)\b/i,
    reason: "Severe breathing distress",
  },
  {
    re: /\b(stroke|face droop|arm weakness|speech (slurred|garbled)|BE-?FAST|one[- ]sided weakness)\b/i,
    reason: "Stroke warning signs",
  },
  {
    re: /\b(unresponsive|passed out|loss of consciousness|won'?t wake)\b/i,
    reason: "Altered consciousness",
  },
  {
    re: /\b(suicid|kill (myself|himself|herself)|want to die|ending (it|my life)|self[- ]harm)\b/i,
    reason: "Suicide or self-harm language",
  },
  {
    re: /\b(anaphyla|throat closing|severe allergic|epipen)\b/i,
    reason: "Possible anaphylaxis",
  },
  {
    re: /\b(overdose|took (all|too many) (pills|tablets)|poison(ed)?)\b/i,
    reason: "Possible poisoning or overdose",
  },
  {
    re: /\b(heavy bleeding|won'?t stop bleeding|coughing (up )?blood|vomiting blood)\b/i,
    reason: "Uncontrolled bleeding",
  },
  {
    re: /\b(seizure|convuls)\b/i,
    reason: "Seizure activity",
  },
];

const URGENT = [
  {
    re: /\b(new confusion|suddenly confused|deliri)\b/i,
    reason: "New or sudden confusion",
  },
  {
    re: /\b(faint(ed|ing)|near[- ]syncope|black(ed)? out)\b/i,
    reason: "Fainting or near-fainting",
  },
  {
    re: /\b(rapid weight gain|gained \d+ (lb|pounds)|waking (up )?gasping|orthopnea|can('?t|not) lie flat)\b/i,
    reason: "Possible heart-failure decompensation signals",
  },
  {
    re: /\b(no urine|not peeing|swollen (legs|ankles) (a lot|suddenly))\b/i,
    reason: "Possible fluid or kidney warning",
  },
  {
    re: /\b(peak flow .*(red zone|under 50)|rescue inhaler (every|hourly|all day))\b/i,
    reason: "Asthma red-zone pattern",
  },
];

export function evaluateCrisis(text: string): CrisisVerdict {
  const hay = text.slice(0, 12_000);
  const emergencyHits = EMERGENCY.filter((r) => r.re.test(hay)).map((r) => r.reason);
  if (emergencyHits.length) {
    const mental = /suicid|self[- ]harm|want to die|kill (my|him|her)self/i.test(hay);
    return {
      level: "emergency",
      reasons: emergencyHits,
      action: mental
        ? "If this is happening now, call emergency services or 988 (Suicide & Crisis Lifeline in the US). Vigil will not continue as if this were a routine briefing."
        : "If this is happening now, call emergency services (911 in the US) or go to the nearest emergency department. Vigil will not continue as if this were a routine briefing.",
    };
  }
  const urgentHits = URGENT.filter((r) => r.re.test(hay)).map((r) => r.reason);
  if (urgentHits.length) {
    return {
      level: "urgent",
      reasons: urgentHits,
      action:
        "Same-day clinician contact is the safe move. Use the visit questions below — do not wait for a 'routine' appointment if symptoms are new or worsening.",
    };
  }
  return {
    level: "none",
    reasons: [],
    action: "No deterministic crisis pattern matched. Continue with a governed educational brief.",
  };
}
