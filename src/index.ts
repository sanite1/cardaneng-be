import { createApp } from './app';
import { connectDb } from './config/db';
import { verifyMailer } from './config/mailer';
import { bootstrapAdmin } from './config/bootstrapAdmin';
import { env } from './config/env';

async function main() {
  await connectDb();
  await bootstrapAdmin();
  await verifyMailer();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
