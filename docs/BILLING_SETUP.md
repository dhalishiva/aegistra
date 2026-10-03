# Billing setup (Razorpay)

Plans: Free (3 AI systems), Team ($5/month, 50 systems), Business ($10/month, unlimited).

## 1. Database
Run `supabase/migrations/014_billing.sql` in the Supabase SQL editor (once).

## 2. Razorpay dashboard
1. Settings -> API Keys: generate a key pair (test mode first). The Key ID looks like `rzp_test_...`.
2. International payments: USD prices need "International payments" enabled on the account. Without it, set
   `RAZORPAY_CURRENCY=INR` is NOT enough: amounts are defined in USD cents, so enable international payments or
   change the amounts in `src/lib/razorpay.ts`.
3. Settings -> Webhooks -> Add new webhook
   - URL: `https://aegistra.vercel.app/api/razorpay/webhook`
   - Secret: a long random string (this becomes `RAZORPAY_WEBHOOK_SECRET`)
   - Events: `subscription.activated`, `subscription.charged`, `subscription.pending`, `subscription.halted`,
     `subscription.cancelled`, `subscription.completed`, `subscription.resumed`

## 3. Vercel environment variables (Production and Preview)
`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (Secret), `RAZORPAY_WEBHOOK_SECRET` (Secret), optional `RAZORPAY_CURRENCY`.
Redeploy afterwards.

## 4. Test
Settings -> Plan and billing -> Upgrade. Test card: 4111 1111 1111 1111, any future expiry, any CVV, OTP 1234 / "success".
The plan changes immediately after Checkout and again (idempotently) when the webhook arrives.

## How it works
- Owner clicks Upgrade -> server creates a Razorpay subscription (plan ids are created once and cached in `billing_plans`).
- Checkout returns a signature; the server verifies it with the key secret, re-reads the subscription from Razorpay and
  sets `workspaces.plan`. Clients cannot write `plan` (column privileges, migration 013).
- The webhook (HMAC-verified, de-duplicated in `billing_events`) keeps the plan in sync: charged/activated -> paid plan,
  cancelled/completed/halted -> back to Free. Existing systems are kept; adding more is blocked above the Free limit.
- Cancelling stops renewal and keeps the plan until the paid period ends.
