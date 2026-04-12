import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security: Sanity check environment variables
const resendApiKey = process.env.RESEND_API_KEY;
console.log(`[Email System] Resend API: ${resendApiKey ? 'CONFIGURED' : 'MISSING'}`);

/**
 * Unified email sender using Resend HTTP API.
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

  // 2. Send via Resend HTTP API
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

    console.log(`[Email System] Firing HTTP API request to Resend for: ${recipient}`);

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[Email System] Success! Sent via Resend to: ${recipient}`);
          resolve(true);
        } else {
          console.error(`[Email System] Resend API Error (${res.statusCode}): ${responseData}`);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`[Email System] Network Error: ${error.message}`);
      resolve(null);
    });

    req.write(data);
    req.end();
  });
};
