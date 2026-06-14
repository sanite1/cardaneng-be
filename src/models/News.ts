import { Schema, model } from 'mongoose';
import { baseToJSON } from './serialize';

const newsSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: '' },
    body: { type: String, default: '' },
    image: { type: String, default: '' },
    date: { type: String, default: '' }, // ISO date (YYYY-MM-DD)
    published: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: baseToJSON }
);

export const News = model('News', newsSchema);
