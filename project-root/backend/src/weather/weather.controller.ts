import { Controller, Get, Post, Body, Res, Query, HttpStatus, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Weather } from './schemas/weather.schema';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { createObjectCsvStringifier } from 'csv-writer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from 'src/ai/ai.service';

@ApiTags('Weather')
@ApiBearerAuth()
@Controller('api/weather')
// @UseGuards(JwtAuthGuard)
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly aiService: AiService
  ) { }

  @Post('logs')
  @ApiOperation({ summary: 'Criar um registro meteorológico (Worker Go)' })
  @ApiResponse({ status: 201, description: 'Registro criado com sucesso.', type: Weather })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  async create(@Body() createWeatherDto: CreateWeatherDto) {

    return this.weatherService.create(createWeatherDto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Listar registros meteorológicos com filtros e paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Lista de registros', type: [Weather] })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('sortBy') sortBy?: keyof Weather,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return this.weatherService.findAll({ page, limit, from, to, sortBy, order });
  }

  // --- Exportar CSV com filtros ---
  @Get('export.csv')
  @ApiOperation({ summary: 'Exportar registros meteorológicos para CSV (com filtros)' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Arquivo CSV gerado com sucesso.' })
  async exportCsv(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.weatherService.findAllDataForExport({ from, to });
    if (!data || data.length === 0) return res.status(HttpStatus.NO_CONTENT).send();

    const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));
    const csvStringifier = createObjectCsvStringifier({ header: headers });

    const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="weather_logs.csv"');
    res.status(HttpStatus.OK).send(csvData);
  }

  @Get('export.xlsx')
  @ApiOperation({ summary: 'Exportar todos os logs climáticos para Excel (XLSX)' })
  @ApiResponse({ status: 200, description: 'Arquivo XLSX gerado com sucesso.' })
  async exportXlsx(@Res() res: Response) {
    const data = await this.weatherService.findAllDataForExport();

    if (!data || data.length === 0) {
      return res.status(HttpStatus.NO_CONTENT).send();
    }

    // Cria workbook e worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weather Logs');

    // Adiciona colunas com base no primeiro objeto
    const columns = Object.keys(data[0]).map(key => ({ header: key, key }));
    worksheet.columns = columns;

    // Adiciona linhas
    data.forEach(item => worksheet.addRow(item));

    // Configura headers da resposta
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="weather_logs.xlsx"',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    // Gera arquivo e envia
    await workbook.xlsx.write(res);
    res.end();
  }

  @Post('insights')
  @ApiOperation({ summary: 'Acionar geração de insights de IA' })
  @ApiResponse({ status: 202, description: 'Geração de insights acionada com sucesso.' })
  async generateInsights() {

    const data = await this.weatherService.findAllDataForExport();

    const insightText = await this.aiService.generateWeatherInsight(data);
    await this.aiService.saveInsight(insightText);

    return {
      status: 'accepted',
      message: 'Insights gerados com sucesso.',
      content: insightText,
    };
  }

  @Get('insights')
  @ApiOperation({ summary: 'Retornar último insight gerado pela IA' })
  @ApiResponse({ status: 200, description: 'Insight retornado com sucesso.' })
  async getInsights() {
    return this.aiService.getLastInsight();

  }
}
