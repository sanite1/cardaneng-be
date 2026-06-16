import mongoose from 'mongoose';
import { env } from './env';

// Cache the connection so it is reused across serverless invocations (and is a
// no-op when the persistent server has already connected).
let connectPromise: Promise<typeof mongoose> | null = null;

export async function connectDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) return; // already connected
  if (!connectPromise) {
    mongoose.set('strictQuery', true);
    connectPromise = mongoose.connect(env.mongoUri);
  }
  await connectPromise;
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  connectPromise = null;
}
