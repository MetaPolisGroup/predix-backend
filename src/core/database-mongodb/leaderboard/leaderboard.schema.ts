import mongoose, { Document } from 'mongoose';

export const leaderboardSchema = new mongoose.Schema({
  user_list: [
    {
      round_played: { type: Number, required: true, default: 0 },

      round_winning: { type: Number, required: true, default: 0 },

      net_winnings: { type: Number, required: true, default: 0 },

      win_rate: { type: Number, required: true, default: 0 },

      total_amount: { type: Number, required: true, default: 0 },

      user_id: { type: mongoose.Types.ObjectId, ref: 'user' },

      nickname: { type: String, required: true },
    },
  ],

  type: { type: String, required: true },
});

export interface ILeaderboard extends Document {
  user_list: [
    {
      round_played: number;

      round_winning: number;

      net_winnings: number;

      win_rate: number;

      total_amount: number;

      user_id: mongoose.Types.ObjectId;

      nickname: string;
    },
  ];

  type: string;
}
