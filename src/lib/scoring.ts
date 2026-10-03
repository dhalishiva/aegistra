export type PriorityInputs = {
  dataSensitivity: "none" | "internal" | "personal" | "sensitive";
  autonomy: "assistive" | "recommendation" | "decision" | "autonomous";
  impact: "low" | "moderate" | "high";
  humanReview: boolean;
  publicInteraction: boolean;
  generatesContent: boolean;
};

export type PriorityLevel = "high" | "medium" | "low";

// Weights live here so the app, the homepage demo and the published scoring table
// can never drift apart.
export const DATA_WEIGHTS = { none: 0, internal: 8, personal: 18, sensitive: 28 } as const;
export const AUTONOMY_WEIGHTS = { assistive: 3, recommendation: 10, decision: 22, autonomous: 30 } as const;
export const IMPACT_WEIGHTS = { low: 4, moderate: 14, high: 25 } as const;
export const NO_HUMAN_REVIEW_POINTS = 10;
export const PUBLIC_INTERACTION_POINTS = 4;
export const GENERATES_CONTENT_POINTS = 3;
export const HIGH_THRESHOLD = 65;
export const MEDIUM_THRESHOLD = 35;

export function explainGovernancePriority(input: PriorityInputs) {
  const parts = {
    data: DATA_WEIGHTS[input.dataSensitivity],
    autonomy: AUTONOMY_WEIGHTS[input.autonomy],
    impact: IMPACT_WEIGHTS[input.impact],
    review: input.humanReview ? 0 : NO_HUMAN_REVIEW_POINTS,
    publicInteraction: input.publicInteraction ? PUBLIC_INTERACTION_POINTS : 0,
    generatesContent: input.generatesContent ? GENERATES_CONTENT_POINTS : 0,
  };
  const total = Object.values(parts).reduce((sum, points) => sum + points, 0);
  const score = Math.min(100, total);
  const level: PriorityLevel =
    score >= HIGH_THRESHOLD ? "high" : score >= MEDIUM_THRESHOLD ? "medium" : "low";
  return { score, level, parts } as const;
}

export function scoreGovernancePriority(input: PriorityInputs) {
  const { score, level } = explainGovernancePriority(input);
  return { score, level } as const;
}
