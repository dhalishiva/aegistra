import { createAdminClient } from "@/lib/supabase-admin";
import { fetchRazorpaySubscription, isPaidPlan, notesOf, verifyWebhookSignature, type RazorpaySubscription } from "@/lib/razorpay";

export const runtime = "nodejs";

type Payload = { event?: string; payload?: { subscription?: { entity?: RazorpaySubscription } } };

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook secret not configured", { status: 503 });

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!signature || !verifyWebhookSignature(raw, signature, secret)) return new Response("Invalid signature", { status: 401 });

  let body: Payload;
  try { body = JSON.parse(raw); } catch { return new Response("Bad request", { status: 400 }); }

  const event = body.event ?? "";
  const eventId = request.headers.get("x-razorpay-event-id");
  const admin = createAdminClient();

  if (eventId) {
    const { error } = await admin.from("billing_events").insert({ event_id: eventId, event });
    if (error?.code === "23505") return Response.json({ ok: true, duplicate: true }); // already handled
  }

  const entity = body.payload?.subscription?.entity;
  if (!entity?.id) return Response.json({ ok: true, ignored: event });

  // Trust Razorpay's API over the webhook body for the current state.
  const sub = await fetchRazorpaySubscription(entity.id).catch(() => entity);
  const notes = notesOf(sub);
  if (!notes.workspace_id) return Response.json({ ok: true, ignored: "no workspace" });

  const periodEnd = sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null;
  let update: Record<string, unknown> | null = null;

  switch (event) {
    case "subscription.activated":
    case "subscription.charged":
    case "subscription.resumed":
      if (isPaidPlan(notes.plan)) update = { plan: notes.plan, billing_status: "active", billing_period_end: periodEnd, billing_subscription_id: sub.id };
      break;
    case "subscription.pending":
    case "subscription.halted":
      update = { billing_status: "past_due" };
      if (event === "subscription.halted") update = { plan: "free", billing_status: "halted" };
      break;
    case "subscription.cancelled":
    case "subscription.completed":
    case "subscription.expired":
      update = { plan: "free", billing_status: "ended", billing_period_end: periodEnd };
      break;
  }

  if (update) {
    // Only touch the workspace if this is still its current subscription.
    await admin.from("workspaces").update(update).eq("id", notes.workspace_id).eq("billing_subscription_id", sub.id);
  }
  return Response.json({ ok: true });
}
