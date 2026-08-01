const { Resend } = require('resend');

const TO_EMAIL = 'bisyriy@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Email service is not configured yet.' });
  }

  const { name, email, message, company } = req.body || {};

  // honeypot: bots fill hidden fields, humans never see them
  if (company) return res.status(200).json({ ok: true });

  if (!name || !email || !message || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please fill in your name, a valid email, and a message.' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Bisyri Site <onboarding@resend.dev>',
      to: TO_EMAIL,
      replyTo: email,
      subject: `New inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(502).json({ error: 'Could not send the message. Please try again later.' });
  }
};
