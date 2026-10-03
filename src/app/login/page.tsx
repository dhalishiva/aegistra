import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

export default function Login() {
  return (
    <AuthShell
      kicker="Welcome back"
      title="Log in"
      lede="Continue to your AI governance workspace."
      footer={
        <>
          New to Aegistra?{" "}
          <Link href="/signup" className="text-sky-300 underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
