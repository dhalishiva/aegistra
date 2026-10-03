"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { OtpInput } from "./otp-input";

const RESEND_SECONDS = 45;

export function ForgotPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error && /rate|seconds/i.test(error.message)) {
      return setMessage("Too many requests. Wait a minute and try again.");
    }
    // The same screen is shown whether or not the address has an account, so this form cannot be used to
    // find out who is registered.
    setStep("reset");
    setCooldown(RESEND_SECONDS);
  }

  async function reset(event: FormEvent) {
    event.preventDefault();
    if (code.length !== 6) return setMessage("Enter all 6 digits.");
    if (password.length < 8) return setMessage("Use at least 8 characters for the new password.");
    setLoading(true);
    setMessage("");
    const verified = await supabase.auth.verifyOtp({ email, token: code, type: "recovery" });
    if (verified.error) {
      setLoading(false);
      return setMessage("That code is wrong or has expired. Request a new one.");
    }
    const updated = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updated.error) return setMessage(updated.error.message);
    router.push("/app");
    router.refresh();
  }

  const status = (
    <div aria-live="polite">
      {message && (
        <div role="status" className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
          {message}
        </div>
      )}
    </div>
  );

  if (step === "email") {
    return (
      <form onSubmit={sendCode} className="mt-7 space-y-4">
        <div>
          <label htmlFor="email" className="label">Work email</label>
          <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        {status}
        <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Sending…" : "Send 6-digit code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={reset} className="mt-7 space-y-5">
      <p className="text-sm leading-6 text-slate-300">
        If <strong className="text-white">{email}</strong> has an Aegistra account, we sent it a 6-digit code. Enter the
        code and choose a new password.
      </p>
      <OtpInput value={code} onChange={setCode} disabled={loading} />
      <div>
        <label htmlFor="new-password" className="label">New password</label>
        <input id="new-password" className="input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
      </div>
      {status}
      <button disabled={loading || code.length !== 6} className="btn-primary w-full disabled:opacity-60">
        {loading ? "Updating…" : "Set new password"}
      </button>
      <div className="flex items-center justify-between text-sm text-slate-400">
        <button type="button" onClick={() => sendCode()} disabled={cooldown > 0 || loading} className="underline underline-offset-4 disabled:no-underline disabled:opacity-60">
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        <button type="button" onClick={() => { setStep("email"); setCode(""); setMessage(""); }} className="underline underline-offset-4">
          Use a different email
        </button>
      </div>
    </form>
  );
}
