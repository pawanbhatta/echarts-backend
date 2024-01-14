import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chart } from './schemas/chart.schema';
import * as Mongoose from 'mongoose';
import * as echarts from 'echarts';
import { JSDOM } from 'jsdom';
import canvas2image from 'canvas2image';
import * as fs from 'fs';

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

  generateChart(): void {
    // Create a JSDOM instance to simulate a browser environment
    const { window } = new JSDOM('<!DOCTYPE html>');
    global.window = window;
    global.document = window.document;

    // Use ECharts to generate the chart
    const chartDom = document.createElement('div');
    chartDom.style.width = '600px'; // Set the width of the chart
    chartDom.style.height = '400px'; // Set the height of the chart
    document.body.appendChild(chartDom);

    const chart = echarts.init(chartDom);
    const option = {
      // ECharts configuration options
      title: {
        text: 'Sample Chart',
      },
      series: [
        {
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20],
        },
      ],
    };

    chart.setOption(option);

    // Convert the chart to an image
    const imageData = canvas2image.convertToPNG(chartDom);

    // Save the image to a file
    fs.writeFileSync('echarts_chart.png', imageData);
  }
}
