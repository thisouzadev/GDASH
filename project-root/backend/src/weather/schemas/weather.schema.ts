import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Weather {
  @Prop() timestamp: string;
  @Prop() temperature: number;
  @Prop() humidity: number;
  @Prop() wind_speed: number;
  @Prop({ type: Object }) location: { lat: number; lon: number };
}

export type WeatherDocument = Weather & Document;
export const WeatherSchema = SchemaFactory.createForClass(Weather);
