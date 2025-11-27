import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { Insight, InsightSchema } from './schemas/insight.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Insight.name, schema: InsightSchema }],
      'weathers',
    ),
  ],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule { }
