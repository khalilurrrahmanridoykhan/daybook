import "server-only";
import { Resend } from "resend";
import { env, featureFlags } from "./env";

const resend = featureFlags.email ? new Resend(env.RESEND_API_KEY) : null;

type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Send a transactional email. When Resend is not configured (no
 * `RESEND_API_KEY`), the message is logged to the server console instead and
 * `{ sent: false }` is returned so callers can surface a dev hint.
 */
export async function sendMail(mail: Mail): Promise<{ sent: boolean }> {
  if (!resend) {
    console.info(
      `\n──────── email (Resend not configured) ────────\n` +
        `to:      ${mail.to}\n` +
        `subject: ${mail.subject}\n\n${mail.text}\n` +
        `──────────────────────────────────────────────\n`,
    );
    return { sent: false };
  }
  await resend.emails.send({ from: env.EMAIL_FROM, ...mail });
  return { sent: true };
}

// ── templates ───────────────────────────────────────────────

const shell = (
  title: string,
  body: string,
) => `<!doctype html><html><body style="margin:0;background:#f4f1e7;padding:32px 0;font-family:Georgia,'Times New Roman',serif;color:#23201a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="440" cellpadding="0" cellspacing="0" style="background:#fbf9f2;border:1px solid #d6cfbc;border-radius:2px">
<tr><td style="padding:28px 32px">
<div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8170">Daybook</div>
<h1 style="font-size:22px;font-weight:500;margin:8px 0 16px">${title}</h1>
${body}
</td></tr></table>
<div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#8a8170;margin-top:16px">Daybook · a private book of account</div>
</td></tr></table></body></html>`;

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#b23a2e;color:#f8f5ec;text-decoration:none;padding:11px 22px;border-radius:2px;font-family:Georgia,serif">${label}</a>`;

export function verificationEmail(link: string): Omit<Mail, "to"> {
  return {
    subject: "Confirm your Daybook account",
    text: `Confirm your email to open your Daybook:\n\n${link}\n\nThe link is good for 24 hours.`,
    html: shell(
      "Confirm your entry",
      `<p style="line-height:1.6;margin:0 0 20px">Open the link below to confirm your email and start your book. It is good for 24 hours.</p>
       <p style="margin:0 0 20px">${button(link, "Confirm my email")}</p>
       <p style="font-size:13px;color:#6b6353;margin:0">If you didn't open a Daybook account, ignore this note.</p>`,
    ),
  };
}

export function resetEmail(link: string): Omit<Mail, "to"> {
  return {
    subject: "Reset your Daybook password",
    text: `Reset your Daybook password:\n\n${link}\n\nThe link is good for 30 minutes. If you didn't ask, ignore this.`,
    html: shell(
      "Reset your password",
      `<p style="line-height:1.6;margin:0 0 20px">Use the link below to set a new password. It is good for 30 minutes.</p>
       <p style="margin:0 0 20px">${button(link, "Set a new password")}</p>
       <p style="font-size:13px;color:#6b6353;margin:0">If you didn't ask for this, no change has been made — ignore this note.</p>`,
    ),
  };
}
