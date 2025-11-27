import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Insight, InsightDocument } from './schemas/insight.schema';
import { Model } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CreateInsightDto } from './dto/create-insight.dto';
import { InsightResponseDto } from './dto/insight-response.dto';

@Injectable()
export class AiService {
  private gemini;

  constructor(
    @InjectModel(Insight.name, 'weathers')
    private insightModel: Model<InsightDocument>,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não definida!");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    this.gemini = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
  }

  async saveInsight(data: CreateInsightDto): Promise<InsightResponseDto> {
    const created = new this.insightModel({
      ...data,
      generated_at: new Date(),
    });

    const saved = await created.save();
    return saved.toObject() as InsightResponseDto;
  }

  async getLastInsight(): Promise<InsightResponseDto> {
    const result = await this.insightModel
      .findOne()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return result as InsightResponseDto;
  }

  async generateWeatherInsight(weatherData: any[]): Promise<CreateInsightDto> {
    const prompt = `
Você é um sistema que analisa dados meteorológicos e gera insights precisos.

Os dados recebidos são uma lista JSON de leituras:
${JSON.stringify(weatherData)}

Com base APENAS nesses dados, gere os seguintes campos:

{
  "temperature_avg": number,
  "humidity_avg": number,
  "wind_avg": number,

  "temperature_trend": "rising" | "falling" | "stable",
  "trend_variance": string,

  "comfort_score": number,
  "day_type": string,

  "alerts": string[],

  "summary": string,
  "recommendation": string,
  "confidence": number
}

REGRAS IMPORTANTES:
- Faça todos os cálculos você mesmo.
- NÃO invente dados.
- NÃO adicione campos extras.
- Responda SOMENTE com JSON puro.
- Sem markdown.
`;

    const result = await this.gemini.generateContent(prompt);
    let content = result.response.text().trim();

    if (!content) {
      throw new Error("Resposta da IA veio vazia");
    }

    content = content.replace(/```json/g, "").replace(/```/g, "");

    const match = content.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("Nenhum JSON válido encontrado na resposta da IA");
    }

    try {
      const data = JSON.parse(match[0]);
      return data as CreateInsightDto;
    } catch (err) {
      console.error("ERRO ao interpretar JSON:", match[0]);
      throw new Error("Falha ao parsear o JSON retornado pelo Gemini");
    }
  }
}
