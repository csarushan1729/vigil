export type AgentId =
  | "sentinel"
  | "ingest"
  | "retriever"
  | "router"
  | "literacy"
  | "medsafe"
  | "visit"
  | "careplan"
  | "auditor"
  | "governor";

export type TraceStatus = "idle" | "running" | "ok" | "warn" | "blocked";

export type CrisisLevel = "none" | "urgent" | "emergency";

export type Intent =
  | "overview"
  | "medication_safety"
  | "visit_prep"
  | "symptom_watch"
  | "caregiver_support"
  | "crisis";

export interface CorpusChunk {
  id: string;
  title: string;
  body: string;
  source: string;
  sourceUrl: string;
  tags: string[];
  topic: string;
}

export interface RetrievedChunk {
  chunk: CorpusChunk;
  score: number;
  why: string;
}

export interface Medication {
  name: string;
  dose: string;
  schedule: string;
  started?: string;
  notes?: string;
}

export interface CaseDocument {
  id: string;
  title: string;
  kind: "discharge" | "meds" | "labs" | "note" | "plan";
  date: string;
  body: string;
}

export interface GraphNode {
  id: string;
  label: string;
  kind: "person" | "condition" | "medication" | "symptom" | "task" | "place";
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface CareCase {
  id: string;
  name: string;
  age: number;
  relationship: string;
  caregiver: string;
  setting: string;
  conditionLine: string;
  summary: string;
  status: "watch" | "unstable" | "new" | "custom";
  medications: Medication[];
  documents: CaseDocument[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  defaultQuery: string;
  isDemo: boolean;
}

export interface TraceEvent {
  id: string;
  agent: AgentId;
  title: string;
  detail: string;
  status: TraceStatus;
  atMs: number;
}

export interface BriefFinding {
  title: string;
  body: string;
  severity: "info" | "watch" | "urgent";
  citations: string[];
}

export interface EvidenceBrief {
  headline: string;
  plainLanguage: string;
  whatThisIsNot: string;
  findings: BriefFinding[];
  redFlags: string[];
  askYourClinician: string[];
  next72h: string[];
  next7d: string[];
  caregiverNote: string;
  citations: string[];
  ungrounded: string[];
}

export interface CrisisVerdict {
  level: CrisisLevel;
  reasons: string[];
  action: string;
}

export interface SafetyReport {
  contractsApplied: string[];
  blockedActions: string[];
  crisis: CrisisVerdict;
  humanHandoff: boolean;
}

export interface OrchestrationResult {
  id: string;
  caseId: string;
  query: string;
  intent: Intent;
  crisis: CrisisVerdict;
  retrieved: RetrievedChunk[];
  traces: TraceEvent[];
  brief: EvidenceBrief;
  safety: SafetyReport;
  source: "gold" | "live" | "extractive";
  ranAt: string;
}

export const AGENT_META: Record<
  AgentId,
  { label: string; role: string; lane: "gate" | "retrieve" | "specialist" | "close" }
> = {
  sentinel: {
    label: "Sentinel",
    role: "Deterministic crisis routing",
    lane: "gate",
  },
  ingest: {
    label: "Ingest",
    role: "Case file + query snapshot",
    lane: "gate",
  },
  retriever: {
    label: "Retriever",
    role: "Hybrid RAG over the corpus",
    lane: "retrieve",
  },
  router: {
    label: "Router",
    role: "Intent + specialist fan-out",
    lane: "retrieve",
  },
  literacy: {
    label: "Literacy",
    role: "Plain-language explanation",
    lane: "specialist",
  },
  medsafe: {
    label: "MedSafe",
    role: "Medication conflict watch",
    lane: "specialist",
  },
  visit: {
    label: "Visit Coach",
    role: "Questions for the next clinician",
    lane: "specialist",
  },
  careplan: {
    label: "Care Plan",
    role: "72-hour and 7-day watch list",
    lane: "specialist",
  },
  auditor: {
    label: "Auditor",
    role: "Citation and grounding check",
    lane: "close",
  },
  governor: {
    label: "Governor",
    role: "Safety contracts + handoff",
    lane: "close",
  },
};

export const GRAPH_ORDER: AgentId[] = [
  "sentinel",
  "ingest",
  "retriever",
  "router",
  "literacy",
  "medsafe",
  "visit",
  "careplan",
  "auditor",
  "governor",
];
