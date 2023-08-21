import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class ChainlinkMongo extends Document {
  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  updated_at: number;
}

export const ChainLinkSchema = SchemaFactory.createForClass(ChainlinkMongo);
