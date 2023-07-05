import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  balance: number;

  @Prop({ required: true })
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
  update_at: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
