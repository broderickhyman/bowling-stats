import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PinpalService } from '@core/services/pinpal.service';
import { PageTitleService } from '@core/services/page-title.service';
import { MonthlyStats } from '@core/services/pinpal.model';

type MetricKey =
  | 'averageScore'
  | 'strikesPercent'
  | 'pocketHitsPercent'
  | 'opensPercent'
  | 'sparesPercent'
  | 'singlePinPickupPercent';

interface MetricOption {
  value: MetricKey;
  label: string;
  yAxisLabel: string;
}

@Component({
  selector: 'monthly-page',
  templateUrl: './monthly-page.component.html',
  styleUrl: './monthly-page.component.scss',
  imports: [MatTableModule, MatSortModule, MatSelectModule, MatFormFieldModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyPage {
  private router = inject(Router);
  private pinpalService = inject(PinpalService);
  private pageTitleService = inject(PageTitleService);

  monthlyStats = signal<MonthlyStats[]>([]);
  sortedStats = signal<MonthlyStats[]>([]);
  selectedMetric = signal<MetricKey>('averageScore');

  readonly metricOptions: MetricOption[] = [
    { value: 'averageScore', label: 'Average Score', yAxisLabel: 'Average Score' },
    { value: 'strikesPercent', label: 'Strikes', yAxisLabel: 'Percentage' },
    { value: 'pocketHitsPercent', label: 'Pocket Hits', yAxisLabel: 'Percentage' },
    { value: 'opensPercent', label: 'Opens', yAxisLabel: 'Percentage' },
    { value: 'sparesPercent', label: 'Spares', yAxisLabel: 'Percentage' },
    { value: 'singlePinPickupPercent', label: 'Single Pin Pickup', yAxisLabel: 'Percentage' },
  ];

  displayedColumns: string[] = [
    'date',
    'averageScore',
    'strikesPercent',
    'pocketHitsPercent',
    'opensPercent',
    'sparesPercent',
    'singlePinPickupPercent',
    'gutters',
  ];

  chartData = signal<ChartConfiguration['data']>({
    datasets: [
      {
        label: 'Monthly Average',
        data: [],
        tension: 0.3,
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        fill: false,
      },
      {
        label: 'Trailing 4-Month Average',
        data: [],
        tension: 0.3,
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        fill: false,
        borderDash: [5, 5],
      },
    ],
  });

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        title: {
          display: true,
          text: 'Average Score',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  constructor() {
    this.pageTitleService.setTitle('Monthly Statistics');
  }

  async ngOnInit() {
    const stats = await this.pinpalService.loadMonthlyStats();

    if (stats.length === 0) {
      await this.router.navigate(['/upload']);
      return;
    }

    this.monthlyStats.set(stats);
    this.sortedStats.set(stats);

    // Populate chart with default metric
    this.populateChartData(this.selectedMetric());
  }

  onSortChange(sort: Sort) {
    const data = this.monthlyStats().slice();

    if (!sort.active || sort.direction === '') {
      this.sortedStats.set(data);
      return;
    }

    const sorted = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      const aValue = a[sort.active as keyof MonthlyStats];
      const bValue = b[sort.active as keyof MonthlyStats];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return isAsc ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    this.sortedStats.set(sorted);
  }

  private calculateTrailing4MonthAverage(stats: MonthlyStats[], metric: MetricKey): number[] {
    const trailing: number[] = [];

    for (let i = 0; i < stats.length; i++) {
      // Calculate average of current month and up to 3 previous months
      const startIndex = Math.max(0, i - 3);
      const slice = stats.slice(startIndex, i + 1);
      const sum = slice.reduce((acc, curr) => acc + curr[metric], 0);
      const avg = sum / slice.length;
      trailing.push(Math.round(avg));
    }

    return trailing;
  }

  private populateChartData(metric: MetricKey): void {
    const stats = this.monthlyStats();
    if (stats.length === 0) return;

    const reversedStats = [...stats].reverse();

    // Calculate data
    const labels = reversedStats.map((s) => s.date);
    const monthlyData = reversedStats.map((s) => s[metric]);
    const trailingAverages = this.calculateTrailing4MonthAverage(reversedStats, metric);

    // Get current chart config
    const currentData = this.chartData();

    // Create new chartData object with updated values
    this.chartData.set({
      labels,
      datasets: [
        {
          ...currentData.datasets[0],
          data: monthlyData,
        },
        {
          ...currentData.datasets[1],
          data: trailingAverages,
        },
      ],
    });

    // Update Y-axis label
    const option = this.metricOptions.find((o) => o.value === metric);
    const yScale = this.chartOptions?.scales?.['y'];
    if (yScale && option) {
      (yScale as any).title = { display: true, text: option.yAxisLabel };
    }
  }

  onMetricChange(metric: MetricKey): void {
    this.selectedMetric.set(metric);
    this.populateChartData(metric);
  }
}
