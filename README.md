# Aegistra

**Lightweight AI governance for teams that need a living AI register without an enterprise GRC rollout.**

Aegistra helps small and mid-sized organizations document where AI is used, who owns each use case, what needs review, which governance actions are still open, and which evidence supports governance decisions.

> **Important:** Aegistra is a governance workflow and system-of-record product. It does **not** provide legal advice, certification, regulatory approval, or statutory AI-risk classification.

---

## Live application

Production:

```text
https://aegistra.vercel.app/
```

Primary repository:

```text
https://github.com/dhalishiva/aegistra
```

Current infrastructure:

- **Frontend / server:** Next.js App Router + TypeScript
- **UI:** Tailwind CSS + Lucide icons
- **Database / Auth / Storage:** Supabase
- **Hosting:** Vercel
- **Analytics:** Vercel Web Analytics
- **Transactional email integration prepared for:** Resend
- **Scheduled reminders:** Vercel Cron

---

# Product overview

Aegistra is designed to become the operating record for an organization's AI usage.

The product currently lets a company:

- maintain a register of AI systems and AI-enabled use cases;
- assign an owner to every system;
- record purpose, provider, lifecycle, data sensitivity, autonomy and business impact;
- calculate a transparent governance-priority score;
- schedule reviews;
- record append-only review history;
- track governance actions;
- upload private supporting evidence;
- maintain an automatic audit trail;
- invite teammates with role-based access;
- import/export AI inventories using CSV;
- configure automated review-reminder workflows;
- operate an internal platform-admin surface;
- expose a separate public marketing site.

The MVP intentionally stores **governance metadata**, not production prompts or model traffic.

---

# Current implementation status

## Sprint 0 — Product validation and market positioning

**Status: product direction defined; external customer validation still ongoing.**

Aegistra was selected after comparing several SaaS opportunities including:

- LLM observability / AI cost monitoring;
- SaaS renewal management;
- compliance automation;
- AI governance and AI inventory tooling.

The selected wedge is:

> **A living AI register for teams too small for enterprise GRC.**

Initial target customer:

- 10–250 employee B2B SaaS companies;
- agencies;
- consultancies;
- professional-services companies;
- especially organizations selling to US/EU customers.

Likely buyers:

- Founder / COO;
- Security lead;
- Privacy / compliance lead;
- IT lead;
- Fractional CISO.

Initial pricing hypothesis:

| Plan | Current product hypothesis |
|---|---|
| Free | $0, up to 3 AI systems |
| Team | $49/month, up to 50 AI systems |
| Business | $149/month, larger governance / assurance workflows |

Billing is **not implemented yet**. These prices are still hypotheses to validate before paid launch.

---

# Sprint 1 — Core MVP

**Status: implemented and deployed.**

Sprint 1 established the complete application foundation.

## 1. Public marketing website

The root application contains a separate public-facing marketing site.

Implemented:

- product positioning;
- hero section;
- product feature sections;
- explanation of how Aegistra works;
- pricing hypothesis section;
- security positioning;
- signup / login calls-to-action;
- public footer;
- privacy page;
- terms page.

Routes include:

```text
/
 /privacy
 /terms
 /login
 /signup
```

The legal pages are intentionally MVP drafts and should receive proper legal review before commercial launch.

---

## 2. Branding, logo and favicon

Aegistra has a custom shield/network-style logo and favicon treatment.

Implemented favicon assets include:

```text
/favicon.ico
/favicon-16x16.png
/favicon-32x32.png
/favicon-48x48.png
/apple-touch-icon.png
/icon.svg
/aegistra-mark.svg
```

Next.js metadata explicitly declares ICO, PNG and SVG formats.

This was added because Vercel/browser surfaces do not always treat SVG favicons consistently.

---

## 3. SEO and social sharing

Implemented:

- Next.js metadata;
- canonical site metadata through `NEXT_PUBLIC_SITE_URL`;
- Open Graph metadata;
- Twitter card metadata;
- dynamic social preview image;
- sitemap;
- robots rules;
- favicon metadata.

Routes such as private app/admin pages are excluded from normal indexing.

---

## 4. Vercel Analytics

Vercel Web Analytics is already integrated in:

```text
src/app/layout.tsx
```

using:

```tsx
@vercel/analytics/react
```

The application is already deployed on Vercel and production builds are triggered from the GitHub `main` branch.

---

## 5. Authentication

Authentication uses Supabase Auth.

Implemented:

- email/password signup;
- email/password login;
- email-confirmation support;
- PKCE callback handling;
- safe redirect handling;
- protected routes;
- sign out.

Important route:

```text
/auth/callback
```

Invite destinations and protected destinations are preserved through login/signup flows.

---

## 6. Workspace onboarding

A new authenticated user can create a workspace.

The creator automatically becomes:

```text
role = owner
```

The onboarding flow creates:

- workspace;
- workspace membership;
- profile record.

---

## 7. Multi-tenant architecture

Aegistra is multi-tenant.

Most customer data is linked to:

```text
workspace_id
```

Tenant isolation is enforced in Supabase/Postgres using **Row Level Security** rather than relying on frontend filtering.

Private authorization helper functions live in a non-public Postgres schema.

Important helpers include logic for:

- workspace membership;
- workspace admin access;
- workspace owner access;
- write permission.

---

## 8. AI systems register

The central MVP feature is the AI systems / use-case register.

Each system can currently store:

- name;
- provider/product;
- business purpose;
- owner name;
- owner email;
- lifecycle;
- data sensitivity;
- autonomy level;
- potential impact;
- human-review status;
- public/customer interaction;
- externally generated content flag;
- review due date;
- last reviewed date;
- internal notes;
- governance priority score;
- governance priority level.

Main routes:

```text
/app/systems
/app/systems/new
/app/systems/[id]
```

---

## 9. Governance-priority scoring

Aegistra calculates an internal governance-priority score from:

- data sensitivity;
- autonomy;
- impact;
- presence/absence of human review;
- public interaction;
- externally visible generated content.

Output:

```text
0–100 score
low / medium / high priority
```

This score is deliberately described as an **internal prioritization signal**, not a legal classification.

It is recalculated whenever the relevant governance inputs change.

---

## 10. Application dashboard

The authenticated dashboard shows a workspace overview.

Current metrics include:

- number of registered AI systems;
- high-priority systems;
- reviews due;
- open governance actions.

The dashboard also surfaces systems needing attention and links directly to system records.

Route:

```text
/app
```

---

## 11. Governance actions

Users can create governance action items with:

- title;
- owner;
- due date;
- status.

Actions can be completed from the app.

Route:

```text
/app/actions
```

---

## 12. Internal platform-admin surface

A separate internal admin surface exists at:

```text
/admin
```

Access is restricted using:

```text
ADMIN_EMAILS
```

The page uses the server-only Supabase secret key and exposes high-level platform information such as:

- workspace count;
- AI-system count;
- membership count;
- recent workspaces.

The Supabase secret key must never be exposed through a `NEXT_PUBLIC_` variable.

---

# Sprint 2 — Retention and collaboration

**Status: feature implementation complete.**

Sprint 2 turned the original register into an ongoing governance workflow.

---

## 1. AI-system detail and editing

Every AI-system record is now clickable.

Users can edit:

- name;
- provider;
- purpose;
- owner;
- lifecycle;
- review date;
- governance inputs;
- notes.

Changing governance inputs recalculates the governance-priority score.

Route:

```text
/app/systems/[id]
```

---

## 2. Append-only review history

A formal review workflow was added.

Users can record:

- review outcome;
- review notes;
- next review date.

Supported outcomes include:

```text
approved
changes_required
paused
```

Recording a review:

- creates an append-only review-history row;
- updates `last_reviewed`;
- updates `review_due`;
- pauses the system when the review outcome is `paused`.

The review-history table is:

```text
system_reviews
```

Review history is shown on each AI-system detail page.

---

## 3. Private evidence storage

Aegistra supports real evidence-file uploads.

Route:

```text
/app/evidence
```

Evidence can be:

- general workspace evidence; or
- linked to a specific AI system.

Supported file types currently include:

- PDF;
- PNG;
- JPG/JPEG;
- TXT;
- CSV;
- Word;
- Excel.

Maximum file size:

```text
15 MB
```

Files are stored in a private Supabase Storage bucket:

```text
evidence
```

Security characteristics:

- bucket is private;
- access is workspace-scoped;
- Storage RLS checks workspace membership;
- writes require write-capable roles;
- downloads use signed URLs;
- signed URLs expire after one hour.

Evidence metadata stored in Postgres includes:

- title;
- related AI system;
- storage path;
- filename;
- MIME type;
- file size;
- notes;
- validity date;
- creator.

---

## 4. Database-backed activity / audit timeline

Aegistra has a workspace activity timeline at:

```text
/app/activity
```

Important events are written by **Postgres triggers**, not just frontend code.

Tracked events include:

- AI system created;
- AI system updated;
- AI system reviewed;
- governance action created;
- governance action updated;
- governance action completed;
- evidence uploaded;
- evidence deleted;
- member invited;
- invite accepted;
- invite revoked;
- workspace member added;
- workspace member removed;
- member role changed;
- reminder settings updated;
- reminder email sent.

The table is:

```text
activity_events
```

This gives Aegistra a meaningful audit history even when data mutations come from different application paths.

---

## 5. Team invitations

Aegistra supports workspace invitations.

Workspace owners/admins can create invitation links from Settings.

Invitation properties include:

- invited email;
- role;
- secure token hash;
- inviting user;
- expiry;
- acceptance status.

Invitation links expire after:

```text
7 days
```

Acceptance is handled by Postgres logic that verifies:

- user is authenticated;
- token is valid;
- invitation is not expired;
- invitation is not revoked;
- invitation has not already been used;
- authenticated email matches invited email;
- account does not already belong to another workspace.

Important route:

```text
/invite/[token]
```

New users can:

```text
Invite link
→ Create account
→ Confirm email
→ Return to invitation
→ Accept
→ Enter workspace
```

---

## 6. Workspace roles

Current roles:

| Role | Access |
|---|---|
| Owner | Full workspace control, including admins |
| Admin | Governance work + member/viewer management |
| Member | Normal governance work |
| Viewer | Read-only |

The role model is enforced at the **database/RLS layer**.

Viewer is therefore not merely a UI label.

Viewers cannot write:

- AI systems;
- actions;
- reviews;
- evidence.

Additional protections prevent normal admins from manipulating owner access.

Invitation role escalation was also hardened so invite rows cannot simply be modified through the API after creation.

---

## 7. Workspace Settings page

The Settings page now contains:

- workspace summary;
- current plan;
- member count;
- current-user role;
- workspace member directory;
- role-change controls;
- member-removal controls;
- invitation generation;
- pending invitations;
- invitation revoke controls;
- role explanation;
- review-reminder settings;
- reminder delivery history;
- sign out.

Route:

```text
/app/settings
```

---

## 8. CSV import/export

Aegistra supports bulk AI-register migration.

Available from:

```text
/app/systems
```

Features:

- downloadable template;
- workspace export;
- browser-side preview;
- server-side validation;
- duplicate detection;
- plan-limit enforcement;
- governance-score recalculation;
- round-trip export/re-import support.

Import limits:

```text
500 rows maximum
2 MB maximum CSV file
```

Primary CSV columns:

```text
name
provider
purpose
owner_name
owner_email
lifecycle
data_sensitivity
autonomy
impact
human_review
public_interaction
generates_content
review_due
notes
```

Exports also include calculated/reference fields such as:

```text
priority_score
priority_level
last_reviewed
```

Duplicates are detected using:

```text
normalized system name + normalized provider
```

Existing duplicates and duplicates inside the imported file are skipped.

Import plan limits are rechecked server-side immediately before insertion.

Viewers can export but cannot import.

Routes:

```text
/api/systems/template
/api/systems/export
```

---

## 9. Review-reminder workflow

The review-reminder feature is **implemented in code and database**, but transactional email delivery is **not activated yet** because the Resend/Vercel secrets have not been configured.

This distinction is important for anyone continuing development.

### Implemented already

Aegistra has:

- workspace reminder settings;
- lead-time configuration;
- enable/disable control;
- optional overdue reminders;
- overdue repeat cadence;
- reminder-delivery history;
- reminder deduplication;
- failed-delivery logging;
- Resend REST integration;
- Resend idempotency keys;
- daily cron route;
- Vercel Cron configuration;
- activity-log entries for successful sends.

Tables:

```text
workspace_reminder_settings
review_reminder_deliveries
```

Cron route:

```text
/api/cron/review-reminders
```

Cron schedule currently defined in `vercel.json`:

```text
0 8 * * *
```

This means the code is configured to run once daily at:

```text
08:00 UTC
```

The worker:

1. loads enabled workspace reminder settings;
2. finds active AI systems with review dates inside the configured window;
3. determines whether the reminder is upcoming, due today or overdue;
4. skips systems without an owner email;
5. generates a dedupe key;
6. checks whether the reminder was already successfully sent;
7. sends through Resend;
8. stores the delivery result;
9. records a successful delivery in the workspace activity trail.

### IMPORTANT — still pending / not configured yet

The production email workflow will **not send emails yet** until the following Vercel environment variables are created:

```text
CRON_SECRET=
RESEND_API_KEY=
REMINDER_FROM_EMAIL=
REMINDER_REPLY_TO=
```

`REMINDER_REPLY_TO` is optional.

At the moment, requesting the production cron route returns:

```text
CRON_SECRET is not configured.
```

This is expected and intentional.

### What still needs to be done for reminders

Whoever continues this project should:

1. Create/connect a Resend account.
2. Add and verify the sending domain in Resend.
3. Create a Resend API key.
4. Decide the production sender, for example:

   ```text
   Aegistra <reminders@yourdomain.com>
   ```

5. Generate a strong random `CRON_SECRET`.
6. Add these environment variables to the **Aegistra Vercel project only**:

   ```text
   RESEND_API_KEY=re_xxx
   REMINDER_FROM_EMAIL=Aegistra <reminders@yourdomain.com>
   REMINDER_REPLY_TO=governance@yourdomain.com
   CRON_SECRET=<strong-random-secret>
   ```

7. Redeploy after adding the environment variables.
8. Verify that the Vercel Cron job appears for the project.
9. Enable reminders for a test workspace.
10. Set a test AI system with:
    - an owner email;
    - a review date inside the reminder window.
11. Run/test the reminder endpoint with proper authorization.
12. Confirm:
    - email is delivered;
    - delivery row is written;
    - activity event appears;
    - rerunning the same reminder does not duplicate the email.

**Do not commit any of these secrets into GitHub.**

---

# Sprint 3 — Monetization

**Status: not started.**

Planned work:

## 1. Billing and plan enforcement

Expected next implementation:

- subscription billing provider;
- Free / Team / Business plans;
- checkout;
- billing portal;
- subscription-state syncing;
- server-side plan enforcement;
- upgrade/downgrade behavior;
- billing status in Settings;
- paid-feature gating.

Current plan limits already exist conceptually in the application, for example:

```text
Free → 3 systems
Team → 50 systems
Business → high/unlimited system limit
```

However, **no real payment processor is wired yet**.

---

## 2. Assurance-pack export

Planned:

- generated customer-assurance package;
- PDF and/or ZIP export;
- selected governance records;
- system inventory;
- ownership;
- reviews;
- evidence references;
- open/closed actions;
- timestamps.

This feature should build on the evidence and audit work completed in Sprint 2.

---

## 3. Questionnaire answer library

Planned:

- reusable AI/security questionnaire answers;
- workspace answer library;
- approved wording;
- evidence links;
- owner;
- review/expiry dates;
- copy/export workflow.

---

## 4. Framework references and mapping

Planned:

- EU AI Act transparency references;
- NIST AI RMF mapping;
- ISO/IEC 42001 references;
- potentially customer-defined control frameworks.

Aegistra should continue avoiding claims that it automatically determines legal compliance.

---

# Sprint 4 — Expansion

**Status: not started.**

Potential expansion areas:

- Google Workspace AI/tool discovery experiments;
- Microsoft 365 discovery experiments;
- Slack workflow;
- Microsoft Teams workflow;
- employee AI-tool approval/intake form;
- approved-AI catalog;
- consultant/MSP multi-client mode;
- multi-workspace switching;
- SSO;
- enterprise audit/reporting capabilities.

---

# Application route map

## Public routes

```text
/
 /login
 /signup
 /privacy
 /terms
 /invite/[token]
 /auth/callback
```

## Authenticated customer app

```text
/app
/app/systems
/app/systems/new
/app/systems/[id]
/app/actions
/app/evidence
/app/activity
/app/settings
```

## Internal platform admin

```text
/admin
```

## API / infrastructure routes

```text
/api/systems/template
/api/systems/export
/api/cron/review-reminders
```

---

# Database model

Primary customer tables currently include:

```text
profiles
workspaces
workspace_members
workspace_invitations
ai_systems
system_reviews
action_items
evidence_items
activity_events
workspace_reminder_settings
review_reminder_deliveries
```

Supabase Storage bucket:

```text
evidence
```

The private Postgres schema also contains authorization, invitation and audit helper functions.

---

# Supabase migrations

All SQL files inside:

```text
supabase/migrations/
```

must be applied in **numeric order** for a fresh environment.

Current migration history covers:

1. initial schema and RLS;
2. performance indexes;
3. system review history;
4. review-author index;
5. private evidence storage + activity log;
6. automatic activity triggers;
7. workspace invitations + role enforcement;
8. secure invitation acceptance;
9. secure workspace-member directory;
10. invitation mutation hardening;
11. review reminder settings + delivery log;
12. reminder/invitation foreign-key indexes.

Do not assume only the first migration is sufficient.

---

# Security architecture

Current security controls include:

- Supabase Postgres Row Level Security;
- workspace-scoped data access;
- read-only Viewer role enforced in RLS;
- private authorization helpers;
- server-only Supabase secret key;
- private evidence Storage bucket;
- workspace-scoped Storage policies;
- one-hour evidence signed URLs;
- email-matched invitation acceptance;
- expiring invitation tokens;
- hashed invitation tokens in the database;
- owner/admin/member/viewer role hierarchy;
- append-only review records;
- Postgres-triggered activity events;
- server-side CSV validation;
- CSV size and row caps;
- server-side plan-limit checks;
- protected cron endpoint;
- provider idempotency support for reminder emails;
- no production AI prompts/model traffic collected by the MVP.

Supabase security-advisor checks were run repeatedly during implementation and showed:

```text
0 security findings
```

The current remaining Supabase performance notices are primarily unused-index informational notices because the production database contains little/no usage data yet.

---

# Security work still recommended before serious paid enterprise launch

The current implementation is suitable for continued MVP/design-partner development, but before selling into regulated/large-enterprise environments, consider:

- hardened Content Security Policy;
- broader security-response headers review;
- admin MFA;
- stronger password/rate-limit policy review;
- formal backup/restore testing;
- dependency/SAST scanning;
- secret rotation procedures;
- formal DPA;
- subprocessor list;
- finalized privacy policy;
- finalized Terms of Service;
- retention/deletion policy;
- external penetration/security review;
- incident-response process;
- SSO/SAML/OIDC if enterprise customers require it.

---

# Environment variables

Copy:

```text
.env.example
```

to:

```text
.env.local
```

for local development.

Current variables:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SECRET_KEY=

ADMIN_EMAILS=you@example.com

# Pending production reminder setup
RESEND_API_KEY=
REMINDER_FROM_EMAIL=Aegistra <reminders@yourdomain.com>
REMINDER_REPLY_TO=
CRON_SECRET=
```

Rules:

- never expose `SUPABASE_SECRET_KEY` through a `NEXT_PUBLIC_` variable;
- never expose `RESEND_API_KEY`;
- never commit `CRON_SECRET`;
- production values belong in Vercel Environment Variables.

---

# Local development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Production build:

```bash
npm run build
```

---

# Supabase Auth configuration

For local development, add:

```text
http://localhost:3000/auth/callback
```

to Supabase Auth redirect URLs.

For production:

```text
https://aegistra.vercel.app/auth/callback
```

and set the production Site URL appropriately.

Invite signup/email-confirmation flows rely on the callback being configured correctly.

---

# Vercel deployment

The project is already connected to GitHub/Vercel.

Production application:

```text
https://aegistra.vercel.app/
```

Deployments occur from:

```text
dhalishiva/aegistra
branch: main
```

Vercel Analytics is already mounted.

The reminder cron is already declared in:

```text
vercel.json
```

but email delivery will remain inactive until the Resend/cron environment variables described above are added.

---

# GitHub Actions / build verification

A GitHub Actions production build workflow exists under:

```text
.github/workflows/build.yml
```

It has been used to diagnose Next.js/TypeScript production-build errors in addition to Vercel builds.

The latest implemented feature sets were brought to successful production builds before continuing development.

---

# Important architectural decisions

## 1. Governance metadata, not runtime interception

Aegistra does not sit inside the LLM request path.

This lowers:

- integration complexity;
- security exposure;
- implementation time;
- customer concerns around prompt capture.

---

## 2. Database-enforced tenancy

Workspace isolation is enforced by Postgres RLS.

Frontend filters are not treated as an authorization boundary.

---

## 3. Priority score is not regulatory classification

The governance-priority score only helps teams decide what to review first.

It must not be represented as a legal EU AI Act classification or compliance verdict.

---

## 4. Evidence is private by default

Evidence uploads are stored in a private bucket and accessed through expiring signed URLs.

---

## 5. Audit events are generated in the database

Important activity is recorded using triggers where practical, reducing dependence on every frontend/client path remembering to log an event.

---

## 6. Billing was deliberately deferred

Billing was not added during the MVP/retention work so willingness-to-pay can be validated before increasing product complexity.

---

# Current known pending items / Claude handoff

If another developer or Claude continues from this repository, these are the most important current facts.

## Pending immediately

### 1. Resend + Cron production activation

**Code is implemented. Configuration is not.**

Still needed:

```text
RESEND_API_KEY
REMINDER_FROM_EMAIL
optional REMINDER_REPLY_TO
CRON_SECRET
verified Resend sending domain
```

Test the complete reminder workflow after configuration.

---

### 2. Billing

No payment processor has been integrated yet.

Implement during Sprint 3.

---

### 3. Assurance-pack export

Not implemented yet.

This is one of the strongest next product features because the underlying inventory, evidence, review and audit data now exist.

---

### 4. Legal documents

Current Privacy and Terms pages are MVP placeholders.

They require proper legal/business review before paid launch.

---

### 5. Customer validation

Continue interviewing actual target customers.

Before spending heavily on enterprise features, validate:

- willingness to pay;
- which questionnaire/evidence workflows create the most pain;
- whether customers value inventory, reminders, evidence packs, or framework mapping most;
- whether $49/$149 self-serve pricing is appropriate.

---

# Recommended next development order

Suggested continuation:

```text
1. Configure and test Resend + CRON_SECRET
2. Run an end-to-end production QA pass
3. Build assurance-pack export
4. Add real billing/subscriptions
5. Add questionnaire answer library
6. Add framework/control mapping
7. Improve legal/compliance documentation
8. Add SSO / discovery integrations only when customer demand justifies them
```

---

# Product documentation

More focused documents are available in:

- [PRD](docs/PRD.md)
- [Market analysis](docs/MARKET_ANALYSIS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Go-to-market](docs/GTM.md)
- [Sprint plan](docs/SPRINTS.md)
- [Architecture decisions](docs/DECISIONS.md)

The README should be treated as the **primary project handoff / current-state document**, while the files above provide deeper topic-specific context.

---

# License

Copyright © 2026. All rights reserved unless a separate license is added by the repository owner.
