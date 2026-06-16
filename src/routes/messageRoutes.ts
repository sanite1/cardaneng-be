import { Router } from 'express';
import { crudController } from '../controllers/crudController';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { Message } from '../models/Message';
import { mailer, isMailConfigured } from '../config/mailer';
import { env } from '../config/env';

// Contact-form messages are private, so every route here requires admin auth.
// Creation happens via the public POST /api/contact, not here.
const c = crudController(Message);
const router = Router();

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

router.get('/', requireAuth, c.list);
router.get('/:id', requireAuth, c.get);
router.put('/:id', requireAuth, c.update); // e.g. mark handled
router.delete('/:id', requireAuth, c.remove);

/**
 * POST /api/messages/:id/reply — email a reply to the original sender from the
 * company address, record it, and mark the message handled.
 */
router.post(
  '/:id/reply',
  requireAuth,
  asyncHandler(async (req, res) => {
    const reply = String(req.body?.reply ?? '').trim();
    if (!reply) {
      res.status(400).json({ error: 'Reply message is required' });
      return;
    }
    if (!isMailConfigured) {
      res.status(503).json({ error: 'Email is not configured on the server' });
      return;
    }

    const msg = await Message.findById(req.params.id);
    if (!msg) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    const name = String(msg.get('name'));
    const to = String(msg.get('email'));
    const subject = String(msg.get('subject')) || 'Your enquiry';
    const original = String(msg.get('message'));
    const safeReply = escapeHtml(reply).replace(/\n/g, '<br>');
    const safeOriginal = escapeHtml(original).replace(/\n/g, '<br>');

    await mailer.sendMail({
      from: env.mailFrom,
      to,
      replyTo: env.contactRecipient,
      subject: `Re: ${subject}`,
      text: `Hi ${name},\n\n${reply}\n\n${env.companyName}\n\n----------\nYour original message:\n${original}`,
      html: `
        <p>Hi ${escapeHtml(name)},</p>
        <p>${safeReply}</p>
        <p>${escapeHtml(env.companyName)}</p>
        <hr>
        <p style="color:#888;font-size:13px"><em>Your original message:</em><br>${safeOriginal}</p>`,
    });

    msg.set('reply', reply);
    msg.set('handled', true);
    await msg.save();
    res.json(msg);
  })
);

export default router;
