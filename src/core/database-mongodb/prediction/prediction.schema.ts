import mongoose, { Document } from 'mongoose';

export const PredictionSchema = new mongoose.Schema({
  epoch: { type: Number, required: true },

  startTimestamp: { type: Number, required: true },

  lockTimestamp: { type: Number, required: true },

  closeTimestamp: { type: Number, required: true },

  lockOracleId: { type: Number, required: true },

  closeOracleId: { type: Number, required: true },

  lockPrice: { type: Number, required: true },

  cancel: { type: Boolean, required: true },

  closePrice: { type: Number, required: true },

  totalAmount: { type: Number, required: true },

  bullAmount: { type: Number, required: true },

  bearAmount: { type: Number, required: true },

  closed: { type: Boolean, required: true },

  locked: { type: Boolean, required: true },

  delele: { type: Boolean, required: true },
});

export interface IPrediction extends Document {
  epoch: number;

  startTimestamp: number;

  lockTimestamp: number;

  closeTimestamp: number;

  lockOracleId: number;

  closeOracleId: number;

  lockPrice: number;

  cancel: boolean;

  closePrice: number;

  totalAmount: number;

  bullAmount: number;

  bearAmount: number;

  closed: boolean;

  locked: boolean;

  delele: boolean;
}
