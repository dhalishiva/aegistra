import { scoreGovernancePriority, type PriorityInputs } from "@/lib/scoring";

type SampleSystem = {
  name: string;
  provider: string;
  purpose: string;
  owner: string | null;
  lifecycle: "Pilot" | "Production" | "Paused" | "Retired";
  review: string | null;
  inputs: PriorityInputs;
};

const systems: SampleSystem[] = [
  {
    name: "Candidate screening copilot",
    provider: "Recruiting vendor",
    purpose: "Ranks inbound job applicants",
    owner: "Priya Nair",
    lifecycle: "Production",
    review: "2026-10-01",
    inputs: {
      dataSensitivity: "personal",
      autonomy: "decision",
      impact: "high",
      humanReview: false,
      publicInteraction: false,
      generatesContent: false,
    },
  },
  {
    name: "Support reply agent",
    provider: "Model API",
    purpose: "Drafts replies to customer tickets",
    owner: "Marcus Lee",
    lifecycle: "Production",
    review: "2026-12-01",
    inputs: {
      dataSensitivity: "personal",
      autonomy: "recommendation",
      impact: "moderate",
      humanReview: true,
      publicInteraction: true,
      generatesContent: true,
    },
  },
  {
    name: "Contract clause finder",
    provider: "Legal research tool",
    purpose: "Finds clauses in vendor contracts",
    owner: "Ana Ruiz",
    lifecycle: "Pilot",
    review: "2026-12-10",
    inputs: {
      dataSensitivity: "internal",
      autonomy: "recommendation",
      impact: "moderate",
      humanReview: true,
      publicInteraction: false,
      generatesContent: true,
    },
  },
  {
    name: "Meeting summarizer",
    provider: "Built into a meeting app",
    purpose: "Summarizes internal calls",
    owner: null,
    lifecycle: "Production",
    review: null,
    inputs: {
      dataSensitivity: "internal",
      autonomy: "assistive",
      impact: "low",
      humanReview: true,
      publicInteraction: false,
      generatesContent: true,
    },
  },
];

// Scores come from the same function the app uses, so the samples are always consistent.
export const sampleSystems = systems
  .map((system) => ({ ...system, ...scoreGovernancePriority(system.inputs) }))
  .sort((a, b) => b.score - a.score);

export const sampleActions = [
  { title: "Review vendor data retention terms", owner: "Priya Nair", due: "2026-10-15" },
  { title: "Add human sign-off to candidate shortlists", owner: "Priya Nair", due: "2026-10-20" },
  { title: "Assign an owner to Meeting summarizer", owner: "Ops", due: "2026-10-25" },
] as const;
