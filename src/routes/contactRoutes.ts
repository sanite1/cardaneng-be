import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Message } from '../models/Message';
import { mailer, isMailConfigured } from '../config/mailer';
import { contactLimiter } from '../middleware/rateLimit';
import { verifyTurnstile } from '../utils/turnstile';
import { env } from '../config/env';

const router = Router();

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * POST /api/contact — public contact form endpoint.
 * 1. Persists the message (safety net).
 * 2. Emails the company with the enquiry (reply-to the sender).
 * 3. Emails the sender a confirmation that we received it.
 */
router.post(
  '/',
  contactLimiter,
  asyncHandler(async (req, res) => {
    // Honeypot: a hidden field real users never fill. If it has a value, it's a
    // bot — pretend success so the bot doesn't learn it was blocked.
    if (String(req.body?.website ?? '').trim() !== '') {
      res.status(200).json({ ok: true });
      return;
    }

    // CAPTCHA (only enforced when TURNSTILE_SECRET is configured).
    const ip =
      (req.headers['cf-connecting-ip'] as string) ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip;
    const human = await verifyTurnstile(req.body?.turnstileToken, ip);
    if (!human) {
      res.status(400).json({ error: 'Verification failed. Please try again.' });
      return;
    }

    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim();
    const subject = String(req.body?.subject ?? '').trim() || 'Website enquiry';
    const message = String(req.body?.message ?? '').trim();

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email and message are required' });
      return;
    }
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address' });
      return;
    }

    // Persist first so the enquiry survives even if email sending fails.
    await Message.create({ name, email, subject, message });

    if (isMailConfigured) {
      const safeMsg = escapeHtml(message).replace(/\n/g, '<br>');

      // 1) Notify the company.
      await mailer.sendMail({
        from: env.mailFrom,
        to: env.contactRecipient,
        replyTo: `${name} <${email}>`,
        subject: `[Website] ${subject}`,
        text: `New enquiry from ${name} <${email}>\n\nSubject: ${subject}\n\n${message}`,
        html: `
          <h2>New website enquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}<br>
             <strong>Email:</strong> ${escapeHtml(email)}<br>
             <strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <p>${safeMsg}</p>`,
      });

      // 2) Confirmation to the sender.
      await mailer.sendMail({
        from: env.mailFrom,
        to: email,
        subject: `We've received your message — ${env.companyName}`,
        text: `Hi ${name},\n\nThank you for contacting ${env.companyName}. We have received your message and a member of our team will get back to you shortly.\n\nYour message:\n${message}\n\n— ${env.companyName}`,
        html: `
          <p>Hi ${escapeHtml(name)},</p>
          <p>Thank you for contacting <strong>${escapeHtml(
            env.companyName
          )}</strong>. We have received your message and a member of our team will get back to you shortly.</p>
          <p style="color:#555"><em>Your message:</em><br>${safeMsg}</p>
          <p>— ${escapeHtml(env.companyName)}</p>`,
      });
    }

    res.status(201).json({ ok: true, delivered: isMailConfigured });
  })
);

export default router;
