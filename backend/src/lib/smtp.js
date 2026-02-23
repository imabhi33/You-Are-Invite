import nodemailer from "nodemailer";
import { env } from "./env.js";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildInviteEmailHtml({
  guestName,
  dateLabel,
  venue,
  inviteUrl
}) {
  return `
  <div style="margin:0;padding:24px;background:#1e0a0d;font-family:Arial,sans-serif;color:#f7ead0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;border:1px solid #9b7b40;border-radius:18px;background:linear-gradient(180deg,#3c1219 0%,#240a0f 100%);overflow:hidden;">
      <tr>
        <td style="padding:30px 26px 14px 26px;text-align:center;">
          <p style="margin:0;font-size:12px;letter-spacing:4px;color:#d9bb79;">YOU ARE INVITED</p>
          <h1 style="margin:12px 0 0 0;font-size:46px;line-height:1;color:#f2d79d;">${escapeHtml(guestName)}</h1>
          <p style="margin:14px 0 0 0;font-size:18px;color:#f4ddad;">${escapeHtml(dateLabel)}</p>
          <p style="margin:6px 0 0 0;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#e8c985;">${escapeHtml(venue)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 26px 28px 26px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(231,197,119,0.25);border-radius:12px;background:rgba(255,255,255,0.03);">
            <tr>
              <td style="padding:18px;text-align:center;">
                <p style="margin:0 0 16px 0;font-size:14px;color:#f6e9cd;">Your invitation page is ready. Share this link with your guests.</p>
                <a href="${inviteUrl}" style="display:inline-block;padding:12px 20px;background:#e1bf78;color:#2a0f10;text-decoration:none;border-radius:999px;font-weight:bold;">
                  Open Invitation
                </a>
                <p style="margin:16px 0 6px 0;font-size:12px;color:#cfae67;">Guest Link</p>
                <p style="margin:0 0 12px 0;word-break:break-all;font-size:12px;color:#f7e9c7;">${inviteUrl}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `.trim();
}

function createTransporter() {
  if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPass) {
    throw new Error("SMTP is not configured. Missing SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS");
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: Number(env.smtpPort),
    secure: env.smtpSecure === "true",
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
}

export async function sendInviteEmailSmtp({
  toEmail,
  groomName,
  brideName,
  eventDate,
  venue,
  inviteUrl
}) {
  const transporter = createTransporter();
  const guestName = `${groomName || "Host"} & ${brideName || "Guest"}`;
  const dateLabel = eventDate || "Date To Be Announced";

  await transporter.sendMail({
    from: `${env.smtpFromName} <${env.smtpFromEmail}>`,
    to: toEmail,
    subject: `Your invitation link is ready - ${guestName}`,
    html: buildInviteEmailHtml({
      guestName,
      dateLabel,
      venue: venue || "Venue",
      inviteUrl
    })
  });
}
