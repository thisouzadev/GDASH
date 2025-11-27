import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Insight {
  @Prop()
  summary: string;

  @Prop()
  recommendation: string;

  @Prop()
  confidence: number;

  @Prop()
  generated_at: Date;

  // Novos insights estruturados
  @Prop()
  temperature_avg: number;

  @Prop()
  humidity_avg: number;

  @Prop()
  wind_avg: number;

  @Prop()
  temperature_trend: string;

  @Prop()
  trend_variance: string;

  @Prop()
  comfort_score: number;

  @Prop()
  day_type: string;

  @Prop({ type: [String] })
  alerts: string[];

}
export type InsightDocument = Insight & Document;
export const InsightSchema = SchemaFactory.createForClass(Insight);
