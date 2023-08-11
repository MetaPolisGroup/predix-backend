import mongoose, { Document } from 'mongoose';

export const ChainLinkSchema = new mongoose.Schema({
  price: { type: Number, requered: true },

  updated_at: { type: Number, requered: true },
});

export interface IChainlink extends Document {
  price: number;

  updated_at: number;
}
