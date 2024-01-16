import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ChartService } from './chart.service';
import { Chart } from './schemas/chart.schema';
import * as echarts from 'echarts';
import { Canvas, createCanvas } from 'canvas';
import { Response } from 'express';
// import * as fs from 'fs';
// import { JSDOM } from 'jsdom';
// import canvas2image from 'canvas2image';

@Controller('charts')
export class ChartController {
  private chartData = [
    {
      subcategory: 'Bookcases',
      d__2019sale: 101096.96797180176,
      d__2021sale: 62931.26985168457,
    },
    {
      subcategory: 'Labels',
      d__2019sale: 5236.062787532806,
      d__2021sale: 9820.563998937607,
    },
    {
      subcategory: 'Accessories',
      d__2019sale: 94436.95135688782,
      d__2021sale: 113423.82188212872,
    },
    {
      subcategory: 'Copiers',
      d__2019sale: 99178.18908691406,
      d__2021sale: 114199.46112060547,
    },
    {
      subcategory: 'Machines',
      d__2019sale: 96587.89018249512,
      d__2021sale: 243639.41075611115,
    },
    {
      subcategory: 'Chairs',
      d__2019sale: 152225.61891937256,
      d__2021sale: 260093.79663848877,
    },
    {
      subcategory: 'Tables',
      d__2019sale: 78526.16323852539,
      d__2021sale: 188872.7861442566,
    },
    {
      subcategory: 'Art',
      d__2019sale: 16798.07052254677,
      d__2021sale: 25359.164004564285,
    },
    {
      subcategory: 'Envelopes',
      d__2019sale: 8628.26382780075,
      d__2021sale: 11353.1259932518,
    },
    {
      subcategory: 'Furnishings',
      d__2019sale: 76903.99239730835,
      d__2021sale: 50246.26994919777,
    },
    {
      subcategory: 'Fasteners',
      d__2019sale: 1194.1905014514923,
      d__2021sale: 2176.373995423317,
    },
    {
      subcategory: 'Appliances',
      d__2019sale: 65314.00522232056,
      d__2021sale: 62788.72799515724,
    },
    {
      subcategory: 'Supplies',
      d__2019sale: 3779.914409637451,
      d__2021sale: 11199.67172408104,
    },
    {
      subcategory: 'Storage',
      d__2019sale: 113806.76581382751,
      d__2021sale: 137802.37221431732,
    },
    {
      subcategory: 'Binders',
      d__2019sale: 68298.49900579453,
      d__2021sale: 149184.9614830017,
    },
    {
      subcategory: 'Phones',
      d__2019sale: 174402.99104881287,
      d__2021sale: 219493.20419549942,
    },
    {
      subcategory: 'Paper',
      d__2019sale: 35502.55073451996,
      d__2021sale: 37613.21588611603,
    },
  ];
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
    const chart = echarts.init(canvas as unknown as HTMLElement, 'dark');

    try {
      const options = (() => {
        switch (id.toLowerCase()) {
          case 'waterfall':
          case 'waterfall.jpg':
            return this.chartService.generateWaterfallOptions(this.chartData);
          case 'negative':
          case 'negative.jpg':
            return this.chartService.generateNegativeOptions(this.chartData);
          default:
            return this.chartService.generateGroupedOptions(this.chartData);
        }
      })();
      chart.setOption(options);
      const buffer = canvas.toBuffer('image/jpeg');
      res.set({ 'Content-Type': 'image/jpeg' });
      res.set({ 'Mime-Type': 'image' });
      res.send(buffer);
    } catch (e) {
      return res
        .status(HttpStatus.FAILED_DEPENDENCY)
        .send('Data validataion failed');
    }
  }

  @Post('generate/:id')
  async generateChartFromBody(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body,
  ) {
    console.log(id, body.length === 0);
    if (!id) return res.status(404).send('No id sent.');
    if (body.length === 0)
      return res.status(HttpStatus.CONFLICT).send('No data found.');

    try {
      const buf = this.chartService.generateChartFromBody(id, body);
      res.set({ 'Content-Type': 'image/jpeg' });
      res.send(buf);
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
