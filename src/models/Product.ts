import { Schema, model } from 'mongoose';
import { baseToJSON } from './serialize';

export const BRANDS = ['Alfanar', 'Transdelta', 'Others'] as const;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, enum: BRANDS, default: 'Others' },
    image: { type: String, default: '' },
  },
  { timestamps: true, toJSON: baseToJSON }
);

export const Product = model('Product', productSchema);
