import { CORPUS } from "./corpus";
import type { CareCase, CorpusChunk, RetrievedChunk } from "./types";

const STOP = new Set(
  "a an the of to for in on at by with from or and is are was were be been being this that those these it its as if then than not no nor so such into over after before about than can could should would may might will just also only other more most some any few many own same both between through during without within because while where when who whom which what how very really also into onto upon across per via".split(
    " ",
  ),
);

const EXPAND: Record<string, string[]> = {
  nsaid: ["ibuprofen", "naproxen", "kidney", "bleeding", "heart"],
  ibuprofen: ["nsaid", "bleeding", "kidney", "heart"],
  naproxen: ["nsaid", "bleeding"],
  eliquis: ["apixaban", "anticoagulant", "bleeding"],
  apixaban: ["anticoagulant", "bleeding", "nsaid"],
  lasix: ["furosemide", "diuretic", "weight"],
  furosemide: ["diuretic", "weight", "dizziness"],
  lisinopril: ["ace", "kidney", "potassium"],
  confusion: ["delirium", "sodium", "infection", "medication"],
  inhaler: ["albuterol", "asthma", "spacer", "controller"],
  albuterol: ["rescue", "asthma", "overuse"],
  cancer: ["pathology", "staging", "questions", "misinformation"],
  breast: ["pathology", "receptor", "surgery", "questions"],
  weight: ["heart", "failure", "edema", "diuretic"],
  orthopnea: ["heart", "failure", "pillows", "breath"],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+-]+/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/(ing|ed|es|s)$/g, ""))
    .filter((w) => w.length > 2 && !STOP.has(w));
}

const DF = (() => {
  const df = new Map<string, number>();
  for (const chunk of CORPUS) {
    const seen = new Set(tokenize(`${chunk.title} ${chunk.body} ${chunk.tags.join(" ")}`));
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }
  return df;
})();

const N = CORPUS.length;

function idf(term: string) {
  const df = DF.get(term) ?? 0.5;
  return Math.log((N + 1) / (df + 0.5)) + 1;
}

function bm25(queryTerms: string[], chunk: CorpusChunk): { score: number; hits: string[] } {
  const title = tokenize(chunk.title);
  const body = tokenize(`${chunk.body} ${chunk.tags.join(" ")} ${chunk.topic}`);
  const tfTitle = new Map<string, number>();
  const tfBody = new Map<string, number>();
  for (const t of title) tfTitle.set(t, (tfTitle.get(t) ?? 0) + 1);
  for (const t of body) tfBody.set(t, (tfBody.get(t) ?? 0) + 1);
  const avgLen = 140;
  const k1 = 1.4;
  const b = 0.65;
  let score = 0;
  const hits: string[] = [];
  const uniq = [...new Set(queryTerms)];
  for (const term of uniq) {
    const fTitle = tfTitle.get(term) ?? 0;
    const fBody = tfBody.get(term) ?? 0;
    if (!fTitle && !fBody) continue;
    hits.push(term);
    const f = fTitle * 2.6 + fBody;
    const lenNorm = 1 - b + b * (body.length / avgLen);
    score += idf(term) * ((f * (k1 + 1)) / (f + k1 * lenNorm));
  }
  return { score, hits };
}

function expandQuery(terms: string[]): string[] {
  const extra: string[] = [];
  for (const t of terms) {
    const mapped = EXPAND[t];
    if (mapped) extra.push(...mapped);
  }
  return [...terms, ...tokenize(extra.join(" "))];
}

export function caseText(c: CareCase): string {
  const meds = c.medications.map((m) => `${m.name} ${m.dose} ${m.notes ?? ""}`).join(" ");
  const docs = c.documents.map((d) => `${d.title} ${d.body}`).join(" ");
  return `${c.name} ${c.conditionLine} ${c.summary} ${meds} ${docs}`;
}

export function retrieve(query: string, careCase: CareCase | null, k = 8): RetrievedChunk[] {
  const caseBits = careCase ? `${careCase.conditionLine} ${careCase.summary}` : "";
  const qTerms = expandQuery(tokenize(`${query} ${caseBits}`));
  const ranked = CORPUS.map((chunk) => {
    const { score, hits } = bm25(qTerms, chunk);
    return {
      chunk,
      score,
      why: hits.slice(0, 6).join(", ") || "topical neighborhood",
    };
  })
    .filter((r) => r.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  if (ranked.length >= 3) return ranked;

  // Guarantee a safety floor so the Governor always has source material.
  const floor = CORPUS.filter((c) => c.id === "not-advice" || c.id === "er-when" || c.id === "visit-prep");
  const have = new Set(ranked.map((r) => r.chunk.id));
  for (const chunk of floor) {
    if (have.has(chunk.id)) continue;
    ranked.push({ chunk, score: 0.2, why: "safety floor" });
  }
  return ranked.slice(0, k);
}

export function intentFromQuery(query: string): import("./types").Intent {
  const q = query.toLowerCase();
  if (/(chest pain|can'?t breathe|suicid|stroke|unresponsive|overdose)/.test(q)) return "crisis";
  if (/(ibuprofen|nsaid|med(ication)?|pill|interact|eliquis|apixaban|dose)/.test(q))
    return "medication_safety";
  if (/(visit|doctor|question|ask|appointment|oncolog|surgeon)/.test(q)) return "visit_prep";
  if (/(weight|confused|breath|wheeze|inhaler|night|symptom)/.test(q)) return "symptom_watch";
  if (/(burnout|sleep|i can'?t|respite|kids|teen|overwhelm)/.test(q)) return "caregiver_support";
  return "overview";
}
