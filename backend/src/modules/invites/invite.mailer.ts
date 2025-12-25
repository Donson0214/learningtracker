import nodemailer from "nodemailer";

type InviteEmailPayload = {
  to: string;
  organizationName: string;
  invitedBy: string;
  inviteLink: string;
  expiresInDays: number;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_PASS must be set");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

const formatSender = () => {
  const fromName = process.env.SMTP_FROM_NAME || "Learning Tracker";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  if (!fromEmail) {
    throw new Error("SMTP_FROM_EMAIL or SMTP_USER must be set");
  }
  return `"${fromName}" <${fromEmail}>`;
};

export const sendInviteEmail = async (
  payload: InviteEmailPayload
) => {
  const transporter = createTransporter();
  const from = formatSender();
  const subject = `${payload.invitedBy} invited you to join ${payload.organizationName}`;
  const safeInvitedBy = escapeHtml(payload.invitedBy);
  const safeOrg = escapeHtml(payload.organizationName);
  const safeInviteLink = escapeHtml(payload.inviteLink);

  const text = [
    `You have been invited to join ${payload.organizationName} in Learning Tracker.`,
    "",
    `Accept invite: ${payload.inviteLink}`,
    "",
    `This invite expires in ${payload.expiresInDays} day(s).`,
    "If you were not expecting this invite, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin: 0 0 12px 0;">You're invited to Learning Tracker</h2>
      <p style="margin: 0 0 12px 0;">
        <strong>${safeInvitedBy}</strong> invited you to join
        <strong>${safeOrg}</strong>.
      </p>
      <p style="margin: 0 0 12px 0;">
        Click the button below to accept your invite:
      </p>
      <p style="margin: 16px 0;">
        <a
          href="${safeInviteLink}"
          style="background: #2563eb; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px;"
        >
          Accept Invite
        </a>
      </p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569;">
        This invite expires in ${payload.expiresInDays} day(s).
      </p>
      <p style="margin: 0; font-size: 12px; color: #64748b;">
        If you were not expecting this invite, you can ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: payload.to,
    subject,
    text,
    html,
  });
};
