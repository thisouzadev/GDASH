import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { Weather, WeatherSchema } from './schemas/weather.schema';
import { AiModule } from 'src/ai/ai.module';
import { AiService } from 'src/ai/ai.service';
import { Insight, InsightSchema } from 'src/ai/schemas/insight.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Weather.name, schema: WeatherSchema },
        { name: Insight.name, schema: InsightSchema }
      ],
      'weathers'
    ),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, AiService],
  exports: [WeatherService],
})
export class WeatherModule { }