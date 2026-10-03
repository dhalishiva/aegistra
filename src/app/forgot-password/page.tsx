import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = { title: "Reset your password — Aegistra" };

export default function ForgotPassword() {
  return (
    <AuthShell
      kicker="Password reset"
      title="Reset your password"
      lede="Enter your email and we will send a 6-digit code."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-sky-300 underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
