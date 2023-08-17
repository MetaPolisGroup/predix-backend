import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class UserMongo extends Document {
  @Prop({ required: true })
  user_address: string;

  @Prop({ required: true })
  point: number;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true, type: Object })
  leaderboard: {
    round_played: number;

    round_winning: number;

    net_winnings: number;

    win_rate: number;

    total_amount: number;
  };

  @Prop({ required: true })
  user_tree_belong: string[];

  @Prop({ required: true })
  user_tree_commissions?: string[];

  @Prop({ required: true })
  type: UserType;

  @Prop({ required: true })
  ref: string;
}

export const UserSchema = SchemaFactory.createForClass(UserMongo);

export interface IUserToken {
  nickname: string;
  id: string;
}

export type UserType = 'Admin' | 'Normal';

@Schema()
export class LeaderBoardUser {
  @Prop()
  round_played: number;

  @Prop()
  round_winning: number;

  @Prop()
  net_winnings: number;

  @Prop()
  win_rate: number;

  @Prop()
  total_amount: number;
}
