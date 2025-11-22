import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { Weather, WeatherSchema } from './schemas/weather.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]), // <-- IMPORTANTE
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService], // se for usado em outros módulos
})
export class WeatherModule { }
