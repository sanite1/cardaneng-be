import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from './env';

/**
 * Ensures at least one admin exists. On a fresh database it seeds one from
 * ADMIN_USER / ADMIN_PASS (hashed). Once a user exists this is a no-op, so the
 * env credentials are only ever the initial bootstrap — change the password via
 * POST /api/auth/change-password afterwards.
 */
export async function bootstrapAdmin(): Promise<void> {
  const count = await User.countDocuments();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash(env.adminPass, 10);
  await User.create({
    username: env.adminUser.toLowerCase(),
    passwordHash,
    role: 'admin',
  });
  console.log(`[auth] seeded initial admin "${env.adminUser}" from env`);
}
