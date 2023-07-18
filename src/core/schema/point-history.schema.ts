import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "./user.schema";
import { Product } from "./product.schema";

@Schema({ timestamps: true })
export class PointHistory extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  user: User;

  @Prop({ required: true })
  point: string;

  @Prop({ required: false })
  division: string;

  @Prop({ required: true })
  note: string;

  @Prop({ required: true })
  created_at: number;

  @Prop({ required: true })
  update_at: number;
}

export const PointHistorySchema = SchemaFactory.createForClass(PointHistory);
