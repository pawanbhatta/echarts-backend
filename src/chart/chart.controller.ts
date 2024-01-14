import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ChartService } from './chart.service';
import { Chart } from './schemas/chart.schema';
import { CreateChartDto } from './dto/create-chart.dto';
import { UpdateChartDto } from './dto/update-chart.dto';
import * as echarts from 'echarts';
import { createCanvas } from 'canvas';
// import * as fs from 'fs';
// import { JSDOM } from 'jsdom';
// import canvas2image from 'canvas2image';

@Controller('charts')
export class ChartController {
  constructor(private chartService: ChartService) {}

  @Get()
  async getAllCharts(): Promise<Chart[]> {
    return this.chartService.findAll();
  }

  @Get('generate')
  async generateChart(@Res() res) {
    const canvas: any = createCanvas(600, 400);
    canvas.getContext('2d');

    const chart = echarts.init(canvas);
    const options = {
      title: {
        text: 'ECharts Example',
      },
      xAxis: {
        type: 'category',
        data: [
          'Category A',
          'Category B',
          'Category C',
          'Category D',
          'Category E',
        ],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [120, 200, 150, 80, 70],
          type: 'bar',
        },
      ],
    };

    chart.setOption(options);

    const buffer = canvas.toBuffer('image/png');
    res.set({ 'Content-Type': 'image/png' });
    res.send(buffer);
  }

  @Post()
  async createChart(
    @Body()
    chart: CreateChartDto,
  ): Promise<Chart> {
    return this.chartService.create(chart);
  }

  @Get(':id')
  async getChartById(
    @Param('id')
    id: string,
  ): Promise<Chart> {
    return this.chartService.findById(id);
  }

  @Put(':id')
  async updateChart(
    @Param('id')
    id: string,
    @Body()
    chart: UpdateChartDto,
  ): Promise<Chart> {
    return this.chartService.update(id, chart);
  }

  @Delete(':id')
  async deleteChart(
    @Param('id')
    id: string,
  ): Promise<Chart> {
    return this.chartService.delete(id);
  }
}
