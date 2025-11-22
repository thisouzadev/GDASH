import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './schemas/weather.schema';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name, 'weathers')
    private weatherModel: Model<WeatherDocument>,
  ) { }

  /** Criar um novo registro meteorológico */
  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    try {
      const created = new this.weatherModel(createWeatherDto);
      return await created.save();
    } catch (err) {
      throw new InternalServerErrorException('Erro ao salvar registro meteorológico.');
    }
  }

  /** Listar registros com filtros, paginação e ordenação */
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

  /** Retorna dados brutos para exportação CSV/XLSX */
  async findAllDataForExport(options?: { from?: string; to?: string }): Promise<Partial<Weather>[]> {
    const query: any = {};
    if (options?.from || options?.to) {
      query.timestamp = {};
      if (options.from) query.timestamp.$gte = options.from;
      if (options.to) query.timestamp.$lte = options.to;
    }
    return this.weatherModel.find(query).lean().exec(); // retorna Partial<Weather>[]
  }

}
