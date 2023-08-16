import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class ChartMongo extends Document {
  @Prop({ required: true })
  id?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  created_at: number;

  @Prop({ required: true })
  delete: boolean;
}

export const ChartSchema = SchemaFactory.createForClass(ChartMongo);
