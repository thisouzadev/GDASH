import { ApiProperty } from '@nestjs/swagger';

export class CreateWeatherDto {
  @ApiProperty({ description: 'Timestamp do registro' })
  timestamp: string;

  @ApiProperty({ description: 'Temperatura em °C' })
  temperature: number;

  @ApiProperty({ description: 'Umidade relativa em %' })
  humidity: number;

  @ApiProperty({ description: 'Velocidade do vento em km/h' })
  wind_speed: number;

  @ApiProperty({ description: 'Localização geográfica' })
  location: { lat: number; lon: number };
}
