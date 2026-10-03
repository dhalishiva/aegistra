"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { Spinner } from "@/components/submit-button";
import { OtpInput } from "./otp-input";

const RESEND_SECONDS = 45;

function friendly(message: string) {
  const text = message.toLowerCase();
  if (text.includes("invalid login")) return "That email and password don't match. Check them and try again.";
  if (text.includes("expired") || text.includes("invalid")) return "That code is wrong or has expired. Request a new one.";
  if (text.includes("rate") || text.includes("seconds")) return "Too many attempts. Wait a minute and try again.";
  return message;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const supabase = createClient();
  const isSignup = mode === "signup";

  const [step, setStep] = useState<"details" | "code">("details");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function nextPath(fallback: string) {
    return safeRedirectPath(new URLSearchParams(window.location.search).get("next"), fallback);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!isSignup) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        return setMessage(friendly(error.message));
      }
      // Keep the button busy until the next page takes over.
      router.push(nextPath("/app"));
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath("/onboarding"))}`,
      },
    });
    if (error || !data.session) setLoading(false);
    if (error) return setMessage(friendly(error.message));
    if (data.session) {
      // Email confirmation is switched off in Supabase: the user is already signed in.
      router.push(nextPath("/onboarding"));
      router.refresh();
      return;
    }
    setStep("code");
    setCooldown(RESEND_SECONDS);
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (code.length !== 6) return setMessage("Enter all 6 digits.");
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" });
    if (error) {
      setLoading(false);
      return setMessage(friendly(error.message));
    }
    router.push(nextPath("/onboarding"));
    router.refresh();
  }

  async function resend() {
    setMessage("");
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) return setMessage(friendly(error.message));
    setCode("");
    setCooldown(RESEND_SECONDS);
    setMessage("We sent a new code.");
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

  if (step === "code") {
    return (
      <form onSubmit={verify} className="mt-7 space-y-5">
        <p className="text-sm leading-6 text-slate-300">
          We sent a 6-digit code to <strong className="text-white">{email}</strong>. It can take a minute to arrive. Check
          your spam folder too.
        </p>
        <OtpInput value={code} onChange={setCode} disabled={loading} />
        {status}
        <button disabled={loading || code.length !== 6} className="btn-primary w-full gap-2 disabled:opacity-60">
          {loading ? <><Spinner />Verifying…</> : "Verify and continue"}
        </button>
        <div className="flex items-center justify-between text-sm text-slate-400">
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0}
            className="underline underline-offset-4 disabled:no-underline disabled:opacity-60"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("details");
              setCode("");
              setMessage("");
            }}
            className="underline underline-offset-4"
          >
            Use a different email
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <div>
        <label htmlFor="email" className="label">Work email</label>
        <input id="email" name="email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">Password</label>
          {!isSignup && (
            <Link href="/forgot-password" className="mb-1.5 text-sm text-sky-300 underline underline-offset-4">
              Forgot password?
            </Link>
          )}
        </div>
        <input id="password" name="password" className="input" type="password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="At least 8 characters" aria-describedby={isSignup ? "password-hint" : undefined} />
        {isSignup && <p id="password-hint" className="mt-1.5 text-xs text-slate-400">Use at least 8 characters. We will email you a 6-digit code to confirm your address.</p>}
      </div>
      {status}
      <button disabled={loading} className="btn-primary w-full gap-2 disabled:opacity-60">
        {loading ? <><Spinner />{isSignup ? "Creating account…" : "Logging in…"}</> : isSignup ? "Create account" : "Log in"}
      </button>
    </form>
  );
}
