import mongoose, { Document } from 'mongoose';

export const PreferencesSchema = new mongoose.Schema({
  fee: { type: Number, required: false },

  interval_seconds: { type: Number, required: false },

  buffer_seconds: { type: Number, required: false },

  genesis_start: { type: Boolean, required: false },

  genesis_lock: { type: Boolean, required: false },

  paused: { type: Boolean, required: false },
});

export interface IPreferences extends Document {
  fee: number;

  interval_seconds: number;

  buffer_seconds: number;

  genesis_start: boolean;

  genesis_lock: boolean;

  paused: boolean;
}
