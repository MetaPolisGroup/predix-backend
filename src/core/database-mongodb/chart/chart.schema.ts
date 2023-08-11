import mongoose, { Document } from 'mongoose';

export const ChartSchema = new mongoose.Schema({
  price: { type: Number, required: true },

  created_at: { type: Number, required: true },

  delete: { type: Boolean, required: true },
});

export interface IChart extends Document {
  price: number;

  created_at: number;

  delete: boolean;
}
