const { Resend } = require('resend');

const TO_EMAIL = 'bisyriy@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT = 5;
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

function row(label, value) {
  if (!value) return '';
  return `<tr><td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;color:#5B6270;font-size:13px;vertical-align:top;white-space:nowrap">${escHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;color:#15171C;font-size:13px;line-height:1.5">${escHtml(value).replace(/\n/g, '<br>')}</td></tr>`;
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
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
  }

  const { name, email, business, plan, website, what, customers, goals, style, notes, company } = req.body || {};

  if (company) return res.status(200).json({ ok: true });

  if (!name || !email || !business || !what || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please fill in your name, email, business name, and what your business does.' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await Promise.all([
      resend.emails.send({
        from: 'Bisyri Site <onboarding@resend.dev>',
        to: TO_EMAIL,
        replyTo: email,
        subject: `[Onboarding] ${business} — ${plan || 'plan not specified'}`,
        html: `<div style="font-family:Inter,system-ui,sans-serif;max-width:640px;margin:0 auto">
  <h2 style="font-size:18px;margin:0 0 16px">New onboarding submission</h2>
  <table style="width:100%;border-collapse:collapse">
    ${row('Name', name)}
    ${row('Email', email)}
    ${row('Business', business)}
    ${row('Package', plan)}
    ${row('Current website', website)}
    ${row('What they do', what)}
    ${row('Customers', customers)}
    ${row('Goals', goals)}
    ${row('Style / references', style)}
    ${row('Notes', notes)}
  </table>
</div>`,
        text: `Name: ${name}\nEmail: ${email}\nBusiness: ${business}\nPackage: ${plan || ''}\nWebsite: ${website || ''}\n\nWhat they do:\n${what}\n\nCustomers:\n${customers || ''}\n\nGoals:\n${goals || ''}\n\nStyle/references:\n${style || ''}\n\nNotes:\n${notes || ''}`,
      }),
      resend.emails.send({
        from: 'Bisyri <onboarding@resend.dev>',
        to: email,
        subject: 'Got your onboarding details — here\'s what happens next',
        html: `<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#15171C;padding:24px 0">
  <div style="border-left:3px solid #4F46E5;padding:2px 0 2px 14px;margin-bottom:28px">
    <p style="margin:0;font-size:13px;color:#5B6270;font-weight:500;letter-spacing:.04em;text-transform:uppercase">From Bisyri</p>
  </div>
  <p style="font-size:16px;line-height:1.65;margin:0 0 16px">Hi ${escHtml(name)},</p>
  <p style="font-size:16px;line-height:1.65;margin:0 0 16px">Got everything for ${escHtml(business)} — thank you. I'll review it and confirm your start date within 1–2 business days.</p>
  <p style="font-size:16px;line-height:1.65;margin:0 0 16px">If you have a logo, photos, or brand assets, just reply to this email with them attached — no need to fill anything out again.</p>
  <p style="font-size:16px;line-height:1.65;margin:0 0 28px">Talk soon,<br><strong>Bisyri</strong></p>
  <hr style="border:0;border-top:1px solid #DDE0E7;margin:0 0 20px">
  <p style="font-size:12px;color:#5B6270;margin:0">You're receiving this because you submitted the onboarding form at <a href="https://bisyri.co" style="color:#4F46E5;text-decoration:none">bisyri.co</a>.</p>
</div>`,
        text: `Hi ${name},\n\nGot everything for ${business} — thank you. I'll review it and confirm your start date within 1-2 business days.\n\nIf you have a logo, photos, or brand assets, just reply to this email with them attached.\n\nTalk soon,\nBisyri`,
      }),
    ]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(502).json({ error: 'Could not submit the form. Please try again later.' });
  }
};
