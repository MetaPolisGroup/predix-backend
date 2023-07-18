import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  created_at: number;

  @Prop({ required: true })
  update_at: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
