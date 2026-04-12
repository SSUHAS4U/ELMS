import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security: Sanity check environment variables
const resendApiKey = process.env.RESEND_API_KEY;
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const senderEmail = process.env.SMTP_FROM || 'ssuhas4u@gmail.com'; 

console.log(`[Email System] Resend API: ${resendApiKey ? 'CONFIGURED' : 'MISSING'}`);
console.log(`[Email System] SendGrid API: ${sendgridApiKey ? 'CONFIGURED' : 'MISSING'}`);

/**
 * Unified email sender using SendGrid (Primary) or Resend (Fallback) HTTP API.
 * Bypasses Render's SMTP port blocking.
 */
export const sendEmail = async ({ email, to, subject, template, templateName, context }) => {
  const recipient = to || email;
  const tmplName = templateName || template;

  if (!recipient || !tmplName) {
    console.warn('[Email System] Missing recipient or template — skipping.');
    return;
  }

  // 1. Prepare HTML Content
  const templatePath = path.join(__dirname, `../email-templates/${tmplName}.hbs`);
  let html;
  if (fs.existsSync(templatePath)) {
    const source = fs.readFileSync(templatePath, 'utf-8');
    const compiled = handlebars.compile(source);
    html = compiled(context || {});
  } else {
    html = `<div style="font-family:sans-serif;padding:24px;">
      <h2 style="color:#00C96B;">${subject}</h2>
      <pre style="background:#f5f5f5;padding:16px;border-radius:8px;">${JSON.stringify(context, null, 2)}</pre>
      <p style="color:#888;margin-top:16px;">— Obsidian ELMS</p>
    </div>`;
  }

  // 2. Decide Provider (SendGrid takes precedence for no-domain accounts)
  if (sendgridApiKey) {
    return sendViaSendGrid(recipient, subject, html);
  } else if (resendApiKey) {
    return sendViaResend(recipient, subject, html);
  } else {
    console.error('[Email System] No API key found for SendGrid or Resend.');
    return null;
  }
};

/**
 * Send via SendGrid HTTP API
 */
const sendViaSendGrid = (recipient, subject, html) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      personalizations: [{ to: [{ email: recipient }] }],
      from: { email: senderEmail, name: 'Obsidian ELMS' },
      subject: subject,
      content: [{ type: 'text/html', value: html }]
    });

    const options = {
      hostname: 'api.sendgrid.com',
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[Email System] Success! Sent via SendGrid to: ${recipient}`);
        resolve(true);
      } else {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          console.error(`[Email System] SendGrid Error (${res.statusCode}): ${body}`);
          resolve(null);
        });
      }
    });

    req.on('error', (e) => {
      console.error(`[Email System] SendGrid Network Error: ${e.message}`);
      resolve(null);
    });

    req.write(data);
    req.end();
  });
};

/**
 * Send via Resend HTTP API
 */
const sendViaResend = (recipient, subject, html) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      from: 'Obsidian ELMS <onboarding@resend.dev>',
      to: [recipient],
      subject: subject,
      html: html
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[Email System] Success! Sent via Resend to: ${recipient}`);
        resolve(true);
      } else {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          console.error(`[Email System] Resend API Error (${res.statusCode}): ${body}`);
          resolve(null);
        });
      }
    });

    req.on('error', (e) => {
      console.error(`[Email System] Resend Network Error: ${e.message}`);
      resolve(null);
    });

    req.write(data);
    req.end();
  });
};
