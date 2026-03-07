// api/lead.js — handles lead magnet email capture for the AI Readiness Guide

import nodemailer from 'nodemailer';

const TEAM_EMAILS = ['collin@cnax.ai', 'nate@cnax.ai', 'alex@cnax.ai'];
const GUIDE_URL = 'https://cnax.ai/ai-readiness-guide.html';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    return res.status(500).json({ error: 'Missing GMAIL_USER or GMAIL_PASS env vars' });
  }

  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  // Email to the visitor — delivers the guide link
  const visitorHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a1a; color: #f1f5f9; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 12px; line-height: 48px; text-align: center; font-size: 20px; font-weight: 900; color: white; font-family: sans-serif;">CX</div>
        <div style="margin-top: 12px; font-size: 20px; font-weight: 700; color: #f1f5f9;">CNAX <span style="color: #6366f1;">AI</span></div>
      </div>
      <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px; color: #f1f5f9;">Hey ${escapeHtml(name)}, your guide is ready.</h1>
      <p style="color: #94a3b8; font-size: 16px; margin: 0 0 28px; line-height: 1.7;">Thanks for downloading the <strong style="color: #f1f5f9;">Small Business AI Readiness Guide</strong>. Click the button below to access your copy — and save it as a PDF directly from the guide page.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${GUIDE_URL}" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; font-size: 16px; font-weight: 700; border-radius: 12px; text-decoration: none;">Access Your Free Guide →</a>
      </div>
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 20px; margin: 24px 0;">
        <p style="font-size: 13px; font-weight: 600; color: #94a3b8; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.1em;">What's inside:</p>
        <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 14px; line-height: 2;">
          <li>The 5-Pillar AI Readiness Assessment</li>
          <li>How to score your business's AI readiness</li>
          <li>The 3 best first AI projects for small businesses</li>
          <li>Common AI mistakes and how to avoid them</li>
          <li>Recommended next steps for your situation</li>
        </ul>
      </div>
      <p style="color: #64748b; font-size: 13px; margin-top: 28px;">Want a free 30-minute AI audit with our team? Reply to this email or visit <a href="https://cnax.ai#contact" style="color: #6366f1;">cnax.ai</a>.</p>
      <p style="color: #475569; font-size: 12px; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">© 2026 CNAX AI · cnax.ai · You're receiving this because you requested our free guide.</p>
    </div>
  `;

  // Email to the team — lead notification
  const teamHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">New Lead Magnet Download</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; font-weight: bold; width: 80px;">Name</td><td style="padding: 8px;">${escapeHtml(name)}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Guide</td><td style="padding: 8px;">Small Business AI Readiness Guide</td></tr>
      </table>
      <p style="margin-top: 16px; color: #888; font-size: 13px;">Downloaded from cnax.ai · ${new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' })} MST</p>
    </div>
  `;

  try {
    // Send both emails concurrently
    await Promise.all([
      transporter.sendMail({
        from: `"CNAX AI" <${gmailUser}>`,
        to: email,
        replyTo: 'collin@cnax.ai',
        subject: `Your Free AI Readiness Guide — CNAX AI`,
        html: visitorHtml,
      }),
      transporter.sendMail({
        from: `"CNAX AI Leads" <${gmailUser}>`,
        to: TEAM_EMAILS.join(', '),
        replyTo: email,
        subject: `New Lead: ${name} downloaded the AI Readiness Guide`,
        html: teamHtml,
      }),
    ]);

    return res.status(200).json({ success: true, guideUrl: GUIDE_URL });
  } catch (err) {
    console.error('lead capture error:', err);
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
