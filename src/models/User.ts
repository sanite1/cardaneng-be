import { Schema, model } from 'mongoose';

// Admin user. Passwords are never stored in plain text — only the bcrypt hash,
// which is also stripped from any JSON response.
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin' },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.passwordHash;
        if (ret.createdAt instanceof Date)
          ret.createdAt = ret.createdAt.getTime();
        if (ret.updatedAt instanceof Date)
          ret.updatedAt = ret.updatedAt.getTime();
        return ret;
      },
    },
  }
);

export const User = model('User', userSchema);
