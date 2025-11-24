import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const EMAIL_FROM =
  process.env.EMAIL_FROM || "Habit Garden <hello@habitgarden.app>";

const SERVER_URL =
  process.env.SERVER_URL || "http://localhost:5050";

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn(
    "[email] SMTP is not fully configured – verification emails may not work."
  );
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // 587 = STARTTLS, u Mailtrapu takhle ok
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendVerificationEmail(opts: {
  to: string;
  token: string;
}) {
  const verifyUrl = `${SERVER_URL}/api/auth/verify-email?token=${encodeURIComponent(
    opts.token
  )}`;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont; color:#0f172a;">
      <!-- CZ část -->
      <h2>Habit Garden – ověř svůj e-mail 🌱</h2>
      <p>Ahoj,</p>
      <p>děkujeme, že ses zaregistrovala do Habit Garden. Prosím ověř svou e-mailovou adresu kliknutím na tlačítko níže:</p>
      <p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:10px 16px;background:#22c55e;color:white;border-radius:6px;text-decoration:none;font-weight:500;">
          Ověřit e-mail
        </a>
      </p>
      <p>Pokud tlačítko nefunguje, zkopíruj následující odkaz do prohlížeče:</p>
      <p><a href="${verifyUrl}" style="color:#16a34a;">${verifyUrl}</a></p>
      <p>Pokud jsi si účet v Habit Garden nevytvořila, můžeš tento e-mail ignorovat.</p>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">

      <!-- EN část -->
      <h2>Habit Garden – verify your email 🌱</h2>
      <p>Hi,</p>
      <p>thank you for signing up for Habit Garden. Please confirm your email address by clicking the button below:</p>
      <p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:10px 16px;background:#22c55e;color:white;border-radius:6px;text-decoration:none;font-weight:500;">
          Verify email
        </a>
      </p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${verifyUrl}" style="color:#16a34a;">${verifyUrl}</a></p>
      <p>If you did not create a Habit Garden account, you can safely ignore this email.</p>

      <p style="margin-top:24px;font-size:12px;color:#6b7280;">
        This is an automated message, please do not reply.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: opts.to,
    subject: "Habit Garden – ověření e-mailu / Email verification",
    html,
  });
}