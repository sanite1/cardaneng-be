import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthedRequest extends Request {
  user?: { sub: string; username?: string; role?: string };
}

/** Rejects requests without a valid `Authorization: Bearer <jwt>` header. */
export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    req.user = jwt.verify(header.slice(7), env.jwtSecret) as {
      sub: string;
      role?: string;
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
