import mongoose, { Document } from 'mongoose';

export const UserSchema = new mongoose.Schema({
  user_address: { type: String, required: true },

  point: { type: Number, required: true },

  ip: { type: String, required: true },

  nickname: { type: String, required: true },

  user_tree_belong: { type: [mongoose.Types.ObjectId], ref: 'user' },

  user_tree_commissions: { type: [mongoose.Types.ObjectId], ref: 'user' },

  ref: { type: String, required: true },

  leaderboard: {
    round_played: { type: Number, required: true, default: 0 },

    round_winning: { type: Number, required: true, default: 0 },

    net_winnings: { type: Number, required: true, default: 0 },

    win_rate: { type: Number, required: true, default: 0 },

    total_amount: { type: Number, required: true, default: 0 },
  },
  type: { type: String, required: true, default: 'Normal' },
});

export interface IUser extends Document {
  user_address: string;

  point: number;

  ip: string;

  nickname: string;

  user_tree_belong: string[];

  user_tree_commissions: string[];

  ref: string;

  leaderboard: {
    round_played: number;

    round_winning: number;

    net_winnings: number;

    win_rate: number;

    total_amount: number;
  };
  type: string;
}
