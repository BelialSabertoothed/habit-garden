import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT
  ? Number(process.env.SMTP_PORT)
  : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM =
  process.env.EMAIL_FROM || "Habit Garden <noreply@habit-garden.local>";
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
  secure: SMTP_PORT === 465, // 465 = TLS
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
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont;">
      <h2>Habit Garden – verify your email 🌱</h2>
      <p>Hi!</p>
      <p>Please confirm your email address by clicking the button below:</p>
      <p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:10px 16px;background:#22c55e;color:white;border-radius:6px;text-decoration:none;">
          Verify email
        </a>
      </p>
      <p>Or copy this link into your browser:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>If you didn't create an account, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: opts.to,
    subject: "Verify your email – Habit Garden",
    html,
  });
}