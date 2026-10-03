"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelSubscription, confirmPayment, startCheckout } from "@/lib/billing-actions";
import { Spinner } from "@/components/submit-button";

type Props = {
  plan: string;
  status: string | null;
  periodEnd: string | null;
  isOwner: boolean;
  configured: boolean;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: () => void) => void };
  }
}

const PLANS = [
  { key: "team", name: "Team", price: 5, systems: "Up to 50 AI systems" },
  { key: "business", name: "Business", price: 10, systems: "Unlimited AI systems" },
] as const;

export function BillingPanel({ plan, status, periodEnd, isOwner, configured }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [, startTransition] = useTransition();
  const paid = plan === "team" || plan === "business";
  const ends = periodEnd ? new Date(periodEnd).toLocaleDateString(undefined, { dateStyle: "long" }) : null;

  async function subscribe(target: string) {
    setMessage("");
    setBusy(target);
    const start = await startCheckout(target);
    if (!start.ok) {
      setBusy(null);
      return setMessage(start.error);
    }
    if (!window.Razorpay) {
      setBusy(null);
      return setMessage("The payment window could not load. Check your connection and try again.");
    }
    const checkout = new window.Razorpay({
      key: start.keyId,
      subscription_id: start.subscriptionId,
      name: start.name,
      description: start.description,
      prefill: { email: start.email },
      theme: { color: "#2d4cf2" },
      modal: { ondismiss: () => setBusy(null) },
      handler: async (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
        const result = await confirmPayment({
          paymentId: response.razorpay_payment_id,
          subscriptionId: response.razorpay_subscription_id,
          signature: response.razorpay_signature,
        });
        setBusy(null);
        if (!result.ok) return setMessage(result.error);
        setMessage("Payment received. Your plan is now active.");
        startTransition(() => router.refresh());
      },
    });
    checkout.on("payment.failed", () => {
      setBusy(null);
      setMessage("The payment did not go through. You were not charged. Try again or use another method.");
    });
    checkout.open();
  }

  async function cancel() {
    if (!window.confirm("Cancel your subscription? You keep your plan until the end of the period you have paid for.")) return;
    setMessage("");
    setBusy("cancel");
    const result = await cancelSubscription();
    setBusy(null);
    if (!result.ok) return setMessage(result.error);
    setMessage("Subscription cancelled. Your plan stays active until the end of the current period.");
    startTransition(() => router.refresh());
  }

  return (
    <section id="billing" className="card mt-5 p-5">
      {configured && isOwner && <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">Plan and billing</h2>
          <p className="mt-1 text-sm text-slate-400">
            Current plan: <strong className="capitalize text-white">{plan}</strong>
            {status === "cancelling" && ends ? ` — cancelled, active until ${ends}` : ""}
            {status === "active" && ends ? ` — renews on ${ends}` : ""}
            {status === "past_due" ? " — last payment failed" : ""}
          </p>
        </div>
        {isOwner && paid && status !== "cancelling" && (
          <button onClick={cancel} disabled={busy !== null} className="btn-secondary gap-2 px-3 py-2 text-sm disabled:opacity-70">
            {busy === "cancel" && <Spinner />}
            Cancel subscription
          </button>
        )}
      </div>

      {!configured ? (
        <p className="mt-4 rounded-lg border border-white/10 p-3 text-sm text-slate-400">Paid plans are being set up. Email support@dhaliservices.in to upgrade now.</p>
      ) : !isOwner ? (
        <p className="mt-4 text-sm text-slate-400">Only the workspace owner can change the plan.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PLANS.map((p) => {
            const current = plan === p.key;
            const blocked = status === "active" || status === "cancelling";
            return (
              <div key={p.key} className={`rounded-xl border-2 p-4 ${current ? "border-sky-400" : "border-white/20"}`}>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold">{p.name}</h3>
                  <div><span className="text-2xl font-bold">${p.price}</span><span className="text-xs text-slate-400"> / month</span></div>
                </div>
                <p className="mt-1 text-sm text-slate-400">{p.systems}</p>
                <button
                  onClick={() => subscribe(p.key)}
                  disabled={busy !== null || current || blocked}
                  className="btn-primary mt-4 w-full gap-2 disabled:opacity-60"
                >
                  {busy === p.key && <Spinner />}
                  {current ? "Current plan" : blocked ? "Cancel current plan first" : `Upgrade to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div aria-live="polite" className="mt-3 text-sm">{message}</div>
      <p className="mt-2 text-xs text-slate-500">Payments are processed by Razorpay. Cancel any time; you keep access until the period ends.</p>
    </section>
  );
}
