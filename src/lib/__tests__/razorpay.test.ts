import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { PAID_PLANS, amountFor, isPaidPlan, notesOf, verifyCheckoutSignature, verifyWebhookSignature } from "../razorpay";

const sign = (secret: string, payload: string) => createHmac("sha256", secret).update(payload).digest("hex");

describe("razorpay helpers", () => {
  it("prices Team at $5 and Business at $10, in cents", () => {
    expect(PAID_PLANS.team.usd).toBe(5);
    expect(PAID_PLANS.business.usd).toBe(10);
    expect(amountFor("team")).toBe(500);
    expect(amountFor("business")).toBe(1000);
  });
  it("accepts only paid plan names", () => {
    expect(isPaidPlan("team")).toBe(true);
    expect(isPaidPlan("business")).toBe(true);
    for (const v of ["free", "enterprise", "", null, undefined, "TEAM"]) expect(isPaidPlan(v)).toBe(false);
  });
  it("verifies checkout signatures and rejects tampering", () => {
    const good = sign("s3cret", "pay_1|sub_1");
    expect(verifyCheckoutSignature("pay_1", "sub_1", good, "s3cret")).toBe(true);
    expect(verifyCheckoutSignature("pay_2", "sub_1", good, "s3cret")).toBe(false);
    expect(verifyCheckoutSignature("pay_1", "sub_1", good, "other")).toBe(false);
    expect(verifyCheckoutSignature("pay_1", "sub_1", "short", "s3cret")).toBe(false);
  });
  it("verifies webhook signatures over the raw body", () => {
    const body = '{"event":"subscription.charged"}';
    expect(verifyWebhookSignature(body, sign("wh", body), "wh")).toBe(true);
    expect(verifyWebhookSignature(body + " ", sign("wh", body), "wh")).toBe(false);
  });
  it("reads notes only when they are an object", () => {
    expect(notesOf({ notes: { workspace_id: "w", plan: "team" } })).toEqual({ workspace_id: "w", plan: "team" });
    expect(notesOf({ notes: [] })).toEqual({});
    expect(notesOf({})).toEqual({});
  });
});
