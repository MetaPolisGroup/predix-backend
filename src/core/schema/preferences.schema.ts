import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class PreferenceMongo extends Document {
  @Prop({ required: true })
  fee: number;

  @Prop({ required: true })
  interval_seconds: number;

  @Prop({ required: true })
  buffer_seconds: number;

  @Prop({ required: true })
  genesis_start: boolean;

  @Prop({ required: true })
  genesis_lock: boolean;

  @Prop({ required: true })
  paused: boolean;
}

export const PreferencesSchema = SchemaFactory.createForClass(PreferenceMongo);
