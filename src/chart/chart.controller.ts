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

@Controller('charts')
export class ChartController {
  constructor(private chartService: ChartService) {}

  @Get()
  async getAllCharts(): Promise<Chart[]> {
    return this.chartService.findAll();
  }

  @Get('generate')
  async generateChart(@Res() res) {
    return this.chartService.generateChart();
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
