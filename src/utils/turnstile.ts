import { env } from '../config/env';

export const isTurnstileEnabled = Boolean(env.turnstileSecret);

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verifies a Cloudflare Turnstile token. Returns true when Turnstile is
 * disabled (no secret configured), so the contact form keeps working without
 * a CAPTCHA until keys are added.
 */
export async function verifyTurnstile(
  token: string | undefined,
  ip?: string
): Promise<boolean> {
  if (!env.turnstileSecret) return true;
  if (!token) return false;

  try {
    const body = new URLSearchParams({
      secret: env.turnstileSecret,
      response: token,
    });
    if (ip) body.append('remoteip', ip);

    const res = await fetch(VERIFY_URL, { method: 'POST', body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
