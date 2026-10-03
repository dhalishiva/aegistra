import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function Signup() {
  return (
    <AuthShell
      kicker="Free plan"
      title="Create your account"
      lede="The Free plan covers your first 3 AI systems. No credit card."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="text-sky-300 underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
