import type { Metadata } from "next";
import { SubmitButton } from "@/components/submit-button";
import { createWorkspace } from "@/lib/actions";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Workspace setup",
  robots: { index: false, follow: false },
};

export default function Onboarding() {
  return (
    <AuthShell
      kicker="Workspace setup"
      title="Create your workspace"
      lede="Use your company or team name. You become the workspace owner and can invite teammates later."
      width="max-w-lg"
    >
      <form action={createWorkspace} className="mt-7 space-y-4">
        <div>
          <label htmlFor="full_name" className="label">Your name</label>
          <input id="full_name" name="full_name" autoComplete="name" className="input" placeholder="Priya Nair" />
        </div>
        <div>
          <label htmlFor="name" className="label">Workspace name</label>
          <input id="name" name="name" required autoComplete="organization" className="input" placeholder="Acme Labs" />
        </div>
        <SubmitButton pendingLabel="Creating workspace…" className="btn-primary w-full">Create workspace</SubmitButton>
      </form>
    </AuthShell>
  );
}
