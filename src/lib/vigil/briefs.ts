import { CORPUS_BY_ID } from "./corpus";
import type { EvidenceBrief, Intent, OrchestrationResult } from "./types";
import { applyGovernor } from "./safety";
import { evaluateCrisis } from "./crisis";
import { retrieve } from "./retrieve";
import { DEMO_CASES } from "./cases";
import type { CareCase } from "./types";

function cite(...ids: string[]): string[] {
  return ids.filter((id) => CORPUS_BY_ID[id]);
}

const ELENA_BRIEF: EvidenceBrief = {
  headline: "Fluid is coming back, and an OTC pain pill is fighting the discharge plan",
  plainLanguage:
    "Elena's weight, recliner sleep, and tighter ankles are the exact early heart-failure signals clinics teach families to call about — not proof of a new diagnosis, but a reason not to wait for a 'routine' follow-up. The ibuprofen Sofia started for knee pain is an NSAID. In someone on a diuretic, an ACE inhibitor, and apixaban, that class is a well-taught problem: it can hold fluid, stress kidneys, and raise bleeding risk. Evening confusion is also new; in older adults that is a medical event (delirium pattern), not 'the dementia suddenly jumped.' The job tonight is observation and a same-day call — not a home dose change.",
  whatThisIsNot:
    "This is not a diagnosis of kidney injury, a stroke, or 'the heart is failing again.' It is not permission to skip or double furosemide. It is an educational watch list for Sofia to take to a clinician or pharmacist today.",
  findings: [
    {
      title: "Weight + pillows is a taught call threshold",
      severity: "urgent",
      citations: cite("hf-weight", "hf-orthopnea"),
      body: "Discharge asked for a call at about +3 lb in a day. Elena is +4 lb in three days and sleeping in a recliner. Those two together are classic fluid signals. Bring the actual numbers, not 'she seems swollen.'",
    },
    {
      title: "Ibuprofen is the unlisted actor",
      severity: "urgent",
      citations: cite("nsaid-hf", "nsaid-bleed", "acei-nsaid-diuretic"),
      body: "NSAID + heart failure + ACE inhibitor + loop diuretic is the 'triple whammy' kidney pattern. NSAID + apixaban is a bleeding stack. Acetaminophen is often discussed as the alternative for simple pain — still with daily limits, still a clinician/pharmacist confirmation, not a forum switch.",
    },
    {
      title: "Evening confusion is a same-day question",
      severity: "urgent",
      citations: cite("delirium", "ssri-elder", "infection-elder", "polypharmacy-elder"),
      body: "New fluctuating confusion in a 74-year-old is delirium until a clinician says otherwise. Contributors that belong on the table: medicines (including sertraline and the new beta blocker), low sodium, infection, dehydration, poor intake, and the NSAID/kidney stack. Do not stop donepezil or the anticoagulant because a list called them 'Beers.'",
    },
    {
      title: "Hospital PPI and salt load are review items, not tonight's crisis",
      severity: "watch",
      citations: cite("omeprazole", "low-sodium-hf", "med-rec"),
      body: "Omeprazole was started in hospital — ask how long it is for. Neighbor lasagna is a sodium bomb. These matter, but they do not outrank the NSAID and the weight curve.",
    },
  ],
  redFlags: [
    "Chest pain or pressure, or breathlessness at rest that is new for her",
    "Cannot speak a full sentence, blue lips, or collapse",
    "Face droop, arm weakness, or speech change — call emergency services",
    "Black stools, vomiting blood, or a head strike while on apixaban",
    "No urine, or she will not wake",
  ],
  askYourClinician: [
    "Here is the weight log and the ibuprofen start date — do we need labs (kidney, sodium, potassium) today?",
    "Please reconcile the OTC ibuprofen against apixaban, lisinopril, and furosemide. What is the pain plan instead?",
    "What is our exact call threshold for weight, pillows, and confusion after hours?",
    "Is omeprazole still required, and for how long?",
    "Should we be taught a standing-blood-pressure / pulse check given metoprolol and diuretics?",
  ],
  next72h: [
    "Same-day message or call to the heart-failure or primary clinic with the weight curve and the NSAID start — do not wait for day-14 follow-up.",
    "Keep the ibuprofen bottle in the 'ask first' bag; do not give another dose unless the clinician or pharmacist clears it.",
    "Weigh tomorrow morning the same way as discharge teaching. Write pillows used and evening clarity as one line each.",
    "If emergency-pattern symptoms appear, skip the briefing and call emergency services.",
  ],
  next7d: [
    "Bring every bottle, including OTCs and the PM cold tablet, to the visit (medication reconciliation).",
    "Ask for a written 'when to call' card, not only verbal counseling.",
    "Name caregiver strain: Sofia is doing nights and decisions alone.",
  ],
  caregiverNote:
    "Sofia is not failing at this. The system discharged a nine-medicine problem onto a kitchen table. The useful move is a tight log and a same-day human — not more articles.",
  citations: cite(
    "hf-weight",
    "hf-orthopnea",
    "nsaid-hf",
    "nsaid-bleed",
    "acei-nsaid-diuretic",
    "delirium",
    "polypharmacy-elder",
    "visit-prep",
    "med-rec",
    "not-advice",
  ),
  ungrounded: [],
};

const JAMAL_BRIEF: EvidenceBrief = {
  headline: "This is poor control plus a paperwork hole — not a child who 'just has sensitive lungs'",
  plainLanguage:
    "Using albuterol almost hourly after gym, night rescue doses, and two ER visits this season are the textbook signals that inflammation is not controlled. Albuterol opens the airway for a while; it does not treat the swelling. The controller only works on the days it is taken, with a spacer, and with technique someone has actually watched. School cannot give medicine without authorization — that is a safety gap, not bureaucracy. The cat and balcony smoke are real triggers to put on the table; they are not an internet ultimatum to rehome a pet tonight.",
  whatThisIsNot:
    "This is not an asthma severity 'upgrade' you assign at home, not a red-zone diagnosis, and not a plan to add or stop steroids. Red-zone breathing is an emergency-services question, not a Thursday appointment.",
  findings: [
    {
      title: "Rescue overuse is the control alarm",
      severity: "urgent",
      citations: cite("albuterol-overuse", "ics-adherence"),
      body: "Night-time rescue and hourly post-exercise use are not 'a bad week' in isolation when they sit next to two ER visits. The pediatrician should see the actual puff counts, not a memory of 'he used it a lot.'",
    },
    {
      title: "There is no written action plan in the parent's hands",
      severity: "urgent",
      citations: cite("asthma-action", "teach-back"),
      body: "The ER box may say 'plan discussed.' Amara does not have a green/yellow/red sheet. That sheet is what tells a grandmother or a school nurse what to do at 01:30. Request it as a document, and do teach-back with a spacer in the room.",
    },
    {
      title: "School is currently unsafe by omission",
      severity: "watch",
      citations: cite("school-asthma", "spacer-technique"),
      body: "No authorization, no labeled inhaler, no spacer on site means gym class is unprotected. Thursday's visit should produce paperwork, not only a refill.",
    },
    {
      title: "Triggers are a list, not a morality test",
      severity: "watch",
      citations: cite("asthma-triggers"),
      body: "Cat in the sleep space and smoke at the balcony door belong on the plan. Bedroom-off-limits and door policy are first experiments many clinicians start with. Viral season still outranks both.",
    },
  ],
  redFlags: [
    "Rescue is not helping, or he cannot speak a full sentence",
    "Ribs or neck pulling in, lips or nails blue/gray",
    "Collapsing into sleep from the work of breathing",
    "Peak flow in the red range if the clinic has given numbers",
  ],
  askYourClinician: [
    "Please watch him use the controller with a spacer and write an action plan we can photograph.",
    "Here is a three-night rescue log — does this change controller or add a stepwise plan you own?",
    "We need school authorization, a labeled inhaler, and a spacer that stays at school before Monday gym.",
    "What is our personal red zone, in words a grandmother can follow at 1 a.m.?",
    "How should we handle the cat and balcony smoke as a staged plan?",
  ],
  next72h: [
    "If breathing hits red-zone patterns, use emergency services — do not wait for Thursday.",
    "Count every albuterol puff until the visit. Bring the canisters.",
    "Email or drop the school health form request now so Thursday can fill it.",
    "Keep the cat out of the sleep space as a trial; do not rehome on a forum's timeline.",
  ],
  next7d: [
    "Leave the visit with a paper plan, spacer teaching, and school packet.",
    "Ask whether a 504/individualized health plan is appropriate.",
    "One backup adult should be able to run the yellow-zone steps.",
  ],
  caregiverNote:
    "Amara is already doing the hard part — staying up. The missing piece is a written shared plan, not more grit.",
  citations: cite(
    "albuterol-overuse",
    "ics-adherence",
    "asthma-action",
    "spacer-technique",
    "asthma-triggers",
    "asthma-red",
    "school-asthma",
    "visit-prep",
    "teach-back",
    "not-advice",
  ),
  ungrounded: [],
};

const PRIYA_BRIEF: EvidenceBrief = {
  headline: "Staging is work, not delay — and the forum is not a tumor board",
  plainLanguage:
    "The biopsy says invasive ductal carcinoma, grade 2. That means cancer cells are in the surrounding breast tissue. It does not yet say stage, receptors, or the treatment menu. Scans and remaining lab stains are how teams avoid the wrong surgery. Waiting feels like doing nothing; clinically it is how the first operation is chosen. Curcumin and 'alkaline' protocols are marketed into this exact week and can interfere later with anesthesia or medicines — they belong in the bag for the visit, not in a secret stack. Teenagers need a true, sized story, not a cover-up.",
  whatThisIsNot:
    "This is not a prognosis, a chemo-vs-surgery decision, or a recommendation to fly tonight. Receptor status is still pending; any survival number from a blog is the wrong subtype until proven otherwise.",
  findings: [
    {
      title: "What the pathology line actually means",
      severity: "info",
      citations: cite("breast-pathology", "cancer-first"),
      body: "IDC grade 2 with DCIS on the core is a starting map, not the whole map. ER/PR/HER2 and staging still steer options. Ask the surgeon to walk the report with a highlighter, line by line.",
    },
    {
      title: "The first visit is for missing information, not a forced choice",
      severity: "watch",
      citations: cite("cancer-questions", "visit-prep"),
      body: "High-yield: what is still unknown, whether breast-conserving surgery is on the table, genetics counseling, who coordinates surgery/medical oncology/radiation, and the real deadline — not the internet's.",
    },
    {
      title: "Supplements and viral protocols",
      severity: "watch",
      citations: cite("cancer-misinfo"),
      body: "Show the curcumin bottle. Do not add further 'immune' products this week. Second opinions at a cancer center are a standard option, not a betrayal.",
    },
    {
      title: "The teens already know something is wrong",
      severity: "info",
      citations: cite("kids-cancer-talk", "caregiver-burnout"),
      body: "Name it, bound it, give them an adult they can text, and tell school. Secrecy writes a worse story than the truth you actually have.",
    },
  ],
  redFlags: [
    "Fever, spreading redness, or heavy bleeding at the biopsy site",
    "Sudden chest pain or shortness of breath (clot teaching after some procedures — still an emergency question)",
    "Suicidal despair in Priya or Raj — 988 or emergency services, not a forum",
  ],
  askYourClinician: [
    "Walk us through this pathology: what is decided vs pending (receptors, nodes, staging studies)?",
    "What decisions truly cannot wait, and which can wait for complete information?",
    "Is breast-conserving surgery a possible path, and what would radiation mean if so?",
    "Do we need genetics counseling before the operation?",
    "Who is our navigator, and may we record or bring a second listener?",
    "Raj bought curcumin — what must we stop or hold before any procedure?",
  ],
  next72h: [
    "One notebook, one shared calendar, one friend as visit recorder.",
    "Put every supplement in a bag for Thursday. Do not add more.",
    "Agree on a first sentence for the teens, then tell them.",
    "Sleep, food, and a walk are part of getting through staging — not a cure protocol.",
  ],
  next7d: [
    "Leave the surgical visit with a written 'what we know / what we wait for' half-page.",
    "Ask about a nurse navigator and a social worker; insurance and time off land this week.",
    "Raj needs his own check-in — caregiver panic is a risk to decisions.",
  ],
  caregiverNote:
    "Raj's urgency is love with nowhere to go. Channel it into logistics and questions. The tumor board is not Twitter.",
  citations: cite(
    "cancer-first",
    "breast-pathology",
    "cancer-questions",
    "cancer-misinfo",
    "kids-cancer-talk",
    "caregiver-burnout",
    "visit-prep",
    "988",
    "not-advice",
  ),
  ungrounded: [],
};

export const GOLD_BRIEFS: Record<string, EvidenceBrief> = {
  elena: ELENA_BRIEF,
  jamal: JAMAL_BRIEF,
  priya: PRIYA_BRIEF,
};

export function tracesFor(intent: Intent, crisisLevel: OrchestrationResult["crisis"]["level"]) {
  const t = (
    id: string,
    agent: OrchestrationResult["traces"][number]["agent"],
    title: string,
    detail: string,
    status: OrchestrationResult["traces"][number]["status"],
    atMs: number,
  ) => ({ id, agent, title, detail, status, atMs });

  const crisisStatus = crisisLevel === "emergency" ? "blocked" : crisisLevel === "urgent" ? "warn" : "ok";

  return [
    t("1", "sentinel", "Crisis contract", "Deterministic pattern scan of query + case file", crisisStatus, 80),
    t("2", "ingest", "Case snapshot", "Medications, notes, and caregiver query bound into graph state", "ok", 220),
    t("3", "retriever", "Hybrid RAG", "BM25 + query expansion over the educational corpus", "ok", 480),
    t("4", "router", "Intent", `Routed as ${intent.replaceAll("_", " ")}`, "ok", 640),
    t("5", "literacy", "Plain language", "Restated without new diagnoses", "ok", 920),
    t("6", "medsafe", "Medication watch", "Conflict classes vs the bottle list", "ok", 940),
    t("7", "visit", "Visit coach", "Ranked questions for the next human clinician", "ok", 960),
    t("8", "careplan", "Horizon", "72-hour and 7-day observation list", "ok", 980),
    t("9", "auditor", "Grounding", "Claims mapped to chunk ids; ungrounded labeled", "ok", 1280),
    t(
      "10",
      "governor",
      "Safety contracts",
      crisisLevel === "none" ? "C1–C8 applied; no prescribing voice" : "Handoff forced; briefing demoted",
      crisisLevel === "emergency" ? "blocked" : "ok",
      1480,
    ),
  ];
}

export function goldResult(careCase: CareCase, query: string): OrchestrationResult | null {
  const brief = GOLD_BRIEFS[careCase.id];
  if (!brief) return null;
  const crisis = evaluateCrisis(`${query}\n${careCase.summary}`);
  const retrieved = retrieve(query, careCase, 8);
  const governed = applyGovernor(brief, crisis);
  const intent = crisis.level === "emergency" ? "crisis" : "overview";
  return {
    id: `gold-${careCase.id}`,
    caseId: careCase.id,
    query,
    intent,
    crisis,
    retrieved,
    traces: tracesFor(intent, crisis.level),
    brief: governed.brief,
    safety: governed.safety,
    source: "gold",
    ranAt: new Date().toISOString(),
  };
}

export function isDefaultDemoQuery(careCase: CareCase, query: string) {
  if (!careCase.isDemo) return false;
  const a = query.trim().toLowerCase();
  const b = careCase.defaultQuery.trim().toLowerCase();
  return a === b || a.length < 8;
}

export function demoCaseById(id: string) {
  return DEMO_CASES.find((c) => c.id === id);
}
