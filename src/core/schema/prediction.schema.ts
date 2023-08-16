import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class PredictionMongo extends Document {
  @Prop({ required: true })
  epoch: number;

  @Prop({ required: true })
  startTimestamp: number;

  @Prop({ required: true })
  lockTimestamp: number;

  @Prop({ required: true })
  closeTimestamp: number;

  @Prop({ required: true })
  lockOracleId: number;

  @Prop({ required: true })
  closeOracleId: number;

  @Prop({ required: true })
  lockPrice: number;

  @Prop({ required: true })
  cancel: boolean;

  @Prop({ required: true })
  closePrice: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  bullAmount: number;

  @Prop({ required: true })
  bearAmount: number;

  @Prop({ required: true })
  closed: boolean;

  @Prop({ required: true })
  locked: boolean;

  @Prop({ required: true })
  delele: boolean;
}

export const PredictionSchema = SchemaFactory.createForClass(PredictionMongo);
