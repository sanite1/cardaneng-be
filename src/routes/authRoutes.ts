import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { loginLimiter } from '../middleware/rateLimit';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

function signToken(user: {
  _id: unknown;
  username: string;
  role: string;
}): string {
  return jwt.sign(
    { sub: String(user._id), username: user.username, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpires as jwt.SignOptions['expiresIn'] }
  );
}

/** Authenticate against the Users collection (bcrypt) and return a JWT. */
router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const username = String(req.body?.username ?? '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password ?? '');

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.get('passwordHash')))) {
      res.status(401).json({ error: 'Incorrect username or password' });
      return;
    }

    res.json({
      token: signToken(user as never),
      user: { id: String(user._id), username: user.get('username') },
    });
  })
);

/** Current admin from the token — lets the frontend validate the session. */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await User.findById(req.user?.sub);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  })
);

/** Change the signed-in admin's password (verifies the current one first). */
router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const currentPassword = String(req.body?.currentPassword ?? '');
    const newPassword = String(req.body?.newPassword ?? '');

    if (newPassword.length < 8) {
      res
        .status(400)
        .json({ error: 'New password must be at least 8 characters' });
      return;
    }

    const user = await User.findById(req.user?.sub);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (!(await bcrypt.compare(currentPassword, user.get('passwordHash')))) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    user.set('passwordHash', await bcrypt.hash(newPassword, 10));
    await user.save();
    res.json({ ok: true });
  })
);

export default router;
