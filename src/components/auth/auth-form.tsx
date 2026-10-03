"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

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
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` } })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "signup" && !result.data.session) return setMessage("Check your email to confirm your account, then log in.");
    router.push(mode === "signup" ? "/onboarding" : "/app");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <div><label className="label">Work email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@company.com" /></div>
      <div><label className="label">Password</label><input className="input" type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="At least 6 characters" /></div>
      {message && <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">{message}</div>}
      <button disabled={loading} className="btn-primary w-full">{loading ? "Working…" : mode === "signup" ? "Create account" : "Log in"}</button>
    </form>
  );
}
