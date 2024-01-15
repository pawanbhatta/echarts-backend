import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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
import { Canvas, createCanvas } from 'canvas';
import { Response } from 'express';
// import * as fs from 'fs';
// import { JSDOM } from 'jsdom';
// import canvas2image from 'canvas2image';

@Controller('charts')
export class ChartController {
  private chartData = [];
  constructor(private chartService: ChartService) {}

  @Get()
  async getAllCharts(): Promise<Chart[]> {
    return this.chartService.findAll();
  }

  @Post('data')
  addChartData(@Res() res: Response, @Body() body) {
    try {
      console.log('body : ++++++++++++', body);
      const data = body;
      this.chartData = data;
      res.status(200).json(data);
    } catch (e) {
      console.log(e);
      res.status(HttpStatus.FORBIDDEN).send('Data error');
    }
  }

  @Get('generate/:id')
  async generateChart(@Res() res: Response, @Param('id') id: string) {
    console.log(id, this.chartData.length === 0);
    if (!id) return res.status(404).send('No id sent.');
    if (this.chartData.length === 0)
      return res.status(HttpStatus.CONFLICT).send('No data found.');
    const canvas: Canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    const chart = echarts.init(canvas as unknown as HTMLElement);

    try {
      const options = (() => {
        switch (id.toLowerCase()) {
          case 'waterfall':
            return this.chartService.generateWaterfallOptions(this.chartData);
          case 'negative':
            return this.chartService.generateNegativeOptions(this.chartData);
          default:
            return this.chartService.generateGroupedOptions(this.chartData);
        }
      })();
      chart.setOption(options);
      const buffer = canvas.toBuffer('image/png');
      res.set({ 'Content-Type': 'image/png' });
      res.send(buffer);
    } catch (e) {
      return res
        .status(HttpStatus.FAILED_DEPENDENCY)
        .send('Data validataion failed');
    }
    // const options = {
    //   title: {
    //     text: 'ECharts Example',
    //   },
    //   xAxis: {
    //     type: 'category',
    //     data: [
    //       'Category A',
    //       'Category B',
    //       'Category C',
    //       'Category D',
    //       'Category E',
    //     ],
    //   },
    //   yAxis: {
    //     type: 'value',
    //   },
    //   series: [
    //     {
    //       data: [120, 200, 150, 80, 70],
    //       type: 'bar',
    //     },
    //   ],
    // };
  }

  // @Post()
  // async createChart(
  //   @Body()
  //   chart: CreateChartDto,
  // ): Promise<Chart> {
  //   return this.chartService.create(chart);
  // }

  // @Get(':id')
  // async getChartById(
  //   @Param('id')
  //   id: string,
  // ): Promise<Chart> {
  //   return this.chartService.findById(id);
  // }

  // @Put(':id')
  // async updateChart(
  //   @Param('id')
  //   id: string,
  //   @Body()
  //   chart: UpdateChartDto,
  // ): Promise<Chart> {
  //   return this.chartService.update(id, chart);
  // }

  // @Delete(':id')
  // async deleteChart(
  //   @Param('id')
  //   id: string,
  // ): Promise<Chart> {
  //   return this.chartService.delete(id);
  // }
}
