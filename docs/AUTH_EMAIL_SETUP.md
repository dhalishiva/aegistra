# Auth email setup: 6-digit codes and Outlook SMTP

Aegistra signup and password reset use a **6-digit code** that Supabase emails to the user.
The app code is ready. Three things must be configured in the Supabase dashboard
(Project `aeyaivjyoponbddxflvd` → Authentication). They cannot be set from the repository.

## 1. Send mail through your Outlook account

Authentication → **SMTP Settings** → enable **Custom SMTP**:

| Field | Value |
|---|---|
| Sender email | the Outlook / Microsoft 365 address you send from |
| Sender name | Aegistra |
| Host | `smtp.office365.com` |
| Port | `587` |
| Username | the full mailbox address |
| Password | the mailbox password, or an **app password** if the account has MFA |

Notes:

- Microsoft is turning off basic-auth SMTP for many tenants. If login fails with an authentication
  error, enable **Authenticated SMTP** for the mailbox (Microsoft 365 admin centre → Users → Mail →
  Manage email apps), or use an app password for a personal outlook.com account.
- The sender address must match the mailbox (or one it is allowed to send as), otherwise Outlook
  rejects the message.
- Supabase's built-in mail service is limited to a few emails per hour and only sends to team
  members, so custom SMTP is required for real users.

## 2. Make the emails contain the code

Authentication → **Email Templates**. Put `{{ .Token }}` in both templates.

**Confirm signup** — subject `Your Aegistra code: {{ .Token }}`

```html
<h2>Confirm your email</h2>
<p>Enter this 6-digit code in Aegistra to finish creating your account:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
<p>The code expires in one hour. If you did not sign up, ignore this email.</p>
```

**Reset password** — subject `Your Aegistra password reset code: {{ .Token }}`

```html
<h2>Reset your password</h2>
<p>Enter this 6-digit code in Aegistra to choose a new password:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
<p>The code expires in one hour. If you did not ask for this, ignore this email.</p>
```

## 3. Check the auth settings

Authentication → Sign In / Providers → **Email**:

- **Confirm email**: on (signup then asks for the code)
- **Email OTP length**: 6
- **Email OTP expiration**: 3600 seconds or less
- **Minimum password length**: 8 (the app also checks this in the browser)

## Reminder emails (separate from sign-in emails)

Review reminders are sent by the Vercel cron job. They can use the same Outlook mailbox. In Vercel
(Production and Preview) add:

```text
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=you@yourdomain.com
SMTP_PASSWORD=...
REMINDER_FROM_EMAIL=Aegistra <you@yourdomain.com>
CRON_SECRET=<a long random string>
```

If `RESEND_API_KEY` is also set, SMTP takes priority.

## How to test

1. Open `/signup`, enter an email, choose **Create account**: a 6-digit code arrives, enter it, and
   you land on workspace setup.
2. Open `/forgot-password`, enter the email, enter the code and a new password: you are signed in.
3. Try a wrong code (it is rejected) and **Resend code** (it is rate limited for 45 seconds).
