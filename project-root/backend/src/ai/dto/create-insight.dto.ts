import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, Min, Max } from 'class-validator';

export class CreateInsightDto {
  @ApiProperty({
    description: 'Resumo geral gerado pela IA com base nos dados climáticos.',
  })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({
    description: 'Recomendação prática gerada pela IA considerando as condições climáticas.',
  })
  @IsString()
  @IsNotEmpty()
  recommendation: string;

  @ApiProperty({
    description: 'Nível de confiança da IA na análise realizada, variando de 0 a 100.',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence: number;

  @ApiProperty({
    description: 'Média de temperatura calculada a partir dos registros recebidos.',
  })
  @IsNumber()
  temperature_avg: number;

  @ApiProperty({
    description: 'Média de umidade relativa calculada pelos dados meteorológicos.',
  })
  @IsNumber()
  humidity_avg: number;

  @ApiProperty({
    description: 'Média de velocidade do vento com base nos dados de entrada.',
  })
  @IsNumber()
  wind_avg: number;

  @ApiProperty({
    description: 'Tendência da temperatura nas últimas medições (ex.: "rising", "falling", "stable").',
    example: "rising",
  })
  @IsString()
  temperature_trend: string;

  @ApiProperty({
    description: 'Variação exata da tendência de temperatura (ex.: "+1.3°C nas últimas 24h").',
  })
  @IsString()
  trend_variance: string;

  @ApiProperty({
    description: 'Índice numérico entre 0 e 100 representando o nível de conforto climático.',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  comfort_score: number;

  @ApiProperty({
    description: 'Classificação descritiva do dia (ex.: "frio", "quente", "agradável", "abafado").',
  })
  @IsString()
  day_type: string;

  @ApiProperty({
    description: 'Lista de alertas contextuais identificados pela IA conforme os dados.',
    type: [String],
  })
  @IsArray()
  alerts: string[];

  @ApiProperty({
    description: 'Data em que o insight foi gerado automaticamente.',
    required: false,
  })
  @IsOptional()
  generated_at?: Date;
}
