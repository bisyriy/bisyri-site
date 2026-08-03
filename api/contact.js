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

function categorize(text) {
  const t = text.toLowerCase();
  if (/aeo|answer engine|ai overview|perplexity|chatgpt.*search|cited by ai|schema markup|structured data/.test(t)) return 'aeo';
  if (/\bai\b|automation|automat|chatbot|workflow|zapier|make\.com|n8n|openai|llm|gpt/.test(t)) return 'automation';
  if (/\bseo\b|search engine|rank|ranking|keyword|organic|backlink|on.?page|off.?page/.test(t)) return 'seo';
  if (/website|web design|redesign|landing page|portfolio|e.?commerce|webshop|speed|responsive/.test(t)) return 'web';
  return 'general';
}

const CATEGORY_LABELS = {
  aeo:        'AEO / AI Search',
  seo:        'SEO',
  automation: 'AI Automation',
  web:        'Web Design',
  general:    'General Inquiry',
};

const AUTO_REPLIES = {
  aeo: {
    subject: "Got your message — let's get you cited by AI",
    intro:   "AEO is exactly what I focus on. I'll review your site's current AI-search visibility and come back to you with specific steps we can take.",
    tip:     'In the meantime, my guide on <a href="https://bisyri.co/blog/what-is-aeo-2026.html" style="color:#4F46E5">What Is AEO and Why It Matters in 2026</a> covers the five main levers — might be useful context before we talk.',
  },
  seo: {
    subject: "Got your message — SEO audit incoming",
    intro:   "SEO is at the core of everything I do. I'll take a look at what you've shared and come back with a clear picture of where the biggest gains are.",
    tip:     "I'll also flag any quick AEO wins while I'm in there — AI search and traditional SEO overlap more than most people realise.",
  },
  automation: {
    subject: "Got your message — let's map out your automation",
    intro:   "AI automation is one of my favourite problems to solve. I'll review what you've described and come back with a realistic scope and approach.",
    tip:     "If you haven't already, jot down any tools you're currently using (Zapier, Make, n8n, custom APIs) — the more context, the better.",
  },
  web: {
    subject: "Got your message — looking at your project now",
    intro:   "Web design is where everything starts for me. I'll review your brief and come back with thoughts on scope, timeline, and what's possible.",
    tip:     "If you have reference sites you like (or hate), send them over — they're always helpful when scoping a project.",
  },
  general: {
    subject: "Got your message",
    intro:   "I've received your message and I'll get back to you soon — usually within 24 hours.",
    tip:     'You can browse my <a href="https://bisyri.co/#services" style="color:#4F46E5">services</a> or read the <a href="https://bisyri.co/blog/" style="color:#4F46E5">blog</a> for a feel for how I work.',
  },
};

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildAutoReply(name, category) {
  const r = AUTO_REPLIES[category] || AUTO_REPLIES.general;
  const tipText = r.tip.replace(/<[^>]+>/g, '');
  return {
    subject: r.subject,
    html: `<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#15171C;padding:24px 0">
  <div style="border-left:3px solid #4F46E5;padding:2px 0 2px 14px;margin-bottom:28px">
    <p style="margin:0;font-size:13px;color:#5B6270;font-weight:500;letter-spacing:.04em;text-transform:uppercase">From Bisyri</p>
  </div>
  <p style="font-size:16px;line-height:1.65;margin:0 0 16px">Hi ${escHtml(name)},</p>
  <p style="font-size:16px;line-height:1.65;margin:0 0 16px">${r.intro}</p>
  <p style="font-size:16px;line-height:1.65;margin:0 0 28px">${r.tip}</p>
  <p style="font-size:16px;line-height:1.65;margin:0 0 28px">Talk soon,<br><strong>Bisyri</strong></p>
  <hr style="border:0;border-top:1px solid #DDE0E7;margin:0 0 20px">
  <p style="font-size:12px;color:#5B6270;margin:0">You're receiving this because you submitted the contact form at <a href="https://bisyri.co" style="color:#4F46E5;text-decoration:none">bisyri.co</a>.</p>
</div>`,
    text: `Hi ${name},\n\n${r.intro}\n\n${tipText}\n\nTalk soon,\nBisyri`,
  };
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
    return res.status(429).json({ error: 'Too many messages sent. Please try again later.' });
  }

  const { name, email, message, company } = req.body || {};

  if (company) return res.status(200).json({ ok: true });

  if (!name || !email || !message || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please fill in your name, a valid email, and a message.' });
  }

  const category = categorize(message);
  const label = CATEGORY_LABELS[category];
  const reply = buildAutoReply(name, category);

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await Promise.all([
      resend.emails.send({
        from: 'Bisyri Site <onboarding@resend.dev>',
        to: TO_EMAIL,
        replyTo: email,
        subject: `[${label}] New inquiry from ${name}`,
        text: `Category: ${label}\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
      resend.emails.send({
        from: 'Bisyri <onboarding@resend.dev>',
        to: email,
        subject: reply.subject,
        html: reply.html,
        text: reply.text,
      }),
    ]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(502).json({ error: 'Could not send the message. Please try again later.' });
  }
};
