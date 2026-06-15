import nodemailer from 'nodemailer';
import { env } from './env';

// SMTP transport (e.g. Zoho). secure=true → port 465 (SSL); false → 587 (STARTTLS).
export const isMailConfigured = Boolean(env.smtpHost && env.smtpUser);

export const mailer = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
});

/** Optional startup check — logs whether the SMTP credentials work. */
export async function verifyMailer(): Promise<void> {
  if (!isMailConfigured) {
    console.warn('[mail] SMTP not configured — contact emails are disabled');
    return;
  }
  try {
    await mailer.verify();
    console.log('[mail] SMTP connection OK');
  } catch (err) {
    console.error('[mail] SMTP verification failed:', err);
  }
}
