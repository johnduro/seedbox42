import { Component, Inject, ViewChild } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from "ng-apexcharts";

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexPlotOptions,
  ApexGrid,
} from "ng-apexcharts";
import { Panel } from '../settings/settings';
import { CommonModule } from '@angular/common';
import { DiskSpaceService } from '../diskSpace/disk-space.service';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  plotOptions: ApexPlotOptions;
  grid: ApexGrid;
  labels: string[];
  colors: string[];
};

@Component({
  selector: 'app-dashboard-chart-donut',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard-chart-donut.component.html',
  styleUrl: './dashboard-chart-donut.component.scss'
})
export class DashboardChartDonutComponent {
  @ViewChild("chart") chart!: ChartComponent;

  public chartOptions: Partial<ChartOptions>;

  constructor(@Inject('panel') public panel: Panel, private diskSpaceService: DiskSpaceService) {
    this.chartOptions = {
      series: [44, 55],
      chart: {
        width: 380,
        type: "donut"
      },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          offsetY: 10
        }
      },
      grid: {
        padding: {
          bottom: -80
        }
      },
      labels: ['Used', 'Free'],
      colors: ['#c7254e', '#25c79e'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };
    this.diskSpaceService.getDiskSpace().subscribe(diskSpace => {
      this.chartOptions.series = [diskSpace.usedPer, diskSpace.freePer];
    });
  }
}
