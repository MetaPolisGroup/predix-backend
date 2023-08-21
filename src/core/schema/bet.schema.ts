import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Market } from 'src/core/entity/market.entity';
import { Prediction } from 'src/core/entity/prediction.enity';

@Schema()
export class BetMongo extends Document {
  @Prop({ required: true })
  epoch: number;

  @Prop({ required: true })
  position: Position;

  @Prop({ required: true })
  user_address: string;

  @Prop({ required: true })
  claimed: boolean;

  @Prop({ required: true })
  refund: number;

  @Prop({ required: true })
  winning_amount: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  claimed_amount: number;

  @Prop({ required: true })
  status: BetStatus;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'prediction' }] })
  round: Prediction | Market;
}

export const BetSchema = SchemaFactory.createForClass(BetMongo);

export type BetStatus = 'Win' | 'Winning Refund' | 'Lose' | 'Losing Refund' | 'Refund' | 'Waiting' | 'Live';

export type Position = 'UP' | 'DOWN';
