import Link from "next/link";
import type { ReactNode } from "react";
import { Check, ChevronDown, Minus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScoreDemo } from "@/components/home/score-demo";
import {
  ActionsScreen,
  OverviewScreen,
  ReadinessScreen,
  RegisterScreen,
} from "@/components/home/app-screens";
import {
  AUTONOMY_WEIGHTS,
  DATA_WEIGHTS,
  GENERATES_CONTENT_POINTS,
  HIGH_THRESHOLD,
  IMPACT_WEIGHTS,
  MEDIUM_THRESHOLD,
  NO_HUMAN_REVIEW_POINTS,
  PUBLIC_INTERACTION_POINTS,
} from "@/lib/scoring";

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Section({
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

function Heading({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{title}</h2>
      {lede && <p className="mt-4 text-lg leading-8 text-slate-300">{lede}</p>}
    </div>
  );
}

function Checklist({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-2.5 text-slate-200">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check size={18} className="mt-1 shrink-0 text-signal-low" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FeatureRow({
  title,
  children,
  bullets,
  screen,
  note,
}: {
  title: string;
  children: ReactNode;
  bullets: readonly string[];
  screen: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="grid gap-8 border-t border-white/10 py-12 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
        <p className="mt-3 leading-7 text-slate-300">{children}</p>
        <Checklist items={bullets} />
        {note && <p className="mt-5 text-sm leading-6 text-slate-400">{note}</p>}
      </div>
      <div className="min-w-0">{screen}</div>
    </div>
  );
}

function WeightGroup({
  title,
  entries,
  columns,
}: {
  title: string;
  entries: readonly (readonly [string, number])[];
  columns: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      <dl className={`mt-2 grid divide-x divide-white/10 rounded-lg border border-white/10 ${columns}`}>
        {entries.map(([label, points]) => (
          <div key={label} className="px-3 py-2.5">
            <dt className="text-xs text-slate-400">{label}</dt>
            <dd className="mt-0.5 text-lg font-bold tabular-nums">{points === 0 ? "0" : `+${points}`}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const questions = [
  ["Which AI systems do you use?", "AI systems"],
  ["Who is responsible for each one?", "Owner"],
  ["When was it last reviewed?", "Review due"],
] as const;

const steps = [
  [
    "Create a workspace and add your AI systems",
    "Name your workspace, then add each system with its provider, purpose, owner and lifecycle.",
  ],
  [
    "Answer six questions for each system",
    "Data sensitivity, autonomy, potential impact, human review, customer contact and visible content. Aegistra turns your answers into a priority score.",
  ],
  [
    "Assign reviews and close the gaps",
    "Set a next review date, add actions, and use the overview and readiness view to see what is overdue or missing.",
  ],
] as const;

const alsoInApp = [
  ["System detail and edit", "Open any system to change its answers, owner or review date. The score updates with it."],
  ["Review history", "Record each review as approved, changes required or paused, with notes and the next due date."],
  ["Team invitations and roles", "Invite teammates as admin, member or viewer. Viewers can read but not change anything."],
  ["Private evidence", "Attach links, notes, decisions or files (PDF, images, Office documents, up to 15 MB) to a system. Files are stored privately."],
  ["CSV import and export", "Download a template, import many systems at once, or export the whole register."],
  ["Activity log", "See who added, changed or removed systems, actions, evidence and members, and when."],
] as const;

const roles = [
  "Founders and COOs",
  "Security leads",
  "Privacy and compliance leads",
  "IT leads",
  "Fractional CISOs and consultants",
] as const;

const security = [
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

const roadmap = [
  {
    stage: "Live now",
    tone: "badge-low",
    items: [
      "Sign-up and workspace setup",
      "AI system register",
      "Priority scoring",
      "Overview dashboard",
      "Governance actions",
      "Readiness view",
      "Isolated workspaces",
      "System detail and edit screens",
      "Review history",
      "Team invitations and roles",
      "Private evidence uploads",
      "CSV import and export",
      "Activity log",
    ],
  },
  {
    stage: "Next",
    tone: "",
    items: [
      "Review reminder emails (built, switching on soon)",
      "Billing and plan limits",
      "Assurance-pack export",
    ],
  },
  {
    stage: "After that",
    tone: "",
    items: [
      "Answer library for security questionnaires",
      "Framework references and control mapping",
      "Security hardening for paid launch",
    ],
  },
  {
    stage: "Later",
    tone: "",
    items: [
      "Google Workspace and Microsoft 365 discovery experiments",
      "Slack and Teams workflow",
      "Employee requests to approve AI tools",
      "Multi-client mode for consultants and MSPs",
    ],
  },
] as const;

const notYet = [
  "It is not legal advice, a certification or a legal risk classification.",
  "It does not watch your AI traffic or prompts.",
  "It does not discover AI tools for you. You add the systems you know about.",
  "It does not offer single sign-on or framework mapping yet.",
] as const;

const faqs = [
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
    "The Free plan covers your first 3 AI systems. Team at $49 a month and Business at $149 a month are planned. Billing is not live yet.",
  ],
] as const;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="container-shell pb-16 pt-10 md:pt-16 xl:pb-24 xl:pt-20">
          <h1 className="max-w-5xl text-[2.5rem] font-extrabold leading-[1.04] tracking-[-0.03em] sm:text-6xl xl:text-[4rem]">
            <span className="block">Know where AI is used.</span>
            <span className="block">Know who owns it.</span>
            <span className="block">Be ready when customers ask.</span>
          </h1>
          <div className="mt-10 grid gap-12 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:items-start xl:gap-14">
          <div>
            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Aegistra is a register for the AI tools, models and agents your company uses. Each one gets an
              owner, a priority score and a review date, and you can see at a glance what is missing.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">
                Create a free workspace
              </Link>
              <Link href="#product" className="btn-secondary px-6 py-3 text-base">
                See what&apos;s inside
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-400">Free for your first 3 AI systems. No credit card.</p>
            <p className="mt-10 max-w-md border-t border-white/10 pt-5 text-sm leading-6 text-slate-400">
              Built for software companies, agencies and consultancies with 10 to 250 people that sell into the
              US and EU.
            </p>
          </div>

          <ScoreDemo />
          </div>
        </section>

        {/* The problem */}
        <Section id="why">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Heading title="AI shows up faster than anyone writes it down." />
              <p className="mt-5 max-w-xl leading-7 text-slate-300">
                Someone adds a chatbot to support. Sales trials a writing tool. A vendor ships an AI feature in
                an app you already pay for. Then a customer&apos;s security questionnaire asks which AI systems you
                use, who owns them and when they were last reviewed.
              </p>
              <p className="mt-4 max-w-xl leading-7 text-slate-300">
                Aegistra keeps those answers in one register, so the next questionnaire is a lookup instead of a
                scramble.
              </p>
            </div>
            <ul className="divide-y divide-white/10 self-center border-y border-white/10">
              {questions.map(([question, column]) => (
                <li key={question} className="flex items-center justify-between gap-4 py-5">
                  <span className="text-lg font-semibold">{question}</span>
                  <span className="badge shrink-0">{column}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Product walkthrough */}
        <Section id="product">
          <Heading
            title="What's in Aegistra today"
            lede="Every screen below is in the live app. We filled them with sample data."
          />
          <div className="mt-14">
            <FeatureRow
              title="One register for every AI system"
              bullets={[
                "System name, provider and purpose",
                "Owner name and email",
                "Lifecycle: pilot, production, paused or retired",
                "Next review date",
                "Data sensitivity, autonomy and potential impact",
              ]}
              screen={<RegisterScreen />}
            >
              Add each AI tool, model, agent or AI feature your team relies on. Every entry records what it is
              for, who owns it and how it is used.
            </FeatureRow>

            <FeatureRow
              title="See what needs attention first"
              bullets={[
                "Systems sorted by priority score",
                "Reviews that are due, counted for you",
                "Open actions with an owner and a due date",
              ]}
              screen={<OverviewScreen />}
            >
              Your overview counts your systems, your high-priority systems, the reviews that are due and the
              actions still open. The riskiest systems come first.
            </FeatureRow>

            <FeatureRow
              title="Turn findings into tasks"
              bullets={[
                "An owner and a due date on every action",
                "Mark an action done in one click",
                "Everything open in one list",
              ]}
              screen={<ActionsScreen />}
            >
              Write down what needs to happen, such as reviewing a vendor&apos;s data retention terms. Give it an
              owner and a due date, and mark it done when it is finished.
            </FeatureRow>

            <FeatureRow
              title="Find the gaps before someone asks"
              bullets={[
                "Owner: ready or missing",
                "Review date: set or missing",
                "Priority level next to every system",
              ]}
              note={
                <>
                  Evidence packs are planned. See the{" "}
                  <Link href="#roadmap" className="text-sky-300 underline underline-offset-4">
                    roadmap
                  </Link>
                  .
                </>
              }
              screen={<ReadinessScreen />}
            >
              The readiness view shows which systems have an owner and a review date and which do not, so you can
              fix gaps before a customer or auditor finds them.
            </FeatureRow>
          </div>

          <div className="mt-16 border-t border-white/10 pt-12">
            <h3 className="text-2xl font-bold tracking-tight">Also in the app</h3>
            <dl className="mt-6 grid gap-x-12 sm:grid-cols-2">
              {alsoInApp.map(([term, text]) => (
                <div key={term} className="border-b border-white/10 py-5">
                  <dt className="font-semibold">{term}</dt>
                  <dd className="mt-1 text-sm leading-6 text-slate-300">{text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        {/* Scoring reference */}
        <Section id="scoring" band>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            <div>
              <Heading
                title="A score you can explain"
                lede="Each system is scored from 0 to 100 with six questions you answer in plain language."
              />
              <p className="mt-5 max-w-xl leading-7 text-slate-300">
                The weights are fixed and published here, and the demo at the top of this page runs on them. You can
                always see exactly why a system ranks where it does.
              </p>
              <p className="mt-5 max-w-xl border-l-2 border-sky-400/60 pl-4 leading-7 text-slate-300">
                The score ranks your internal review work. It is not a legal risk classification, and it does not
                certify compliance with any regulation.
              </p>
            </div>

            <div className="space-y-6">
              <WeightGroup
                title="Data sensitivity"
                columns="grid-cols-2 sm:grid-cols-4"
                entries={Object.entries(DATA_WEIGHTS)}
              />
              <WeightGroup
                title="Autonomy"
                columns="grid-cols-2 sm:grid-cols-4"
                entries={Object.entries(AUTONOMY_WEIGHTS)}
              />
              <WeightGroup
                title="Potential impact"
                columns="grid-cols-3"
                entries={Object.entries(IMPACT_WEIGHTS)}
              />
              <WeightGroup
                title="Added when it applies"
                columns="grid-cols-1 sm:grid-cols-3"
                entries={[
                  ["No human review before action", NO_HUMAN_REVIEW_POINTS],
                  ["Talks to customers or the public", PUBLIC_INTERACTION_POINTS],
                  ["Generates visible content", GENERATES_CONTENT_POINTS],
                ]}
              />

              <div>
                <h3 className="text-sm font-semibold text-slate-300">Priority levels</h3>
                <dl className="mt-2 grid grid-cols-3 divide-x divide-white/10 rounded-lg border border-white/10">
                  <div className="px-3 py-2.5">
                    <dt className="text-xs font-semibold text-signal-low">Low</dt>
                    <dd className="mt-0.5 text-lg font-bold tabular-nums">0 to {MEDIUM_THRESHOLD - 1}</dd>
                  </div>
                  <div className="px-3 py-2.5">
                    <dt className="text-xs font-semibold text-signal-medium">Medium</dt>
                    <dd className="mt-0.5 text-lg font-bold tabular-nums">
                      {MEDIUM_THRESHOLD} to {HIGH_THRESHOLD - 1}
                    </dd>
                  </div>
                  <div className="px-3 py-2.5">
                    <dt className="text-xs font-semibold text-signal-high">High</dt>
                    <dd className="mt-0.5 text-lg font-bold tabular-nums">{HIGH_THRESHOLD} to 100</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </Section>

        {/* How it works */}
        <Section id="how">
          <Heading title="From a blank register to a current one" />
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map(([title, text], index) => (
              <li key={title} className="border-t-2 border-sky-400/70 pt-5">
                <div className="text-sm font-semibold tabular-nums text-sky-300">Step {index + 1}</div>
                <h3 className="mt-2 text-xl font-bold leading-snug">{title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{text}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Audience */}
        <Section id="who" band>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Heading
                title="Built for teams without a GRC department"
                lede="Aegistra is for software companies, agencies and consultancies with roughly 10 to 250 people, where customers increasingly ask how you use AI."
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Who usually owns this</h3>
              <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
                {roles.map((role) => (
                  <li key={role} className="py-3.5 text-lg font-medium">
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Pricing */}
        <Section id="pricing">
          <Heading
            title="Start free. Paid plans are on the way."
            lede="Billing is not live yet. Only the Free plan can be used today. Team and Business show planned pricing."
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
                    <span className="text-2xl font-bold">$49</span>
                    <span className="block text-xs text-slate-400">per month</span>
                  </td>
                  <td className="py-4">
                    <span className="text-2xl font-bold">$149</span>
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
                  <th scope="row" className="px-4 py-4 text-left font-medium text-slate-300">Assurance workflows</th>
                  <td className="py-4">
                    <Minus size={16} className="text-slate-500" aria-hidden="true" />
                    <span className="sr-only">Not included</span>
                  </td>
                  <td className="py-4">
                    <Minus size={16} className="text-slate-500" aria-hidden="true" />
                    <span className="sr-only">Not included</span>
                  </td>
                  <td className="py-4 text-slate-300">Planned</td>
                </tr>
                <tr>
                  <th scope="row" className="px-4 py-4 text-left font-medium text-slate-300">Availability</th>
                  <td className="py-4">
                    <span className="badge badge-low">Available now</span>
                  </td>
                  <td className="py-4">
                    <span className="badge">Planned</span>
                  </td>
                  <td className="py-4">
                    <span className="badge">Planned</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-5 max-w-2xl text-slate-300">
            Every plan includes the register, priority scoring, overview, governance actions and readiness view.
            The plans differ in how many AI systems you can add.
          </p>
          <Link href="/signup" className="btn-primary mt-6 px-6 py-3 text-base">
            Create a free workspace
          </Link>
        </Section>

        {/* Security */}
        <Section id="security" band>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            <Heading
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

        {/* Roadmap */}
        <Section id="roadmap">
          <Heading
            title="Where the product is headed"
            lede="Aegistra is early. Here is what works today and what we are building next."
          />
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {roadmap.map((column) => (
              <div key={column.stage}>
                <span className={`badge ${column.tone}`}>{column.stage}</span>
                <ul className="mt-4 divide-y divide-white/10 border-t border-white/10 text-sm">
                  {column.items.map((item) => (
                    <li key={item} className="py-3 leading-6 text-slate-200">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm leading-6 text-slate-400">
            The order can change as we learn what early teams need. Planned items are not commitments.
          </p>

          <div className="mt-14 max-w-3xl">
            <h3 className="text-xl font-bold">What Aegistra does not do</h3>
            <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
              {notYet.map((item) => (
                <li key={item} className="py-3.5 leading-7 text-slate-300">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" band>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            <Heading title="Questions teams ask first" />
            <div className="divide-y divide-white/10 border-y border-white/10">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    {question}
                    <ChevronDown
                      size={20}
                      className="shrink-0 text-slate-400 transition group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="pb-4 pr-8 leading-7 text-slate-300">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </Section>

        {/* Final call to action */}
        <Section>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Add your first AI system today.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Create a free workspace, add up to three systems and see their priority scores.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">
                Create a free workspace
              </Link>
              <Link href="/login" className="btn-secondary px-6 py-3 text-base">
                Log in
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-400">No credit card.</p>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
