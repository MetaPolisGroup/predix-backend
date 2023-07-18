import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Prediction extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price_start: string;

  @Prop({ required: true })
  price_end: string;

  @Prop({ required: true })
  status: string;
}

export const PredictionSchema = SchemaFactory.createForClass(Prediction);
