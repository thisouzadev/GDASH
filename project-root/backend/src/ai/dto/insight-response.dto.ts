import { ApiProperty } from '@nestjs/swagger';

export class InsightResponseDto {
  @ApiProperty()
  summary: string;

  @ApiProperty()
  recommendation: string;

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  generated_at: Date;

  @ApiProperty()
  temperature_avg: number;

  @ApiProperty()
  humidity_avg: number;

  @ApiProperty()
  wind_avg: number;

  @ApiProperty()
  temperature_trend: string;

  @ApiProperty()
  trend_variance: string;

  @ApiProperty()
  comfort_score: number;

  @ApiProperty()
  day_type: string;

  @ApiProperty({ type: [String] })
  alerts: string[];
}
