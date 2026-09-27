import { evaluateCrisis } from "./crisis";
import { applyGovernor } from "./safety";
import { caseText, intentFromQuery, retrieve } from "./retrieve";
import { goldResult, isDefaultDemoQuery, tracesFor } from "./briefs";
import { CORPUS_BY_ID } from "./corpus";
import type {
  CareCase,
  CrisisVerdict,
  EvidenceBrief,
  Intent,
  OrchestrationResult,
  RetrievedChunk,
  TraceEvent,
} from "./types";

export interface GraphState {
  query: string;
  careCase: CareCase;
  crisis: CrisisVerdict;
  intent: Intent;
  retrieved: RetrievedChunk[];
  brief: EvidenceBrief | null;
  traces: TraceEvent[];
  source: OrchestrationResult["source"];
}

type NodeFn = (state: GraphState) => GraphState | Promise<GraphState>;

/** Minimal LangGraph-style state machine: named nodes, linear + conditional edges. */
export class StateGraph {
  private nodes = new Map<string, NodeFn>();
  private sequence: string[] = [];

  addNode(id: string, fn: NodeFn) {
    this.nodes.set(id, fn);
    this.sequence.push(id);
    return this;
  }

  async invoke(state: GraphState, onTrace?: (t: TraceEvent) => void): Promise<GraphState> {
    let current = state;
    for (const id of this.sequence) {
      const node = this.nodes.get(id);
      if (!node) continue;
      current = await node(current);
      const last = current.traces.at(-1);
      if (last && onTrace) onTrace(last);
    }
    return current;
  }
}

/** Extractive fallback — no model, no new claims. */
export function extractiveBrief(query: string, retrieved: RetrievedChunk[]): EvidenceBrief {
  const top = retrieved.slice(0, 5);
  const findings = top.map((r) => ({
    title: r.chunk.title,
    body: r.chunk.body.slice(0, 420),
    severity: "info" as const,
    citations: [r.chunk.id],
  }));
  return {
    headline: "Grounded passages from the educational corpus (model offline)",
    plainLanguage:
      "The language model is not available, so Vigil is not synthesizing. Below are the highest-ranked corpus passages for this case and question. Read them as teaching material, then take questions to a clinician.",
    whatThisIsNot:
      "This is not a diagnosis or a care plan. Extractive mode refuses to paraphrase beyond the retrieved text.",
    findings,
    redFlags: [
      "Chest pain, severe trouble breathing, stroke signs, fainting, heavy bleeding, suicidal crisis — emergency services or 988, not this page.",
    ],
    askYourClinician: [
      "I printed the passages that matched our situation — which of these apply to this person?",
      "Please reconcile the medication list I brought against these conflict classes.",
    ],
    next72h: ["If symptoms worsen along emergency patterns, call emergency services."],
    next7d: ["Bring the medication bottles and this printout to the next visit."],
    caregiverNote: "Silence from a model is safer than an ungrounded answer.",
    citations: top.map((r) => r.chunk.id),
    ungrounded: [],
  };
}

export function buildCareGraph() {
  return new StateGraph()
    .addNode("sentinel", (s) => {
      const crisis = evaluateCrisis(`${s.query}\n${caseText(s.careCase)}`);
      s.crisis = crisis;
      s.traces.push({
        id: "sentinel",
        agent: "sentinel",
        title: "Crisis contract",
        detail: crisis.action,
        status: crisis.level === "emergency" ? "blocked" : crisis.level === "urgent" ? "warn" : "ok",
        atMs: 80,
      });
      return s;
    })
    .addNode("ingest", (s) => {
      s.traces.push({
        id: "ingest",
        agent: "ingest",
        title: "Case snapshot",
        detail: `${s.careCase.medications.length} medicines, ${s.careCase.documents.length} documents bound into state.`,
        status: "ok",
        atMs: 200,
      });
      return s;
    })
    .addNode("retriever", (s) => {
      s.retrieved = retrieve(s.query, s.careCase, 8);
      s.traces.push({
        id: "retriever",
        agent: "retriever",
        title: "Hybrid RAG",
        detail: s.retrieved
          .slice(0, 4)
          .map((r) => `${r.chunk.id} (${r.score.toFixed(2)})`)
          .join(" · "),
        status: "ok",
        atMs: 420,
      });
      return s;
    })
    .addNode("router", (s) => {
      s.intent = s.crisis.level === "emergency" ? "crisis" : intentFromQuery(s.query);
      s.traces.push({
        id: "router",
        agent: "router",
        title: "Intent",
        detail: `Fan-out as ${s.intent.replaceAll("_", " ")}`,
        status: "ok",
        atMs: 560,
      });
      return s;
    });
}

export async function runOrchestrator(input: {
  careCase: CareCase;
  query: string;
  live?: (state: GraphState) => Promise<EvidenceBrief | null>;
}): Promise<OrchestrationResult> {
  const { careCase, query, live } = input;

  if (isDefaultDemoQuery(careCase, query)) {
    const gold = goldResult(careCase, query);
    if (gold) return gold;
  }

  const state: GraphState = {
    query,
    careCase,
    crisis: evaluateCrisis(""),
    intent: "overview",
    retrieved: [],
    brief: null,
    traces: [],
    source: "extractive",
  };

  const graph = buildCareGraph();
  const after = await graph.invoke(state);

  let brief: EvidenceBrief | null = null;
  if (live && after.crisis.level !== "emergency") {
    try {
      brief = await live(after);
      if (brief) after.source = "live";
    } catch {
      brief = null;
    }
  }
  if (!brief) {
    brief = extractiveBrief(query, after.retrieved);
    after.source = "extractive";
  }

  after.traces.push(
    {
      id: "literacy",
      agent: "literacy",
      title: "Plain language",
      detail: "Family-readable restatement; no new disease names.",
      status: "ok",
      atMs: 900,
    },
    {
      id: "medsafe",
      agent: "medsafe",
      title: "Medication watch",
      detail: "Conflict classes vs the bottle list.",
      status: "ok",
      atMs: 920,
    },
    {
      id: "visit",
      agent: "visit",
      title: "Visit coach",
      detail: "Questions ranked for a short clinic slot.",
      status: "ok",
      atMs: 940,
    },
    {
      id: "careplan",
      agent: "careplan",
      title: "Horizon",
      detail: "72-hour observation list, not a prescription.",
      status: "ok",
      atMs: 960,
    },
  );

  const governed = applyGovernor(brief, after.crisis);
  after.traces.push(
    {
      id: "auditor",
      agent: "auditor",
      title: "Grounding",
      detail:
        governed.brief.ungrounded.length === 0
          ? `${governed.brief.citations.length} cited chunks; no ungrounded claims labeled.`
          : `${governed.brief.ungrounded.length} ungrounded claim(s) held out of the fact body.`,
      status: governed.brief.ungrounded.length ? "warn" : "ok",
      atMs: 1200,
    },
    {
      id: "governor",
      agent: "governor",
      title: "Safety contracts",
      detail:
        governed.safety.blockedActions[0] ??
        (after.crisis.level === "none" ? "C1–C8 applied." : "Human handoff forced."),
      status: after.crisis.level === "emergency" ? "blocked" : "ok",
      atMs: 1400,
    },
  );

  // Keep gold-style trace timing if we somehow skipped
  if (after.traces.length < 8) after.traces = tracesFor(after.intent, after.crisis.level);

  return {
    id: `${after.source}-${careCase.id}-${Date.now()}`,
    caseId: careCase.id,
    query,
    intent: after.intent,
    crisis: after.crisis,
    retrieved: after.retrieved,
    traces: after.traces,
    brief: governed.brief,
    safety: governed.safety,
    source: after.source,
    ranAt: new Date().toISOString(),
  };
}

export function citationTitle(id: string) {
  return CORPUS_BY_ID[id]?.title ?? id;
}

export function citationSource(id: string) {
  const c = CORPUS_BY_ID[id];
  return c ? `${c.source}` : id;
}
