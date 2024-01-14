import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Chart {
  @Prop()
  name: string;

  @Prop()
  description: string;
}

export const ChartSchema = SchemaFactory.createForClass(Chart);
