import { Schema, model } from 'mongoose';
import { baseToJSON } from './serialize';

// Persisted copy of every contact-form submission — a safety net so enquiries
// are never lost even if email delivery fails. `handled` lets an admin mark a
// message as dealt with later.
const messageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: baseToJSON }
);

export const Message = model('Message', messageSchema);
