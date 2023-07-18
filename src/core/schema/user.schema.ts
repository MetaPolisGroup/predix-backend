import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  account_id: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  point: number;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true })
  created_at: number;

  @Prop({ required: true })
  updated_at: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
