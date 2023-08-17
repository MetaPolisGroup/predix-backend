import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { LeaderBoardUser } from './user.schema';
import { LeaderBoardType } from 'src/configuration/type';

@Schema()
export class LeaderboardMongo extends Document {
  @Prop({ required: true, type: [Object] })
  leaderboard: {
    round_played: number;

    round_winning: number;

    net_winnings: number;

    win_rate: number;

    total_amount: number;
  }[];

  @Prop({ required: true })
  type: LeaderBoardType;

  @Prop({ required: true })
  updated_at: number;
}

export const LeaderboardSchema = SchemaFactory.createForClass(LeaderboardMongo);

export class LeaderboardDetails {
  leaderboard: LeaderBoardUser;

  user_id: string;

  nickname: string;
}
