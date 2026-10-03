import { createHmac, timingSafeEqual } from "node:crypto";

export type PaidPlan = "team" | "business";

export const PAID_PLANS: Record<PaidPlan, { name: string; usd: number; systems: string }> = {
  team: { name: "Team", usd: 5, systems: "50 AI systems" },
  business: { name: "Business", usd: 10, systems: "Unlimited AI systems" },
};

export const currency = () => (process.env.RAZORPAY_CURRENCY || "USD").toUpperCase();
/** Smallest currency unit (cents). Prices are defined in USD; other currencies need their own amounts. */
export const amountFor = (plan: PaidPlan) => PAID_PLANS[plan].usd * 100;

export const isPaidPlan = (v: unknown): v is PaidPlan => v === "team" || v === "business";

export function isBillingConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function hmac(secret: string, payload: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Checks the signature Razorpay Checkout returns after a subscription payment. */
export function verifyCheckoutSignature(paymentId: string, subscriptionId: string, signature: string, secret: string) {
  return safeEqualHex(hmac(secret, `${paymentId}|${subscriptionId}`), signature);
}

/** Checks the X-Razorpay-Signature header on a webhook body. */
export function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  return safeEqualHex(hmac(secret, rawBody), signature);
}

export type RazorpaySubscription = {
  id: string;
  plan_id: string;
  status: string;
  current_end: number | null;
  notes?: Record<string, string> | unknown[];
};

async function rzp<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: init?.method ?? "GET",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (json as { error?: { description?: string } })?.error?.description || `Razorpay error ${res.status}`;
    throw new Error(message);
  }
  return json as T;
}

export const createRazorpayPlan = (plan: PaidPlan) =>
  rzp<{ id: string }>("/plans", {
    method: "POST",
    body: {
      period: "monthly",
      interval: 1,
      item: { name: `Aegistra ${PAID_PLANS[plan].name}`, amount: amountFor(plan), currency: currency(), description: PAID_PLANS[plan].systems },
    },
  });

export const createRazorpaySubscription = (planId: string, notes: Record<string, string>) =>
  rzp<RazorpaySubscription>("/subscriptions", {
    method: "POST",
    body: { plan_id: planId, total_count: 120, quantity: 1, customer_notify: 1, notes },
  });

export const fetchRazorpaySubscription = (id: string) => rzp<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(id)}`);

export const cancelRazorpaySubscription = (id: string) =>
  rzp<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(id)}/cancel`, { method: "POST", body: { cancel_at_cycle_end: 1 } });

export function notesOf(sub: Pick<RazorpaySubscription, "notes">): { workspace_id?: string; plan?: string } {
  return sub.notes && !Array.isArray(sub.notes) ? (sub.notes as Record<string, string>) : {};
}
