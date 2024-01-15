import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chart } from './schemas/chart.schema';
import * as Mongoose from 'mongoose';
import { EChartsOption } from 'echarts';

@Injectable()
export class ChartService {
  constructor(
    @InjectModel(Chart.name)
    private chartModel: Mongoose.Model<Chart>,
  ) {}
  generateWaterfallOptions(data: any): EChartsOption {
    const key0 = Object.keys(data[0])[0];
    const key1 = Object.keys(data[0])[1];
    const key2 = Object.keys(data[0])[2];
    const dataset = data;
    const netChange = data.reduce((acc, curr, i) => {
      return acc + Number(curr[key2]) - Number(curr[key1]);
    }, 0);
    const sortedDataset = dataset
      .slice()
      .sort((a, b) =>
        netChange > 0
          ? b[key2] - b[key1] - (a[key2] - a[key1])
          : -(b[key2] - b[key1]) + (a[key2] - a[key1]),
      );
    const xAxisData = sortedDataset.map((item) => item[key0]);
    const positiveColor = '#91c7ae';
    const negativeColor = '#fc7a26';
    const seriesData = sortedDataset.map((item, index, array) => {
      const diff =
        netChange > 0
          ? Number(item[key2]) - Number(item[key1])
          : Number(item[key1]) - Number(item[key2]);
      const isPositive =
        (diff > 0 && netChange > 0) || (diff < 0 && netChange < 0);
      return {
        value: Math.abs(diff),
        itemStyle: {
          color: isPositive ? positiveColor : negativeColor,
        },
        label: {
          show: true,
          position: diff > 0 ? 'top' : 'bottom',
          formatter: function (params: { value: number }) {
            return (
              (isPositive ? '+' : '-') + `${(params.value / 1000).toFixed(2)}k`
            );
          },
        },
      };
    });
    const helperData2 = (() => {
      const helper: { value: number; itemStyle: { color: string } }[] = [];
      let acc = 0;
      function addHelper(num: number, color: string = '#0000') {
        helper.push({ value: num, itemStyle: { color: color } });
      }
      for (let i = 0; i < seriesData.length; ++i) {
        let increasing =
          (seriesData[i].itemStyle.color === positiveColor && netChange > 0) ||
          (seriesData[i].itemStyle.color === negativeColor && netChange < 0);

        //   if (i === 0) {
        //     addHelper(0);
        //   } else {
        //     acc += seriesData[i - 1].value;
        //     if (!increasing) {
        //       addHelper(acc + seriesData[i].value);
        //     } else {
        //       addHelper(acc);
        //     }
        //   }
        if (i === 0) addHelper(0);
        else {
          if (increasing) {
            console.log(
              'Increasing',
              helper[i - 1].value + seriesData[i - 1].value,
            );
            addHelper(helper[i - 1].value + seriesData[i - 1].value);
          } else {
            addHelper(helper[i - 1].value - seriesData[i].value);
          }
        }
        //   if (i < seriesData.length - 1)
        //     acc = increasing
        //       ? acc + seriesData[i].value
        //       : acc - seriesData[i].value;
        //   else acc = acc - seriesData[i - 1].value - seriesData[i].value;
        //   console.log(helper[i], helper[i] - helper[i - 1]);
      }
      const net = new Array(helper.length).fill(0);
      net.push({
        value: helper[seriesData.length - 1].value,
        itemStyle: { color: '#000' },
        label: {
          position: 'top',
          show: true,
          formatter: function (params: { value: number }) {
            return (
              (netChange > 0 ? '+' : '-') +
              `${(params.value / 1000).toFixed(2)}k`
            );
          },
        },
      });
      return { helper, net };
    })();
    const option: EChartsOption = {
      title: {
        text: 'Waterfall Chart Example',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        top: '10%',
        bottom: '20%',
        backgroundColor: 'white',
      },
      xAxis: [
        {
          type: 'category',
          data: [...xAxisData, 'Net Changes'],
          axisTick: {
            alignWithLabel: true,
          },
          axisLabel: {
            interval: 0,
            rotate: 15,
          },
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: {
        type: 'value',
      },
      series: [
        {
          type: 'bar',
          stack: 'total',
          label: { show: false },
          data: helperData2.helper,
        },
        {
          type: 'bar',
          stack: 'total',
          label: { show: false },
          data: seriesData,
        },
        {
          type: 'bar',
          stack: 'total',
          label: { show: false, opacity: 0 },
          tooltip: { show: true },
          data: helperData2.net,
        },
      ],
    };
    return option;
  }
  generateGroupedOptions(data: any) {
    const keys = Object.keys(data[0]);
    const mappedDataSet = data.map((d, i) => {
      return [d[keys[0]], d[keys[1]], d[keys[2]]];
    });
    return {
      grid: {
        top: '10%',
        bottom: '20%',
        backgroundColor: 'white',
      },
      dataset: {
        source: mappedDataSet,
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          // formatter: (value) => {
          //   return value + (options.valuePostfix ?? '');
          // },
        },
        axisLine: {
          show: true,
          lineStyle: {
            width: 2,
          },
        },
        interval: 10,
        splitLine: {
          show: true,
          interval: 5,
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: [
        {
          type: 'bar',
          barWidth: '35%',
          label: {
            show: true,
            position: 'outside',
            formatter: (value) => {
              return value.data[1].toFixed(2).toString();
            },
          },
        },
        {
          type: 'bar',
          barWidth: '35%',
          label: {
            show: true,
            position: 'outside',
            formatter: (value) => {
              return value.data[1].toFixed(2).toString();
            },
          },
        },
      ],
    };
  }
  generateNegativeOptions(data: any) {
    const keys = Object.keys(data[0]);
    const mappedDataSet = data.map((d, i) => {
      return [d[keys[0]], d[keys[2]] - d[keys[1]]];
    });
    return {
      grid: {
        top: '10%',
        bottom: '20%',
        backgroundColor: 'white',
      },
      dataset: {
        source: mappedDataSet,
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value) => {
            return value;
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            width: 2,
          },
        },
        interval: 10,
        splitLine: {
          show: true,
          interval: 5,
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: [
        {
          type: 'bar',
          barWidth: '80%',
          label: {
            show: true,
            position: 'outside',
            formatter: (value) => {
              return value.data[1].toFixed(2).toString();
            },
          },
        },
      ],
    };
  }
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
