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

/**
 * Unified email sender.
 * Accepts: { email, subject, template, context }
 * OR:      { to, subject, templateName, context }
 * This flexibility prevents mismatches between controllers.
 */
export const sendEmail = async ({ email, to, subject, template, templateName, context }) => {
  const recipient = to || email;
  const tmplName = templateName || template;

  if (!recipient || !tmplName) {
    console.warn('sendEmail called with missing recipient or template name — skipping.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      family: 4 // Purely forces IPv4 for Nodemailer socket connection
    });

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
