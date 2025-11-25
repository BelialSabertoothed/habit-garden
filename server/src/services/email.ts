import fetch from "node-fetch";

const MAILTRAP_TOKEN = process.env.MAILTRAP_API_TOKEN!;
const EMAIL_FROM =
  process.env.EMAIL_FROM || "Habit Garden <noreply@habitgarden.app>";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:5050";

if (!MAILTRAP_TOKEN) {
  console.warn("[email] Missing MAILTRAP_API_TOKEN – emails will not send.");
}

/**
 * Sends e-mails using the Mailtrap HTTP API
 */
async function sendMailViaMailtrap(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const res = await fetch("https://send.api.mailtrap.io/api/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MAILTRAP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: EMAIL_FROM.match(/<(.+)>/)?.[1] || EMAIL_FROM },
      to: [{ email: opts.to }],
      subject: opts.subject,
      html: opts.html,
      category: "transactional",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[Mailtrap send error]", err);
    throw new Error("Mailtrap API failed: " + err);
  }

  return true;
}

/**
 * Sends verification e-mail
 */
export async function sendVerificationEmail(opts: {
  to: string;
  token: string;
}) {
  const verifyUrl = `${SERVER_URL}/api/auth/verify-email?token=${encodeURIComponent(
    opts.token
  )}`;

  const html = `
    <div style="font-family: system-ui, Arial; font-size: 15px;">

    <h2 style="color:#22c55e;">Habit Garden – ověření e-mailu 🌱</h2>
    <p>Ahoj! 👋</p>
    <p>Prosím ověř svůj e-mail kliknutím na tlačítko níže:</p>

    <p style="margin: 24px 0;">
      <a href="${verifyUrl}"
         style="padding: 12px 20px; background:#22c55e; color:white; font-weight:bold; border-radius:8px; text-decoration:none;">
        Ověřit e-mail
      </a>
    </p>

    <p>Pokud tlačítko nefunguje, zkopíruj a vlož tento odkaz:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>

    <hr style="margin:32px 0; opacity:0.2">

    <h3>English version</h3>
    <p>Please verify your email by clicking the button above.</p>
    <p>If you did not request this, you can safely ignore it.</p>

  </div>
    <div style="font-family: system-ui, Arial; font-size: 15px;">
      <h2 style="color:#22c55e;">Habit Garden – verify your email 🌱</h2>
      <p>Hello! 👋</p>
      <p>Please confirm your email address by clicking the button below:</p>

      <p style="margin: 24px 0;">
        <a href="${verifyUrl}"
           style="padding: 12px 20px; background:#22c55e; color:white; font-weight:bold; border-radius:8px; text-decoration:none;">
          Verify email
        </a>
      </p>

      <p>If the button doesn't work, open this link:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>

      <hr style="margin:32px 0; opacity:0.2">
      <p style="font-size:13px; color:#666;">If you didn't create an account, ignore this e-mail.</p>
    </div>
  `;

  await sendMailViaMailtrap({
    to: opts.to,
    subject: "Verify your email – Habit Garden",
    html,
  });
}
