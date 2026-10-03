import { describe, expect, it } from "vitest";
import { explainGovernancePriority, scoreGovernancePriority, type PriorityInputs } from "../scoring";

const base: PriorityInputs = {
  dataSensitivity: "none",
  autonomy: "assistive",
  impact: "low",
  humanReview: true,
  publicInteraction: false,
  generatesContent: false,
};

describe("scoreGovernancePriority", () => {
  it("scores the lowest-risk answers as low", () => {
    expect(scoreGovernancePriority(base)).toEqual({ score: 7, level: "low" });
  });

  it("adds the documented weights", () => {
    // personal 18 + decision 22 + high 25 + no human review 10 = 75
    const result = scoreGovernancePriority({
      ...base,
      dataSensitivity: "personal",
      autonomy: "decision",
      impact: "high",
      humanReview: false,
    });
    expect(result).toEqual({ score: 75, level: "high" });
  });

  it("caps the score at 100", () => {
    const result = scoreGovernancePriority({
      dataSensitivity: "sensitive",
      autonomy: "autonomous",
      impact: "high",
      humanReview: false,
      publicInteraction: true,
      generatesContent: true,
    });
    expect(result.score).toBe(100);
    expect(result.level).toBe("high");
  });

  it("switches level exactly at 35 and 65", () => {
    // 18 + 10 + 4 + 3 = 35 -> medium (one point lower would be low)
    expect(
      scoreGovernancePriority({ ...base, dataSensitivity: "personal", autonomy: "recommendation", generatesContent: true })
    ).toEqual({ score: 35, level: "medium" });
    expect(
      scoreGovernancePriority({ ...base, dataSensitivity: "personal", autonomy: "recommendation" })
    ).toEqual({ score: 32, level: "low" });
    // 18 + 22 + 25 = 65 -> high
    expect(
      scoreGovernancePriority({ ...base, dataSensitivity: "personal", autonomy: "decision", impact: "high" })
    ).toEqual({ score: 65, level: "high" });
  });

  it("explanation rows add up to the score", () => {
    const input: PriorityInputs = { ...base, dataSensitivity: "sensitive", autonomy: "decision", publicInteraction: true };
    const explained = explainGovernancePriority(input);
    expect(scoreGovernancePriority(input).score).toBe(Math.min(100, explained.parts.data + explained.parts.autonomy + explained.parts.impact + explained.parts.review + explained.parts.publicInteraction + explained.parts.generatesContent));
  });
});
