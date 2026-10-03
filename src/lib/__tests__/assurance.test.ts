import { describe, expect, it } from "vitest";
import { packCsvRows, packStats, type AssurancePack } from "../assurance";
import { buildAssurancePdf } from "../assurance-pdf";

const pack: AssurancePack = {
  workspaceName: "Acme – Ltd ✓",
  generatedAt: new Date("2026-10-03T00:00:00Z"),
  systems: [
    { id: "1", name: "Support bot", provider: "Acme", purpose: "Answers customers. ".repeat(40), owner_name: "Priya", owner_email: "p@acme.test", lifecycle: "production", data_sensitivity: "personal", autonomy: "decision", impact: "high", human_review: false, public_interaction: true, generates_content: true, priority_score: 82, priority_level: "high", review_due: "2026-09-01", last_reviewed: null, notes: "https://example.com/" + "a".repeat(200) },
    { id: "2", name: "Notes", provider: null, purpose: "Summaries", owner_name: null, owner_email: null, lifecycle: "pilot", data_sensitivity: "none", autonomy: "assistive", impact: "low", human_review: true, public_interaction: false, generates_content: false, priority_score: 7, priority_level: "low", review_due: null, last_reviewed: null, notes: null },
  ],
  reviews: [{ ai_system_id: "1", outcome: "approved", notes: "=cmd", reviewed_at: "2026-08-01T00:00:00Z", next_review_due: null }],
  actions: [{ ai_system_id: "1", title: "Add human review", owner: null, due_date: "2026-09-15", status: "open", completed_at: null }],
  evidence: [{ ai_system_id: "1", title: "DPIA", evidence_type: "file", file_name: "dpia.pdf", url: null, notes: null, valid_until: "2026-01-01", created_at: "2026-02-01T00:00:00Z" }],
};

describe("assurance pack", () => {
  it("computes summary figures", () => {
    const s = packStats(pack);
    expect(s).toMatchObject({ systems: 2, high: 1, low: 1, overdue: 1, noOwner: 1, openActions: 1, overdueActions: 1, expiredEvidence: 1, withoutEvidence: 1 });
  });
  it("builds a valid multi-page PDF with non-Latin text and long tokens", async () => {
    const bytes = await buildAssurancePdf(pack);
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(2000);
  });
  it("builds an empty-register PDF", async () => {
    const bytes = await buildAssurancePdf({ ...pack, systems: [], reviews: [], actions: [], evidence: [] });
    expect(bytes.length).toBeGreaterThan(1000);
  });
  it("joins register rows with review, action and evidence counts", () => {
    const { rows } = packCsvRows(pack, "register");
    expect(rows[0]).toMatchObject({ review_overdue: "yes", latest_review_outcome: "approved", open_actions: 1, evidence_items: 1 });
  });
});
