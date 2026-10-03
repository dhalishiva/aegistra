import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SUPPORT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get help with Aegistra, ask a question about security or pricing, or report a problem.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <div>
      <SiteHeader />
      <main className="container-shell py-12 md:py-16">
        <article className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold">Contact</h1>
          <p className="mt-4 leading-7 text-slate-300">
            Email us for help with your workspace, questions about security or pricing, or to report a problem. We reply
            from the same address.
          </p>
          <p className="mt-6">
            <a className="btn-primary" href={`mailto:${SUPPORT_EMAIL}`}>
              Email {SUPPORT_EMAIL}
            </a>
          </p>
          <p className="mt-6 text-sm leading-6 text-slate-400">
            To report a security issue, include &ldquo;Security&rdquo; in the subject line and describe how to reproduce
            it. Please do not include customer data.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
