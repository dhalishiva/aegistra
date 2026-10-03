import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { acceptWorkspaceInvitation } from "@/lib/team-actions";
import { createClient } from "@/lib/supabase-server";

const errorMessages: Record<string, string> = {
  wrong_email:
    "You are signed in with a different email address. Sign out and use the email that received this invitation.",
  existing_workspace:
    "This account already belongs to another workspace. Workspace switching is not enabled yet.",
  invalid:
    "This invitation is invalid, expired, revoked, or has already been used.",
  failed: "The invitation could not be accepted. Please ask the workspace admin to create a new invite.",
};

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nextPath = `/invite/${token}`;

  return (
    <main className="container-shell grid min-h-screen place-items-center py-12">
      <div className="w-full max-w-lg">
        <Link href="/">
          <Logo />
        </Link>

        <div className="card mt-7 p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-sky-400/10 p-2.5 text-sky-300">
              <MailCheck size={22} />
            </div>
            <div>
              <div className="kicker">Workspace invitation</div>
              <h1 className="mt-2 text-3xl font-bold">Join an Aegistra team</h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-400">
            This invitation is tied to one email address and expires after seven
            days. Aegistra verifies your signed-in email before granting
            workspace access.
          </p>

          {error && errorMessages[error] && (
            <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-100">
              {errorMessages[error]}
            </div>
          )}

          {user ? (
            <div className="mt-6">
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-xs text-slate-500">Signed in as</div>
                <div className="mt-1 font-semibold">{user.email}</div>
              </div>

              <form action={acceptWorkspaceInvitation} className="mt-4">
                <input type="hidden" name="token" value={token} />
                <SubmitButton pendingLabel="Joining…" className="btn-primary w-full">
                  <CheckCircle2 size={17} />
                  Accept invitation
                </SubmitButton>
              </form>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                If this is not the invited email, sign out from Aegistra first
                and open this link again with the correct account.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <Link
                href={`/login?next=${encodeURIComponent(nextPath)}`}
                className="btn-primary w-full"
              >
                Log in to accept
              </Link>
              <Link
                href={`/signup?next=${encodeURIComponent(nextPath)}`}
                className="btn-secondary w-full"
              >
                Create account
              </Link>
            </div>
          )}

          <div className="mt-6 flex gap-3 border-t border-white/10 pt-5 text-xs leading-5 text-slate-500">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-sky-300" />
            Membership is granted only after the invite token, expiry and email
            address are validated by the database.
          </div>
        </div>
      </div>
    </main>
  );
}
