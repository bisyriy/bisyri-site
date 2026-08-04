const { Resend } = require('resend');
const https = require('https');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Add subscriber to Kit (ConvertKit) form
function addToKit(email) {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  const formId = process.env.CONVERTKIT_FORM_ID;
  if (!apiKey || !formId) return Promise.resolve();
  const body = JSON.stringify({ api_key: apiKey, email });
  return new Promise((resolve) => {
    const req = https.request(
      { hostname: 'api.convertkit.com', path: `/v3/forms/${formId}/subscribe`, method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) } },
      (r) => { r.resume(); resolve(); }
    );
    req.on('error', () => resolve());
    req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Email service is not configured yet.' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many sign-ups from this IP. Please try again later.' });
  }

  const { email, website, source } = req.body || {};

  // Honeypot — silent reject
  if (website) return res.status(200).json({ success: true });

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const safeSource = escHtml(source || 'unknown');

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await Promise.all([
      // Add to Kit list (no-op if env vars not set)
      addToKit(email.trim()),

      // Welcome email to subscriber
      resend.emails.send({
        from: 'Bisyri <hello@bisyri.co>',
        to: email.trim(),
        subject: 'Your Website Revenue Toolkit is here',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Inter, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111827; background: #fff;">
  <div style="margin-bottom: 32px;">
    <strong style="font-size: 18px; color: #4F46E5;">Bisyri</strong>
  </div>
  <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 16px;">Here's your Website Revenue Toolkit.</h1>
  <p style="color: #4B5563; line-height: 1.6; margin: 0 0 24px;">Thanks for signing up. Below are the tools and resources that help you turn your website into something that actually makes you money.</p>

  <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 0 0 16px;">
    <strong style="display: block; margin-bottom: 8px;">1. Website ROI Calculator</strong>
    <p style="color: #4B5563; margin: 0 0 12px; font-size: 14px;">Enter your visitors, conversion rate, and average client value. See exactly what your website currently earns — and how much more it could.</p>
    <a href="https://bisyri.co/tools/website-roi-calculator/" style="color: #4F46E5; font-weight: 600; text-decoration: none;">Calculate your ROI →</a>
  </div>

  <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 0 0 16px;">
    <strong style="display: block; margin-bottom: 8px;">2. Google Ads vs. SEO Calculator</strong>
    <p style="color: #4B5563; margin: 0 0 12px; font-size: 14px;">See exactly when SEO investment breaks even against ongoing ad spend — month by month. Stop renting traffic when you could own it.</p>
    <a href="https://bisyri.co/tools/ads-vs-seo-calculator/" style="color: #4F46E5; font-weight: 600; text-decoration: none;">Calculate break-even →</a>
  </div>

  <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 0 0 16px;">
    <strong style="display: block; margin-bottom: 8px;">3. Website Priority Finder</strong>
    <p style="color: #4B5563; margin: 0 0 12px; font-size: 14px;">Score 8 areas of your website. Get a ranked list of the 3 highest-impact improvements — stop guessing, start fixing what moves the needle.</p>
    <a href="https://bisyri.co/tools/website-priority-finder/" style="color: #4F46E5; font-weight: 600; text-decoration: none;">Find my priorities →</a>
  </div>

  <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
    <strong style="display: block; margin-bottom: 8px;">4. Should I Redesign My Website?</strong>
    <p style="color: #4B5563; margin: 0 0 12px; font-size: 14px;">8 yes/no questions. Scored recommendation: keep it, fix issues, or invest in a redesign. Takes 2 minutes.</p>
    <a href="https://bisyri.co/tools/website-redesign-quiz/" style="color: #4F46E5; font-weight: 600; text-decoration: none;">Take the quiz →</a>
  </div>

  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
  <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">I send occasional emails with practical advice on growing your business online — no fluff, no daily newsletters. You can unsubscribe any time by replying "unsubscribe."</p>
  <p style="color: #6B7280; font-size: 14px;">— Bisyri<br><a href="https://bisyri.co" style="color: #4F46E5;">bisyri.co</a></p>
</body>
</html>`,
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(502).json({ error: 'Could not send the email. Please try again later.' });
  }
};
