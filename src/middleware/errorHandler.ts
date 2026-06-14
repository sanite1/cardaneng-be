import type { Request, Response, NextFunction } from 'express';

/** Central error handler. Maps common Mongoose errors to 400s, everything else
 *  to 500. Must keep all four args for Express to treat it as error middleware. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const e = err as { name?: string; message?: string };
  console.error('[error]', e?.name, e?.message);

  if (e?.name === 'ValidationError') {
    res.status(400).json({ error: e.message });
    return;
  }
  if (e?.name === 'CastError') {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
}
