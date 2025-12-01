import fetch from "node-fetch";

const MAILTRAP_TOKEN = process.env.MAILTRAP_API_TOKEN!;
const EMAIL_FROM =
  process.env.EMAIL_FROM || "Habit Garden <noreply@habitgarden.app>";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

if (!MAILTRAP_TOKEN) {
  console.warn("[email] Missing MAILTRAP_API_TOKEN – emails will not send.");
}

async function sendMailViaMailtrap(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!MAILTRAP_TOKEN) {
    console.log(`[email-mock] Would send to ${opts.to}: ${opts.subject}`);
    return;
  }

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
      category: "notification",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[Mailtrap send error]", err);
    throw new Error("Mailtrap API failed: " + err);
  }

  return true;
}


export async function sendVerificationEmail(opts: {
  to: string;
  token: string;
}) {
  const verifyUrl = `${process.env.SERVER_URL || "http://localhost:5050"}/api/auth/verify-email?token=${encodeURIComponent(
    opts.token
  )}`;

  const html = `
    <div style="font-family: system-ui, Arial; font-size: 15px; color: #333; max-width: 600px; margin: 0 auto;">
      <!-- CZ Section -->
      <h2 style="color:#10b981;">Habit Garden – ověření e-mailu 🌱</h2>
      <p>Ahoj!</p>
      <p>Prosím ověř svůj e-mail kliknutím na tlačítko níže:</p>

      <p style="margin: 24px 0;">
        <a href="${verifyUrl}"
           style="padding: 12px 24px; background:#10b981; color:white; font-weight:bold; border-radius:8px; text-decoration:none; display:inline-block;">
          Ověřit e-mail / Verify Email
        </a>
      </p>
      
      <p style="font-size:13px; color:#666;">Pokud tlačítko nefunguje: <br><a href="${verifyUrl}" style="color:#10b981;">${verifyUrl}</a></p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

      <!-- EN Section -->
      <h3 style="color:#10b981; font-size: 18px;">English version</h3>
      <p>Hello!</p>
      <p>Please verify your email address by clicking the button above.</p>
      <p style="font-size:13px; color:#666;">If the button doesn't work, copy and paste the link above.</p>
    </div>
  `;

  await sendMailViaMailtrap({
    to: opts.to,
    subject: "Ověřte svůj e-mail / Verify your email – Habit Garden",
    html,
  });
}


export async function sendDailyReminderEmail(opts: {
  to: string;
  nickname: string;
  pendingCount: number;
}) {
  const gardenUrl = `${CLIENT_URL}/#garden`;

  const html = `
    <div style="font-family: system-ui, Arial; font-size: 15px; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 20px 0;">
        <span style="font-size: 40px;">🌱</span>
      </div>
      
      <!-- CZ Section -->
      <h2 style="color:#10b981; text-align: center; margin-top: 0;">Čas zalít tvoji zahradu!</h2>
      
      <p>Ahoj <strong>${opts.nickname}</strong>,</p>
      
      <p>Všimli jsme si, že ti dnes zbývá dokončit <strong>${opts.pendingCount} návyků</strong>.</p>
      
      <p>Nenech svou sérii přerušit a své rostlinky uschnout. Stačí chvilka!</p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${gardenUrl}"
           style="padding: 14px 28px; background: linear-gradient(to right, #10b981, #059669); color:white; font-weight:bold; border-radius:50px; text-decoration:none; display:inline-block; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
          Otevřít Habit Garden / Open App
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
      
      <!-- EN Section -->
      <h3 style="color:#10b981; text-align: center; font-size: 18px;">Time to water your garden!</h3>
      
      <p>Hi <strong>${opts.nickname}</strong>,</p>
      
      <p>We noticed you have <strong>${opts.pendingCount} habits</strong> remaining for today.</p>
      
      <p>Don't let your streak break and your plants wither. It only takes a moment!</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

      <p style="font-size: 12px; color: #888; text-align: center;">
        Tento e-mail ti přišel, protože máš zapnuté denní připomínky v aplikaci Habit Garden.<br>
        You received this email because you enabled daily reminders in Habit Garden.
      </p>
    </div>
  `;

  await sendMailViaMailtrap({
    to: opts.to,
    subject: "🌱 Tvoje zahrada tě potřebuje! / Your garden needs you!",
    html,
  });
}