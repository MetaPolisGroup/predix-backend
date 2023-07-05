import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "./user.schema";
import { Product } from "./product.schema";

@Schema()
export class CashHistory extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  user: User;

  @Prop({ required: true, type: Types.ObjectId, ref: Product.name })
  product: string;

  @Prop({ required: true })
  point: string;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: false })
  division: string;

  @Prop({ required: true })
  note: string;

  @Prop({ required: true })
  created_at: number;

  @Prop({ required: true })
  update_at: number;
}

export const CashHistorySchema = SchemaFactory.createForClass(CashHistory);
