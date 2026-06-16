// Vercel serverless entrypoint. Vercel turns files in /api into functions, so
// we export the Express app as the handler (no app.listen). All requests are
// routed here via vercel.json. The local/Render server still uses src/index.ts.
import { createApp } from '../src/app';
import { connectDb } from '../src/config/db';
import { bootstrapAdmin } from '../src/config/bootstrapAdmin';

const app = createApp();

// Best-effort warm-up on cold start; per-request middleware also ensures the
// connection, so requests are safe even before this resolves.
connectDb()
  .then(() => bootstrapAdmin())
  .catch((err) => console.error('[init] startup error:', err));

export default app;
