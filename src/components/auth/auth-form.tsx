"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { safeRedirectPath } from "@/lib/safe-redirect";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setMessage("");
    const requestedNext = new URLSearchParams(window.location.search).get("next");
    const signupNext = safeRedirectPath(requestedNext, "/onboarding");
    const result = mode === "signup"
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(signupNext)}`,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "signup" && !result.data.session) return setMessage("Check your email to confirm your account, then log in.");
    // Preserve safe invite/protected destinations through both login and signup.
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(
      mode === "signup"
        ? safeRedirectPath(next, "/onboarding")
        : safeRedirectPath(next, "/app")
    );
    router.refresh();
  }

  const isSignup = mode === "signup";
  return (
    <form onSubmit={submit} className="mt-7 space-y-4" noValidate={false}>
      <div>
        <label htmlFor="email" className="label">Work email</label>
        <input id="email" name="email" className="input" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@company.com" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" className="input" type="password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="At least 6 characters" aria-describedby={isSignup ? "password-hint" : undefined} />
        {isSignup && <p id="password-hint" className="mt-1.5 text-xs text-slate-400">Use at least 6 characters.</p>}
      </div>
      <div aria-live="polite">
        {message && <div role="status" className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">{message}</div>}
      </div>
      <button disabled={loading} className="btn-primary w-full disabled:opacity-60">{loading ? "Working…" : isSignup ? "Create account" : "Log in"}</button>
    </form>
  );
}
