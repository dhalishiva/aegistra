import Link from "next/link";
import type { ReactNode } from "react";

export function Section({
  id,
  children,
  band = false,
}: {
  id?: string;
  children: ReactNode;
  band?: boolean;
}) {
  return (
    <section id={id} className={`border-t border-white/10 ${band ? "bg-panel" : ""}`}>
      <div className="container-shell py-16 md:py-24">{children}</div>
    </section>
  );
}

export function Heading({ title, lede, as: Tag = "h2" }: { title: string; lede?: string; as?: "h1" | "h2" }) {
  return (
    <div className="max-w-2xl">
      <Tag className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{title}</Tag>
      {lede && <p className="mt-4 text-lg leading-8 text-slate-300">{lede}</p>}
    </div>
  );
}

export const security = [
  [
    "No model traffic",
    "Aegistra is not in the path between your apps and AI providers. It records what a system is, who owns it and when it was reviewed. It never sees your prompts, outputs or the data you send to models.",
  ],
  [
    "Isolated workspaces",
    "Every record belongs to one workspace. Access is enforced by row-level security in the Postgres database, not only by what the screens show.",
  ],
  [
    "Keys stay on the server",
    "Your browser only receives a publishable key. The secret key used by the admin area never leaves the server.",
  ],
  [
    "Hosted on trusted infrastructure",
    "Aegistra is served over HTTPS from Vercel. Sign-in and data are handled by Supabase.",
  ],
] as const;

export const faqs = [
  [
    "What counts as an AI system?",
    "Anything that uses AI to do work for your business: a chatbot, a model API call inside your product, an agent, a writing assistant, or an AI feature inside software you already pay for.",
  ],
  [
    "Does Aegistra see our prompts or customer data?",
    "No. It does not sit between your apps and AI providers. You enter a description of each system and answer six questions about it.",
  ],
  [
    "Is the score a legal risk classification?",
    "No. It ranks your own review work using the six answers you give. Deciding how a system is classified under any AI regulation stays with you and your advisers.",
  ],
  [
    "Can we invite teammates or import a spreadsheet?",
    "Yes. Owners and admins can invite teammates as admin, member or viewer, and you can import systems from a CSV file or export your register as CSV.",
  ],
  [
    "What does it cost?",
    "The Free plan covers your first 3 AI systems. Team is $5 a month for up to 50 AI systems and Business is $10 a month with no limit. Pay by card or other methods Razorpay supports, and cancel any time.",
  ],
] as const;

export function PricingSection({ asPage = false }: { asPage?: boolean }) {
  return (
    <Section id="pricing">
      <Heading
        as={asPage ? "h1" : "h2"}
        title="Start free. Upgrade when you outgrow it."
        lede="Three AI systems are free. Team is $5 a month and Business is $10 a month. Cancel any time and keep access until the period ends."
      />
    
      <div className="table-wrap mt-10 max-w-4xl">
        <table className="table">
          <caption className="sr-only">Plan comparison</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[34%]">
                <span className="sr-only">Feature</span>
              </th>
              <th scope="col" className="text-base text-white">Free</th>
              <th scope="col" className="text-base text-white">Team</th>
              <th scope="col" className="text-base text-white">Business</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="px-4 py-4 text-left font-medium text-slate-300">Price</th>
              <td className="py-4 text-2xl font-bold">$0</td>
              <td className="py-4">
                <span className="text-2xl font-bold">$5</span>
                <span className="block text-xs text-slate-400">per month</span>
              </td>
              <td className="py-4">
                <span className="text-2xl font-bold">$10</span>
                <span className="block text-xs text-slate-400">per month</span>
              </td>
            </tr>
            <tr>
              <th scope="row" className="px-4 py-4 text-left font-medium text-slate-300">AI systems</th>
              <td className="py-4 font-semibold">3</td>
              <td className="py-4 font-semibold">50</td>
              <td className="py-4 font-semibold">Unlimited</td>
            </tr>
            <tr>
              <th scope="row" className="px-4 py-4 text-left font-medium text-slate-300">Assurance pack (PDF and CSV)</th>
              <td className="py-4 text-slate-300">Included</td>
              <td className="py-4 text-slate-300">Included</td>
              <td className="py-4 text-slate-300">Included</td>
            </tr>
            <tr>
              <th scope="row" className="px-4 py-4 text-left font-medium text-slate-300">Availability</th>
              <td className="py-4"><span className="badge badge-low">Available now</span></td>
              <td className="py-4"><span className="badge badge-low">Available now</span></td>
              <td className="py-4"><span className="badge badge-low">Available now</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <p className="mt-5 max-w-2xl text-slate-300">
        Every plan includes the register, priority scoring, overview, governance actions and readiness view.
        The plans differ in how many AI systems you can add.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href="/signup" className="btn-primary px-6 py-3 text-base">
          Create a free workspace
        </Link>
        <Link href="/app/settings#billing" className="btn-secondary px-6 py-3 text-base">
          Upgrade an existing workspace
        </Link>
      </div>
      <p className="mt-4 max-w-2xl text-sm text-slate-400">
        Prices are in US dollars. Payments are handled by Razorpay. Only the workspace owner can change the plan.
      </p>
    </Section>
  );
}

export function SecuritySection({ asPage = false }: { asPage?: boolean }) {
  return (
    <Section id="security" band>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <Heading
          as={asPage ? "h1" : "h2"}
          title="We store governance metadata, not your prompts."
          lede="Aegistra only needs to know what a system is and who looks after it."
        />
        <dl className="divide-y divide-white/10 border-y border-white/10">
          {security.map(([term, detail]) => (
            <div key={term} className="grid gap-1 py-5 sm:grid-cols-[13rem_1fr] sm:gap-6">
              <dt className="font-semibold">{term}</dt>
              <dd className="leading-7 text-slate-300">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
