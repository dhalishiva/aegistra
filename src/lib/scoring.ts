export type PriorityInputs = {
  dataSensitivity: "none" | "internal" | "personal" | "sensitive";
  autonomy: "assistive" | "recommendation" | "decision" | "autonomous";
  impact: "low" | "moderate" | "high";
  humanReview: boolean;
  publicInteraction: boolean;
  generatesContent: boolean;
};

export function scoreGovernancePriority(input: PriorityInputs) {
  const data = { none: 0, internal: 8, personal: 18, sensitive: 28 }[input.dataSensitivity];
  const autonomy = { assistive: 3, recommendation: 10, decision: 22, autonomous: 30 }[input.autonomy];
  const impact = { low: 4, moderate: 14, high: 25 }[input.impact];
  const review = input.humanReview ? 0 : 10;
  const exposure = (input.publicInteraction ? 4 : 0) + (input.generatesContent ? 3 : 0);
  const score = Math.min(100, data + autonomy + impact + review + exposure);
  const level = score >= 65 ? "high" : score >= 35 ? "medium" : "low";
  return { score, level } as const;
}
