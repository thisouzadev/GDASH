import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './schemas/weather.schema';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { AiService } from 'src/ai/ai.service';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name, 'weathers')
    private weatherModel: Model<WeatherDocument>,
    private readonly aiService: AiService
  ) { }

  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    try {
      const created = new this.weatherModel(createWeatherDto);
      return await created.save();
    } catch (err) {
      throw new InternalServerErrorException('Erro ao salvar registro meteorológico.');
    }
  }

  async findAll(options?: {
    limit?: number;
    page?: number;
    from?: string;
    to?: string;
    sortBy?: keyof Weather;
    order?: 'asc' | 'desc';
  }): Promise<{ data: Weather[]; total: number }> {
    const { limit = 50, page = 1, from, to, sortBy = 'timestamp', order = 'desc' } = options || {};
    const query: any = {};

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = from;
      if (to) query.timestamp.$lte = to;
    }

    const total = await this.weatherModel.countDocuments(query);
    const data = await this.weatherModel
      .find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { data, total };
  }

  async findAllDataForExport(options?: { from?: string; to?: string }): Promise<Partial<Weather>[]> {
    const query: any = {};
    if (options?.from || options?.to) {
      query.timestamp = {};
      if (options.from) query.timestamp.$gte = options.from;
      if (options.to) query.timestamp.$lte = options.to;
    }
    return this.weatherModel.find(query).lean().exec();
  }

  async generateInsights() {
    const last100 = await this.weatherModel
      .find()
      .sort({ timestamp: -1 })
      .limit(100)
      .lean()
      .exec();

    const insight = await this.aiService.generateWeatherInsight(last100);

    return this.aiService.saveInsight(insight);
  }

  async getLastInsight() {
    return this.aiService.getLastInsight();
  }
}
