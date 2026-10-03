import Link from "next/link";
import { ArrowRight, Check, FileCheck2, ShieldCheck, UserRoundCheck, Workflow, Sparkles, LockKeyhole } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Logo } from "@/components/logo";

const features = [
  [ShieldCheck,"AI system register","Record every AI tool, model, agent and embedded feature with a named owner and purpose."],
  [Workflow,"Governance priority","Use a transparent business-risk score to focus review where autonomy, sensitivity and impact are highest."],
  [UserRoundCheck,"Ownership & reviews","Assign accountable owners, review dates and action items so the register stays current."],
  [FileCheck2,"Evidence trail","Keep governance evidence organized so customer and audit questions are easier to answer."],
] as const;

export default function Home(){
 return <div><SiteHeader/><main>
  <section className="container-shell py-20 md:py-28 text-center">
   <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/[0.06] px-3 py-1.5 text-xs font-semibold text-sky-200"><Sparkles size={14}/> Built for teams adopting AI faster than governance can keep up</div>
   <h1 className="text-5xl font-black tracking-[-0.04em] md:text-7xl">Know where AI is used.<br/><span className="text-sky-300">Know who owns it.</span></h1>
   <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">A living AI register, review workflow and evidence trail without an enterprise GRC rollout.</p>
   <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/signup" className="btn-primary gap-2 px-6 py-3">Start free <ArrowRight size={17}/></Link><a href="#product" className="btn-secondary px-6 py-3">See product</a></div>
   <p className="mt-4 text-xs text-slate-500">Free for your first 3 AI systems · No credit card</p>
   <div className="mx-auto mt-14 max-w-5xl rounded-[28px] border border-white/10 bg-[#0a1520] p-4 text-left shadow-glow">
    <div className="grid gap-3 sm:grid-cols-4">{[["AI systems","18"],["High priority","3"],["Reviews due","4"],["Open actions","7"]].map(([a,b])=><div className="card p-4" key={a}><div className="text-xs text-slate-500">{a}</div><div className="mt-2 text-3xl font-black">{b}</div></div>)}</div>
    <div className="card mt-4 p-5"><div className="font-semibold">Systems needing attention</div>{[["Candidate screening copilot","High"],["Support reply agent","Medium"],["Meeting summarizer","Low"]].map(([n,r])=><div key={n} className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-sm"><span>{n}</span><span className="badge">{r}</span></div>)}</div>
   </div>
  </section>
  <section id="product" className="container-shell py-16"><div className="kicker">Product</div><h2 className="mt-3 max-w-3xl text-3xl font-black md:text-5xl">The operating record for your company’s AI use.</h2><div className="mt-10 grid gap-4 md:grid-cols-2">{features.map(([Icon,t,c])=><div className="card card-hover p-6" key={t}><Icon className="text-sky-300"/><h3 className="mt-5 text-xl font-bold">{t}</h3><p className="mt-2 leading-7 text-slate-400">{c}</p></div>)}</div></section>
  <section id="how" className="border-y border-white/10 bg-white/[0.02]"><div className="container-shell py-16"><div className="kicker">How it works</div><div className="mt-8 grid gap-4 md:grid-cols-3">{[["1. Register","Document system, provider, purpose and owner."],["2. Prioritize","Answer six plain-language questions to build a review queue."],["3. Review & prove","Track reviews, actions and evidence over time."]].map(([t,c])=><div className="card p-6" key={t}><h3 className="font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{c}</p></div>)}</div></div></section>
  <section id="pricing" className="container-shell py-16"><div className="text-center"><div className="kicker">Pricing hypothesis</div><h2 className="mt-3 text-3xl font-black md:text-5xl">Simple self-serve pricing.</h2></div><div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">{[["Free","$0",["3 AI systems","1 member","Priority scoring"]],["Team","$49/mo",["50 AI systems","5 members","Actions & evidence"]],["Business","$149/mo",["Unlimited systems","Unlimited members","Assurance workflows"]]].map(([n,p,items])=><div className="card p-6" key={n as string}><div className="text-sm font-bold text-sky-300">{n as string}</div><div className="mt-3 text-3xl font-black">{p as string}</div><div className="mt-5 space-y-3">{(items as string[]).map(i=><div className="flex gap-2 text-sm" key={i}><Check size={16} className="text-emerald-300"/>{i}</div>)}</div><Link href="/signup" className="btn-secondary mt-6 w-full">Get started</Link></div>)}</div></section>
  <section id="security" className="container-shell pb-20"><div className="card grid gap-8 p-8 md:grid-cols-2"><div><div className="kicker">Security posture</div><h2 className="mt-3 text-3xl font-black">Store governance metadata, not production prompts.</h2></div><div className="space-y-4 text-sm leading-6 text-slate-400"><p className="flex gap-3"><LockKeyhole className="shrink-0 text-sky-300"/> Tenant isolation is enforced with Supabase RLS.</p><p className="flex gap-3"><ShieldCheck className="shrink-0 text-sky-300"/> Platform secrets stay server-side.</p></div></div></section>
 </main><footer className="border-t border-white/10"><div className="container-shell flex flex-col gap-4 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between"><Logo/><div className="flex gap-4"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></footer></div>
}
