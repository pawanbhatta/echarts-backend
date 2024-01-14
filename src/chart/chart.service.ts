import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chart } from './schemas/chart.schema';
import * as Mongoose from 'mongoose';

@Injectable()
export class ChartService {
  constructor(
    @InjectModel(Chart.name)
    private chartModel: Mongoose.Model<Chart>,
  ) {}

  async findAll(): Promise<Chart[]> {
    const charts = await this.chartModel.find();
    return charts;
  }

  async create(chart: Chart): Promise<Chart> {
    const res = await this.chartModel.create(chart);
    return res;
  }

  async findById(id: string): Promise<Chart> {
    const chart = await this.chartModel.findById(id);

    if (!chart) {
      throw new NotFoundException('Chart Not Found!!');
    }

    return chart;
  }

  async update(id: string, chart: Chart): Promise<Chart> {
    return await this.chartModel.findByIdAndUpdate(id, chart, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string): Promise<Chart> {
    return await this.chartModel.findByIdAndDelete(id);
  }
}
