import mongoose, { Document } from 'mongoose';
import { Prediction } from 'src/core/entity/prediction.enity';

export const BetSchema = new mongoose.Schema({
  epoch: { type: Number, require: true },

  position: { type: String, require: true },

  user_address: { type: String, require: true },

  claimed: { type: Boolean, require: true },

  refund: { type: Number, require: true },

  winning_amount: { type: Number, require: true },

  amount: { type: Number, require: true },

  claimed_amount: { type: Number, require: true },

  status: { type: String, require: true },

  prediction: {
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
  },

  round: { type: Number, require: true },
});

export interface IBet extends Document {
  epoch: number;

  position: Position;

  user_address: string;

  claimed: boolean;

  refund: number;

  winning_amount: number;

  amount: number;

  claimed_amount: number;

  status: BetStatus;

  prediction: Prediction;

  round: number;
}

export type BetStatus = 'Win' | 'Winning Refund' | 'Lose' | 'Losing Refund' | 'Refund' | 'Waiting' | 'Live';

export type Position = 'UP' | 'DOWN';
