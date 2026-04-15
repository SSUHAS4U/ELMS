import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security: Sanity check environment variables
const brevoApiKey = process.env.BREVO_API_KEY?.trim();
const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'notif.elms@gmail.com'; 

if (!brevoApiKey) {
  console.warn('[Email System] BREVO_API_KEY is missing from environment variables!');
} else {
  console.log(`[Email System] Brevo API status: CONFIGURED (Key length: ${brevoApiKey.length})`);
}

/**
 * Unified email sender using Brevo v3 HTTP API.
 * Bypasses Render's SMTP port blocking by using HTTPS (Port 443).
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
  
  // Define the Frontend App URL for links
  // Priority: 1. FRONTEND_URL, 2. First URL in CLIENT_URL (if comma-separated), 3. Default fallback
  const frontendUrl = process.env.FRONTEND_URL || (process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',')[0].trim() : null);
  const appUrl = frontendUrl || 'https://obsidianelms.netlify.app';

  if (fs.existsSync(templatePath)) {
    const source = fs.readFileSync(templatePath, 'utf-8');
    const compiled = handlebars.compile(source);
    // Inject appUrl into context so templates can use {{appUrl}}
    html = compiled({ ...context, appUrl });
  } else {
    html = `<div style="font-family:sans-serif;padding:24px;">
      <h2 style="color:#7B61FF;">${subject}</h2>
      <pre style="background:#f5f5f5;padding:16px;border-radius:8px;">${JSON.stringify(context, null, 2)}</pre>
      <p style="color:#888;margin-top:16px;">— ELMS Notification</p>
    </div>`;
  }

  // 2. Send via Brevo HTTP API (Transactional)
  return new Promise((resolve) => {
    const data = JSON.stringify({
      sender: { name: 'Obsidian ELMS', email: senderEmail },
      to: [{ email: recipient }],
      subject: subject,
      htmlContent: html
    });

    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data)
      }
    };

    console.log(`[Email System] Brevo API Request for: ${recipient}`);
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[Email System] Success! Sent via Brevo to: ${recipient}`);
          resolve(true);
        } else {
          console.error(`[Email System] Brevo API Error (${res.statusCode}): ${responseData}`);
          console.error(`[Email System] Recipient Attempted: ${recipient}`);
          console.warn('[Email System] HINT: Ensure the SENDER_EMAIL is verified in Brevo dashboard.');
          resolve(false);
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
