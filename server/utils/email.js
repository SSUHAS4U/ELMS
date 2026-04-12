import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix for Render / Node 18+ preferring IPv6 and crashing (ENETUNREACH)
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security: Sanity check environment variables (Passwords masked)
const smtpConfigAvailable = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
console.log(`[Email System] Configuration detected: ${smtpConfigAvailable ? 'READY' : 'MISSING'}`);
if (smtpConfigAvailable) {
  console.log(`[Email System] SMTP User: ${process.env.SMTP_USER}`);
  console.log(`[Email System] SMTP Pass Length: ${process.env.SMTP_PASS.length}`);
  console.log(`[Email System] SMTP Service: Gmail (Forced IPv4, Debug ON)`);
}

/**
 * Unified email sender.
 */
export const sendEmail = async ({ email, to, subject, template, templateName, context }) => {
  const recipient = to || email;
  const tmplName = templateName || template;

  if (!recipient || !tmplName) {
    console.warn('[Email System] Missing recipient or template — skipping.');
    return;
  }

  try {
    // We use explicit host/port here with Debugging to see the handshake
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL/TLS directly on port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      family: 4, // Force IPv4
      debug: true, // Output SMTP traffic to console
      logger: true, // Log information to console
      connectionTimeout: 15000, // 15s timeout
      greetingTimeout: 15000, 
      socketTimeout: 15000
    });

    console.log(`[Email System] Attempting to send "${subject}" to ${recipient}...`);

    const templatePath = path.join(__dirname, `../email-templates/${tmplName}.hbs`);

    let html;
    if (fs.existsSync(templatePath)) {
      const source = fs.readFileSync(templatePath, 'utf-8');
      const compiled = handlebars.compile(source);
      html = compiled(context || {});
    } else {
      // Fallback: generate simple HTML from context so emails still go out
      console.warn(`Template "${tmplName}.hbs" not found — using plain fallback.`);
      html = `<div style="font-family:sans-serif;padding:24px;">
        <h2 style="color:#00C96B;">${subject}</h2>
        <pre style="background:#f5f5f5;padding:16px;border-radius:8px;">${JSON.stringify(context, null, 2)}</pre>
        <p style="color:#888;margin-top:16px;">— Obsidian ELMS</p>
      </div>`;
    }

    const mailOptions = {
      from: `"Obsidian ELMS" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: recipient,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    // Log but never throw — email failure should never crash the main operation
    console.error(`Email sending failed: ${error.message}`);
  }
};
