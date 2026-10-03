"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "./supabase-admin";
import { getSessionContext } from "./workspace";
import {
  PAID_PLANS,
  amountFor,
  cancelRazorpaySubscription,
  createRazorpayPlan,
  createRazorpaySubscription,
  currency,
  fetchRazorpaySubscription,
  isBillingConfigured,
  isPaidPlan,
  notesOf,
  verifyCheckoutSignature,
} from "./razorpay";

type Result<T> = ({ ok: true } & T) | { ok: false; error: string };

async function requireOwner() {
  const ctx = await getSessionContext();
  if (ctx.membership.role !== "owner") throw new Error("Only the workspace owner can manage billing.");
  return ctx;
}

async function planIdFor(plan: "team" | "business") {
  const admin = createAdminClient();
  const key = `${plan}:${currency()}:${amountFor(plan)}`;
  const { data } = await admin.from("billing_plans").select("razorpay_plan_id").eq("key", key).maybeSingle();
  if (data?.razorpay_plan_id) return data.razorpay_plan_id as string;
  const created = await createRazorpayPlan(plan);
  await admin.from("billing_plans").upsert({ key, razorpay_plan_id: created.id, currency: currency(), amount: amountFor(plan) });
  return created.id;
}

/** Starts a Razorpay subscription for the owner's workspace and returns what Checkout needs. */
export async function startCheckout(plan: string): Promise<Result<{ keyId: string; subscriptionId: string; name: string; description: string; email: string }>> {
  try {
    if (!isBillingConfigured()) return { ok: false, error: "Billing is not set up yet. Please contact support." };
    if (!isPaidPlan(plan)) return { ok: false, error: "Choose Team or Business." };
    const { workspace, user } = await requireOwner();

    const admin = createAdminClient();
    const { data: current } = await admin.from("workspaces").select("plan,billing_status").eq("id", workspace.id).single();
    if (current?.plan === plan && current.billing_status === "active") return { ok: false, error: `You are already on the ${PAID_PLANS[plan].name} plan.` };
    if (current?.billing_status === "active" || current?.billing_status === "cancelling") {
      return { ok: false, error: "Cancel your current subscription first, then choose a different plan once it ends." };
    }

    const sub = await createRazorpaySubscription(await planIdFor(plan), { workspace_id: workspace.id, plan });
    await admin.from("workspaces").update({ billing_subscription_id: sub.id, billing_status: "pending" }).eq("id", workspace.id);
    return {
      ok: true,
      keyId: process.env.RAZORPAY_KEY_ID!,
      subscriptionId: sub.id,
      name: "Aegistra",
      description: `${PAID_PLANS[plan].name} plan - $${PAID_PLANS[plan].usd}/month`,
      email: user.email ?? "",
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not start checkout." };
  }
}

/** Called by the browser after Checkout succeeds. The webhook is the source of truth; this makes the upgrade immediate. */
export async function confirmPayment(input: { paymentId: string; subscriptionId: string; signature: string }): Promise<Result<{ plan: string }>> {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return { ok: false, error: "Billing is not set up yet." };
    const { workspace } = await requireOwner();
    if (!verifyCheckoutSignature(input.paymentId, input.subscriptionId, input.signature, secret)) {
      return { ok: false, error: "We could not verify that payment." };
    }
    const sub = await fetchRazorpaySubscription(input.subscriptionId);
    const notes = notesOf(sub);
    if (notes.workspace_id !== workspace.id || !isPaidPlan(notes.plan)) return { ok: false, error: "That payment does not belong to this workspace." };

    await createAdminClient()
      .from("workspaces")
      .update({
        plan: notes.plan,
        billing_subscription_id: sub.id,
        billing_status: "active",
        billing_period_end: sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null,
      })
      .eq("id", workspace.id);
    revalidatePath("/app", "layout");
    return { ok: true, plan: notes.plan };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not confirm the payment." };
  }
}

/** Cancels at the end of the paid period; the plan stays until then. */
export async function cancelSubscription(): Promise<Result<object>> {
  try {
    const { workspace } = await requireOwner();
    const admin = createAdminClient();
    const { data } = await admin.from("workspaces").select("billing_subscription_id").eq("id", workspace.id).single();
    if (!data?.billing_subscription_id) return { ok: false, error: "There is no active subscription." };
    await cancelRazorpaySubscription(data.billing_subscription_id);
    await admin.from("workspaces").update({ billing_status: "cancelling" }).eq("id", workspace.id);
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not cancel the subscription." };
  }
}
