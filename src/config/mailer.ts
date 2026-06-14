import nodemailer from 'nodemailer';
import { env } from './env';

export const isMailConfigured = Boolean(env.smtpHost && env.smtpUser);

export const mailer = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure, // true for port 465, false for 587/STARTTLS
  auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
});

/** Optional startup check — logs whether SMTP credentials work. */
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
