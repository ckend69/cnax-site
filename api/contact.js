// api/contact.js — handles contact form submissions, forwards to team emails via Resend

const TEAM_EMAILS = ['collin@cnax.ai', 'nate@cnax.ai', 'alex@cnax.ai'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY' });
  }

  const { name, email, phone, service, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">New CNAX AI Contact Form Submission</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; font-weight: bold; width: 120px;">Name</td><td style="padding: 8px;">${escapeHtml(name)}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;">${escapeHtml(phone || 'Not provided')}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding: 8px; font-weight: bold;">Service</td><td style="padding: 8px;">${escapeHtml(service || 'Not specified')}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Message</td><td style="padding: 8px; white-space: pre-wrap;">${escapeHtml(message)}</td></tr>
      </table>
      <p style="margin-top: 24px; color: #888; font-size: 13px;">Sent from the CNAX AI contact form at cnax.ai</p>
    </div>
  `;

  try {
    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CNAX AI Contact <noreply@cnax.ai>',
        to: TEAM_EMAILS,
        reply_to: email,
        subject: `New inquiry from ${name}`,
        html,
      }),
    });

    if (!sendRes.ok) {
      const err = await sendRes.text();
      throw new Error(`Resend error ${sendRes.status}: ${err}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('contact error:', err);
    return res.status(500).json({ error: err.message });
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
