# Aegistra

**Lightweight AI governance for teams that need a living AI register without an enterprise GRC rollout.**

Aegistra helps small and mid-sized organizations keep track of where AI is being used, who owns each use case, what needs review, which governance actions are open, and what evidence supports internal decisions or customer-assurance responses.

> Aegistra organizes governance work. It does **not** provide legal advice, certification, statutory AI-risk classification, or runtime inspection of prompts/model traffic.

---

## Current project status

Aegistra is live at:

```text
https://aegistra.vercel.app/
```

Repository:

```text
https://github.com/dhalishiva/aegistra
```

Current state:

- Marketing website: **live**
- Authenticated customer app: **live**
- Platform admin page: **implemented**
- Supabase database/RLS: **implemented**
- Private evidence storage: **implemented**
- Team invitations/roles: **implemented**
- CSV import/export: **implemented**
- Review reminder workflow code: **implemented**
- Daily Vercel cron declaration: **implemented in `vercel.json`**
- Transactional email delivery: **NOT ACTIVATED YET**
- Resend API/domain setup: **PENDING**
- `CRON_SECRET` in Vercel: **PENDING**
- Billing/payment processing: **not implemented yet**
- Assurance-pack export: PDF and CSV (`/api/assurance`, buttons on the Evidence page)
- Billing: Razorpay subscriptions, Team $5 and Business $10 per month (see `docs/BILLING_SETUP.md`)

At the last production verification:

- the latest Vercel build was successful,
- the production alias pointed to `aegistra.vercel.app`,
- Vercel reported no runtime errors,
- Supabase security advisor reported no security findings.

---

# Product purpose

The core problem Aegistra addresses is that many organizations adopt AI tools faster than they create an internal governance process.

Aegistra is intended to become the team's lightweight system of record for:

- which AI systems/use cases exist,
- which provider/product is involved,
- what the AI system is used for,
- who owns it,
- which data sensitivity level applies,
- how autonomous the system is,
- what potential business impact exists,
- whether human review is present,
- whether the system interacts with customers/public users,
- whether it generates externally visible content,
- when the system was last reviewed,
- when the next review is due,
- which governance actions remain open,
- which evidence/documents support the governance decision,
- which teammate made important changes,
- and whether scheduled reviews are approaching or overdue.

The product intentionally uses a **governance-priority score** instead of pretending to make a legal/statutory classification.

---

# Target customer

Initial ICP:

- 10–250 employee organizations
- B2B SaaS companies
- agencies
- consultancies
- professional-services businesses
- companies selling into US/EU enterprise customers

Likely buyers/users:

- founders
- COO/operations
- security leads
- privacy/compliance leads
- IT leads
- fractional CISOs
- consultants/MSPs managing governance for clients

---

# Technology stack

| Area | Technology |
|---|---|
| Frontend | Next.js App Router |
| Language | TypeScript |
| UI | React + Tailwind CSS |
| Icons | Lucide |
| Authentication | Supabase Auth |
| Database | Supabase Postgres |
| Authorization | Postgres Row Level Security |
| File storage | Private Supabase Storage |
| Hosting | Vercel |
| Analytics | Vercel Web Analytics |
| Scheduled jobs | Vercel Cron |
| Transactional email adapter | Resend REST API |
| CI/build validation | GitHub Actions + Vercel builds |

The app currently stays deliberately infrastructure-light so it can be operated as a small SaaS without managing dedicated servers.

---

# High-level architecture

```text
Browser
   |
   v
Next.js / Vercel
   |
   +----------------------+
   |                      |
   v                      v
Supabase Auth        Server-side routes/actions
   |                      |
   v                      v
Supabase Postgres    Supabase service-role access
   |                      |
   +---- RLS -------------+
   |
   +--> Private Supabase Storage
```

For scheduled reminders:

```text
Vercel Cron
   |
   v
/api/cron/review-reminders
   |
   +--> Supabase reminder settings
   +--> AI systems with review dates
   +--> delivery de-duplication log
   |
   v
Resend API
   |
   v
AI-system owner email
```

The cron/email path is implemented but **not production-active yet** because the required Vercel/Resend secrets have not been configured.

---

# Main application routes

| Route | Purpose |
|---|---|
| `/` | Public marketing homepage |
| `/privacy` | Privacy page |
| `/terms` | Terms page |
| `/login` | Login |
| `/signup` | Signup |
| `/auth/callback` | Supabase PKCE/email-confirmation callback |
| `/onboarding` | First workspace creation |
| `/invite/[token]` | Secure workspace invitation acceptance |
| `/app` | Customer dashboard |
| `/app/systems` | AI system register |
| `/app/systems/new` | Create an AI-system record |
| `/app/systems/[id]` | AI-system detail/edit/review history |
| `/app/actions` | Governance action queue |
| `/app/evidence` | Private assurance evidence library |
| `/app/activity` | Workspace audit/activity timeline |
| `/app/settings` | Workspace, members, roles, invitations and reminders |
| `/admin` | Internal Aegistra platform-admin page |
| `/api/systems/template` | Download blank CSV import template |
| `/api/systems/export` | Authenticated workspace CSV export |
| `/api/cron/review-reminders` | Secured daily review-reminder worker |

---

# Workspace roles and authorization model

Aegistra currently supports four workspace roles.

## Owner

Highest workspace permission level.

Can:

- perform all governance work,
- invite admins,
- invite members/viewers,
- change admin/member/viewer roles,
- remove non-owner members,
- manage reminder settings.

The owner cannot accidentally demote/remove themselves through the normal member-management UI/policies.

## Admin

Can:

- perform normal governance work,
- invite members/viewers,
- manage members/viewers,
- manage reminder settings.

Admins cannot promote other users to Admin and cannot modify/remove the Owner.

## Member

Can:

- create/update AI systems,
- record system reviews,
- create/update governance actions,
- upload/delete evidence,
- import AI systems.

Members cannot administer workspace access.

## Viewer

Read-only governance access.

Viewer write restrictions are enforced at the **database RLS layer**, not merely hidden in the frontend.

---

# Sprint history / implementation log

This section is intended as the detailed engineering handoff.

## Sprint 0 — Market validation and product definition

### Goal

Identify a subscription SaaS opportunity that:

- solves a real operational problem,
- has recurring value,
- can sell into higher-value US/EU markets,
- is not dependent on ads,
- can start self-serve,
- and does not require enterprise-scale infrastructure to launch.

### Categories considered

The research phase considered areas including:

- LLM observability/cost monitoring,
- SaaS renewal/spend management,
- compliance automation,
- AI governance/system inventory.

### Product selected

The selected wedge was a lightweight **AI system register + governance workflow** for organizations that are too small to justify a complex enterprise GRC implementation.

### Positioning

Primary positioning:

> **Know where AI is used. Know who owns it.**

Secondary positioning:

> A living AI register for teams too small for enterprise GRC.

### Product guardrail established

Aegistra would **not** attempt to make a statutory/legal AI classification.

Instead it would calculate an internal governance-priority score used only to help teams decide what should be reviewed first.

### Initial pricing hypothesis

The current data model contains plan concepts:

| Plan | Hypothesis |
|---|---|
| Free | up to 3 AI systems |
| Team | $49/month, up to 50 AI systems |
| Business | $149/month, larger workflows |
| Enterprise | reserved for future use |

Billing itself has deliberately not been connected yet.

---

# Sprint 1 — Core MVP

**Status: implemented and deployed**

Sprint 1 established the complete product foundation.

## 1. Public marketing website

Implemented a separate public-facing sales/marketing surface rather than mixing marketing and authenticated product pages.

Includes:

- hero/product messaging,
- product explanation,
- pricing hypothesis,
- security messaging,
- CTA flows,
- Privacy page,
- Terms page.

The legal pages are product placeholders and still require proper legal review before a serious paid launch.

## 2. Branding

Created Aegistra branding including:

- shield/network-style logo,
- reusable logo component,
- SVG mark,
- browser favicon assets,
- ICO and PNG favicon variants,
- Apple touch icon.

Current favicon assets include:

```text
/favicon.ico
/favicon-16x16.png
/favicon-32x32.png
/favicon-48x48.png
/apple-touch-icon.png
/icon.svg
/aegistra-mark.svg
```

## 3. SEO and social sharing

Added:

- Next.js metadata,
- Open Graph metadata,
- Twitter/X card metadata,
- dynamic Open Graph social image,
- sitemap,
- robots metadata,
- canonical production-site support via `NEXT_PUBLIC_SITE_URL`.

This also ensures links shared through WhatsApp/LinkedIn can display a branded social preview.

## 4. Vercel Analytics

Vercel Web Analytics is mounted globally through the root layout.

No additional page-level analytics code is required for basic traffic collection.

## 5. Authentication

Implemented Supabase email/password authentication.

Includes:

- signup,
- login,
- email-confirmation callback,
- PKCE-compatible callback route,
- safe `next=` redirects,
- support for preserving invitation links through signup/email confirmation.

## 6. Workspace onboarding

A new user can create a workspace during onboarding.

The creator becomes the workspace Owner.

Workspace records form the tenancy boundary for customer-owned data.

## 7. Multi-tenant data architecture

Customer-owned records carry a `workspace_id`.

Tenant isolation is enforced using Supabase/Postgres RLS instead of trusting frontend query filters.

Authorization helper functions are stored in a non-exposed `private` schema.

## 8. AI system register

Implemented the main AI inventory.

Each AI-system record supports fields such as:

- name,
- provider,
- purpose,
- owner name,
- owner email,
- lifecycle,
- data sensitivity,
- autonomy,
- business impact,
- human-review status,
- public interaction,
- generated-content exposure,
- review due date,
- notes.

Lifecycle values currently include:

```text
pilot
production
paused
retired
```

## 9. Governance-priority score

Implemented a transparent internal scoring function.

The score currently considers:

- data sensitivity,
- autonomy,
- potential impact,
- whether human review exists,
- public/customer interaction,
- externally generated content.

The score is converted into:

```text
low
medium
high
```

priority levels.

It is explicitly an **internal governance-priority signal**, not legal advice.

## 10. Customer dashboard

The authenticated dashboard shows:

- total AI systems,
- high-priority systems,
- reviews due,
- open actions,
- systems needing attention,
- recent/open governance actions.

## 11. Governance actions

Implemented an action queue for governance follow-up.

Users can:

- create actions,
- assign an owner text value,
- set due dates,
- mark actions complete.

## 12. Evidence-readiness foundation

Sprint 1 initially added an evidence/readiness view so the product could identify whether systems had:

- ownership,
- review dates,
- basic assurance readiness.

Sprint 2 later expanded this into real private file storage.

## 13. Internal platform admin

Added a separate `/admin` surface.

It is gated by:

- Supabase authentication,
- the `ADMIN_EMAILS` environment variable.

The admin route uses the server-only Supabase secret key.

It currently provides platform-level counts and recent workspace visibility.

## 14. Initial security baseline

Implemented:

- RLS on customer-facing tables,
- server-only service-role key handling,
- private authorization helper schema,
- tenant-scoped queries,
- HTTPS through Vercel,
- security headers,
- protected internal admin route.

---

# Sprint 2 — Retention and collaboration

**Status: application code implemented**

Sprint 2 turned the MVP from a register into an ongoing governance workflow.

## Sprint 2A — AI-system detail/edit + review history

### AI-system detail pages

Each AI-system row now opens a dedicated record:

```text
/app/systems/[id]
```

Users can edit:

- system name,
- provider,
- purpose,
- owner,
- lifecycle,
- next review date,
- governance inputs,
- internal notes.

Changing governance inputs recalculates the priority score.

### Formal review workflow

Added an append-only `system_reviews` table.

A review can record:

- reviewer,
- review date,
- outcome,
- notes,
- next review due date.

Supported outcomes:

```text
approved
changes_required
paused
```

If a review outcome is `paused`, the AI-system lifecycle is also changed to paused.

Review history remains visible on the system detail page.

---

## Sprint 2B — Private evidence library

The original readiness view was upgraded into real evidence storage.

### Evidence uploads

Users can upload evidence such as:

- PDF
- PNG/JPG
- TXT
- CSV
- Word documents
- Excel files

Maximum file size:

```text
15 MB
```

### Storage model

Evidence files are stored in a private Supabase Storage bucket:

```text
evidence
```

The bucket is not public.

Storage object access is workspace-scoped through RLS.

### Evidence metadata

Each evidence record can store:

- title,
- related AI system,
- file name,
- MIME type,
- file size,
- notes,
- validity/expiry date,
- storage path,
- uploader.

### Downloads

Evidence downloads use short-lived signed URLs.

The current UI generates one-hour signed links.

### Deletion

Authorized workspace writers can delete evidence.

The storage object and corresponding metadata record are removed.

---

## Sprint 2C — Database-backed activity/audit trail

Added `activity_events`.

The important design decision is that key events are created by **Postgres triggers**, rather than relying only on the browser/frontend to remember to log them.

Current activity includes events such as:

- AI system created,
- AI system updated,
- system reviewed,
- action created,
- action updated,
- action completed,
- evidence uploaded,
- evidence deleted,
- member invited,
- invitation accepted,
- invitation revoked,
- member added,
- member removed,
- member role changed,
- reminder settings updated,
- review reminder sent.

Users can view the latest workspace activity at:

```text
/app/activity
```

---

## Sprint 2D — Team invitations and enforced roles

Added secure workspace collaboration.

### Invitation creation

Owner/Admin users can generate invitation links.

Invite properties include:

- target email,
- target role,
- workspace,
- cryptographically random token,
- hashed token stored in the database,
- 7-day expiry,
- inviter,
- acceptance metadata.

The plaintext invitation token is not stored in the database.

### Acceptance

Invitation acceptance is performed through a secured Postgres function.

Acceptance verifies:

1. user is authenticated,
2. invitation token hash exists,
3. invitation is not expired,
4. invitation is not already accepted,
5. invitation is not revoked,
6. authenticated email matches the email that was invited,
7. user is not already attached to another workspace.

Only after those checks is membership created.

### Signup + invitation flow

A brand-new user can follow:

```text
Invite link
  -> Signup
  -> Email confirmation
  -> Return to invite
  -> Accept invitation
  -> Enter workspace
```

### Member-management controls

Workspace Settings now support:

- member directory,
- member email/name,
- current role,
- role changes,
- member removal,
- pending invitations,
- expired-invite indication,
- invitation revocation.

### Role hardening

Invitation rows were hardened so normal users cannot mutate an existing invitation into a higher role through direct API calls.

If an invitation needs to change, it should be revoked and recreated.

---

## Sprint 2E — CSV import/export

Implemented migration tooling for teams already maintaining AI inventories in spreadsheets.

### CSV template

Public template endpoint:

```text
/api/systems/template
```

Supported import columns:

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

### Import

The AI Systems page includes CSV upload and preview.

Safeguards include:

- `.csv` only,
- maximum 2 MB,
- maximum 500 rows per import,
- required column validation,
- unknown column validation,
- enum validation,
- email validation,
- date validation,
- boolean normalization,
- duplicate detection,
- plan-limit enforcement,
- server-side revalidation.

Duplicate identity currently uses:

```text
lower(name) + lower(provider)
```

Duplicates inside the file and duplicates already present in the workspace are skipped.

Governance scores are recalculated server-side rather than trusted from spreadsheet input.

### Export

Authenticated endpoint:

```text
/api/systems/export
```

Exports the workspace register to CSV.

Exports include the normal input columns plus calculated/reference information such as:

- priority score,
- priority level,
- last reviewed.

The generated export can be fed back through the importer because calculated fields are tolerated but not trusted as inputs.

Viewers may export, but cannot import.

---

## Sprint 2F — Scheduled review/reminder workflow

### What has been implemented in code

Aegistra now contains a complete reminder workflow.

Workspace Owner/Admin users can configure:

- whether reminders are enabled,
- how many days before a review the reminder window starts,
- whether overdue reminders continue,
- how often overdue reminders repeat.

Reminder settings are stored in:

```text
workspace_reminder_settings
```

Delivery attempts are stored in:

```text
review_reminder_deliveries
```

### Reminder worker

Worker endpoint:

```text
/api/cron/review-reminders
```

`vercel.json` declares a daily schedule:

```text
08:00 UTC every day
```

The worker:

1. loads enabled workspace reminder settings,
2. identifies AI systems with a review date inside the reminder horizon,
3. ignores retired systems,
4. determines whether each system is upcoming, due today, or overdue,
5. looks for the AI-system `owner_email`,
6. suppresses previously successful identical reminders,
7. calls the transactional-email adapter,
8. records success/failure in the delivery log,
9. records successful sends in the workspace activity timeline.

### Reminder email content

The email includes:

- Aegistra branding,
- AI-system name,
- workspace name,
- review due date,
- whether the review is upcoming/due/overdue,
- direct link back to the AI-system record.

### Duplicate protection

Duplicate protection exists at two layers:

1. Aegistra's `review_reminder_deliveries` database log.
2. Resend idempotency keys.

### Safety limits

The worker currently caps delivery attempts per run to avoid unexpectedly large batches.

---

# IMPORTANT: reminder email activation is still pending

The **application code exists**, but reminder emails are **not currently active in production**.

This distinction is important for any developer/agent taking over the project.

## What is still missing

### 1. Resend account/domain configuration

A sending domain/address still needs to be configured in Resend.

Example:

```text
reminders@yourdomain.com
```

The sender/domain must be verified according to Resend's requirements.

### 2. Resend API key

A production Resend API key has not yet been placed into Vercel.

Required variable:

```text
RESEND_API_KEY
```

### 3. Sender email

Required variable:

```text
REMINDER_FROM_EMAIL
```

Example:

```text
Aegistra <reminders@yourdomain.com>
```

### 4. Optional reply-to

Optional variable:

```text
REMINDER_REPLY_TO
```

### 5. Vercel CRON_SECRET

A random production secret still needs to be configured in the Aegistra Vercel project.

Required variable:

```text
CRON_SECRET
```

The cron endpoint validates:

```text
Authorization: Bearer <CRON_SECRET>
```

Without this variable the endpoint deliberately refuses to run.

At the last live check:

```text
/api/cron/review-reminders
```

returned:

```text
CRON_SECRET is not configured.
```

This is the expected current state.

### 6. Redeploy after adding environment variables

After configuring the email/cron variables in Vercel, redeploy Aegistra so the production functions receive them.

### 7. End-to-end reminder test

Before enabling reminders for customers, perform a controlled test:

1. configure Resend,
2. configure all Vercel variables,
3. create/test an AI system with an owner email and a review date inside the reminder window,
4. enable reminders in Workspace Settings,
5. invoke the secured cron endpoint,
6. verify the email delivered,
7. verify a delivery row was created,
8. verify an activity event was created,
9. invoke again and confirm the successful reminder is not duplicated.

**No reminder email should be considered production-ready until this test passes.**

---

# Database migrations

All SQL migrations live under:

```text
supabase/migrations/
```

Apply every migration in numeric order for a new environment.

## Migration history

### `001_init.sql`

Initial product schema and RLS.

Created core tables including:

- profiles,
- workspaces,
- workspace_members,
- ai_systems,
- action_items,
- evidence_items.

Also created foundational RLS helper functions and policies.

### `002_performance_indexes.sql`

Added indexes for initial foreign keys/common access patterns.

### `003_system_review_history.sql`

Added:

- `system_reviews`,
- review-history RLS,
- review indexes.

### `004_system_reviews_reviewer_index.sql`

Added reviewer lookup/index coverage.

### `005_private_evidence_storage_and_activity.sql`

Added:

- file metadata to evidence,
- `activity_events`,
- private `evidence` Storage bucket,
- workspace-scoped Storage policies.

### `006_automatic_activity_triggers.sql`

Added database triggers for automatic activity logging across:

- AI systems,
- reviews,
- actions,
- evidence.

### `007_workspace_invitations_and_roles.sql`

Added:

- owner/write helper functions,
- `workspace_invitations`,
- enforced role policies,
- invitation/member activity triggers.

### `008_secure_invitation_acceptance.sql`

Added secure invitation-acceptance RPC.

### `009_secure_workspace_member_directory.sql`

Added a controlled workspace member-directory function so the app can display teammate information without exposing `auth.users` directly.

### `010_harden_invitation_mutations.sql`

Hardened invitation creation/revocation so normal clients cannot mutate invitation roles after creation.

### `011_review_reminder_settings_and_delivery_log.sql`

Added:

- `workspace_reminder_settings`,
- `review_reminder_deliveries`,
- reminder-setting policies,
- reminder-setting activity logging.

### `012_reminder_and_invitation_fk_indexes.sql`

Added covering indexes for reminder/invitation foreign keys identified by Supabase's performance advisor.

---

# Current database objects

Primary customer-facing tables now include:

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

Private file bucket:

```text
evidence
```

---

# Security model

## Tenant isolation

Aegistra relies on Postgres Row Level Security.

Tenant isolation is enforced using workspace membership at the database layer.

The frontend is not the security boundary.

## Private helper schema

Authorization/helper functions live inside:

```text
private
```

rather than being exposed as ordinary public tables/functions.

## Secret-key handling

The following must remain server-only:

```text
SUPABASE_SECRET_KEY
RESEND_API_KEY
CRON_SECRET
```

Never prefix any of these with `NEXT_PUBLIC_`.

## Private evidence

Evidence storage:

- uses a private bucket,
- applies workspace-scoped Storage RLS,
- uses expiring signed URLs.

## Audit trail

Core activity is logged by database triggers rather than relying entirely on frontend code.

## CSV safety

CSV imports are:

- server validated,
- workspace scoped,
- size limited,
- row limited,
- plan limited,
- enum/date/email validated.

## Reminder safety

Review reminders use:

- `CRON_SECRET` authorization,
- server-only email credentials,
- Aegistra database de-duplication,
- provider idempotency keys,
- delivery-attempt logging,
- a per-run attempt cap.

---

# Security work still recommended before serious paid enterprise sales

Even though the current Supabase security advisor is clean, additional production-hardening work is still recommended before selling into security-sensitive enterprise environments.

Items include:

- stronger Content Security Policy,
- stronger authentication/password policy,
- rate-limit review,
- admin MFA,
- backup/restore testing,
- dependency/SAST scanning,
- formal DPA,
- finalized privacy/terms,
- subprocessors page,
- retention/deletion policy,
- security incident process,
- external penetration/security review,
- formal audit-log retention policy.

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

## Core variables

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx

SUPABASE_SECRET_KEY=sb_secret_xxx
ADMIN_EMAILS=you@example.com
```

## Reminder variables

These exist in the codebase but are currently **pending production configuration**:

```bash
RESEND_API_KEY=re_xxx
REMINDER_FROM_EMAIL=Aegistra <reminders@yourdomain.com>
REMINDER_REPLY_TO=governance@yourdomain.com
CRON_SECRET=use-a-random-secret-at-least-16-characters
```

`REMINDER_REPLY_TO` is optional.

---

# Local development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
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

# Supabase setup for a fresh environment

1. Create a new Supabase project.
2. Apply every file from `supabase/migrations/` in numeric order.
3. Add the project URL and publishable key to the app environment.
4. Keep the Supabase secret/service-role key server-only.
5. Configure Supabase Auth redirect URLs.

Local callback:

```text
http://localhost:3000/auth/callback
```

Production callback:

```text
https://YOUR_DOMAIN/auth/callback
```

Set the Supabase Site URL to the final production domain.

---

# Vercel deployment

1. Import the GitHub repository.
2. Use the Next.js framework preset.
3. Configure core environment variables.
4. Set:

```text
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
```

5. Deploy.
6. Configure the final Supabase callback URL.
7. Verify signup/login/onboarding.
8. Verify RLS using two separate users/workspaces.
9. Verify Vercel Analytics.
10. Configure reminder variables only when ready to activate email delivery.

The daily reminder cron is declared in:

```text
vercel.json
```

and points to:

```text
/api/cron/review-reminders
```

---

# Repository structure

```text
aegistra/
├── .github/
│   └── workflows/
│       └── build.yml
├── public/
│   ├── aegistra-mark.svg
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon-48x48.png
│   └── apple-touch-icon.png
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── GTM.md
│   ├── MARKET_ANALYSIS.md
│   ├── PRD.md
│   ├── SECURITY.md
│   └── SPRINTS.md
├── supabase/
│   └── migrations/
│       ├── 001_init.sql
│       ├── 002_performance_indexes.sql
│       ├── 003_system_review_history.sql
│       ├── 004_system_reviews_reviewer_index.sql
│       ├── 005_private_evidence_storage_and_activity.sql
│       ├── 006_automatic_activity_triggers.sql
│       ├── 007_workspace_invitations_and_roles.sql
│       ├── 008_secure_invitation_acceptance.sql
│       ├── 009_secure_workspace_member_directory.sql
│       ├── 010_harden_invitation_mutations.sql
│       ├── 011_review_reminder_settings_and_delivery_log.sql
│       └── 012_reminder_and_invitation_fk_indexes.sql
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── app/
│   │   ├── auth/
│   │   ├── invite/
│   │   ├── login/
│   │   ├── onboarding/
│   │   ├── privacy/
│   │   ├── signup/
│   │   └── terms/
│   ├── components/
│   └── lib/
├── .env.example
├── next.config.ts
├── package.json
├── vercel.json
└── README.md
```

---

# Production behavior worth knowing

## Plan limits

The current application enforces approximate system-count limits:

```text
Free: 3
Team: 50
Business: effectively unlimited in MVP
Enterprise: effectively unlimited in MVP
```

This is **not yet connected to payment/billing state**.

## Workspace model

The current UX effectively assumes one workspace per account.

Invitation acceptance deliberately blocks joining a different workspace if the account already belongs to another workspace.

Proper multi-workspace switching is future work.

## Evidence

Evidence is private and workspace scoped.

There is not yet:

- evidence versioning,
- document OCR/extraction,
- automatic evidence classification.

## Audit events

The activity page shows the latest events.

Formal long-term audit retention/export is not implemented yet.

## Email reminders

Reminder code is present but **email delivery is inactive until Resend + Vercel secrets are configured**.

---

# Sprint 3 — Monetization

**Status: not started**

Planned work:

## Billing and plan enforcement

Potential scope:

- billing provider integration,
- checkout,
- subscription lifecycle,
- webhook handling,
- actual plan upgrades/downgrades,
- hard feature/usage enforcement,
- billing/settings UI,
- cancellation/reactivation flows.

The current plan field and Free/Team/Business concepts already exist, but there is no payment provider connected yet.

## Assurance-pack export

Planned goal:

Generate a customer/auditor-friendly package containing selected governance information, for example:

- AI-system register,
- ownership,
- review status,
- governance-priority information,
- evidence list,
- review history,
- open/closed actions.

Potential output:

- PDF
- ZIP bundle
- CSV attachments

## Questionnaire answer library

Planned capability:

Maintain reusable answers to common AI/security questionnaires.

## Framework references/control mapping

Potential future mappings/reference views:

- EU AI Act transparency-related obligations,
- NIST AI RMF,
- ISO/IEC 42001,
- internal governance controls.

This should be implemented as reference/mapping support rather than claiming certification.

---

# Sprint 4 — Expansion

**Status: not started**

Ideas currently planned:

- Google Workspace discovery experiments,
- Microsoft 365 discovery experiments,
- approved-AI catalog,
- employee AI-tool approval/intake workflow,
- Slack integration,
- Microsoft Teams integration,
- consultant/MSP multi-client mode,
- multi-workspace switching.

---

# Explicit non-goals / not implemented

A developer taking over the project should not assume any of these already exist:

- Stripe/Razorpay/payment billing
- production subscription lifecycle
- SSO/SAML
- SCIM
- Google Workspace AI discovery
- Microsoft 365 AI discovery
- Slack/Teams workflows
- automatic legal AI-risk classification
- prompt/model traffic proxying
- runtime LLM observability
- framework certification
- customer-facing assurance-pack export
- questionnaire-answer library
- automatic evidence parsing
- production Resend credentials
- active reminder email delivery

---

# Claude / developer handoff checklist

If another developer or coding agent continues from here, check these items first.

## 1. Confirm production baseline

Verify:

```text
https://aegistra.vercel.app/
```

Then run:

```bash
npm install
npm run build
```

before starting significant work.

## 2. Do not recreate completed Sprint 1/Sprint 2 features

The following already exist and should be extended rather than reimplemented:

- tenant model,
- RLS,
- system register,
- scoring,
- review history,
- evidence storage,
- activity log,
- roles,
- invitations,
- CSV import/export,
- reminder engine.

## 3. Reminder system is coded but not activated

Before debugging reminder delivery, first check whether these Vercel variables exist:

```text
CRON_SECRET
RESEND_API_KEY
REMINDER_FROM_EMAIL
REMINDER_REPLY_TO
```

At present they have **not been configured**.

A 503 response saying:

```text
CRON_SECRET is not configured.
```

is therefore expected and is not an application bug.

## 4. Configure Resend before testing reminder emails

Required steps:

- create/connect Resend account,
- verify sending domain,
- create API key,
- configure sender address,
- add Vercel environment variables,
- redeploy,
- enable reminders in a test workspace,
- test against a system with both `owner_email` and `review_due`.

## 5. Preserve RLS as the authorization boundary

Do not solve authorization by only hiding buttons.

Any new customer-owned object should:

- include `workspace_id`,
- enable RLS,
- use workspace helper functions/policies,
- avoid exposing service-role credentials to the browser.

## 6. Preserve the product guardrail

Do not market the priority score as:

- legal classification,
- regulatory certification,
- automatic EU AI Act classification.

It is an internal governance-prioritization score.

## 7. Recommended next development target

After activating/testing reminder delivery, move to Sprint 3:

1. billing/subscriptions,
2. assurance-pack export,
3. questionnaire library,
4. framework/reference mapping.

---

# Product documentation

Additional documentation exists under `docs/`:

- [PRD](docs/PRD.md)
- [Market analysis](docs/MARKET_ANALYSIS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Go-to-market](docs/GTM.md)
- [Sprint plan](docs/SPRINTS.md)
- [Architecture decisions](docs/DECISIONS.md)

The README is intentionally more detailed than those individual documents so a new developer or coding agent can understand the current product state from one file.

---

# License

Copyright © 2026. All rights reserved unless a separate license is added by the repository owner.
