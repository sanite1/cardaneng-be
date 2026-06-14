import { Schema, model } from 'mongoose';
import { baseToJSON } from './serialize';

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    client: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
  },
  { timestamps: true, toJSON: baseToJSON }
);

export const Project = model('Project', projectSchema);
