import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PinpalService } from '@core/services/pinpal.service';
import { MonthlyStats } from '@core/services/pinpal.model';

@Component({
  selector: 'monthly-page',
  templateUrl: './monthly-page.component.html',
  styleUrl: './monthly-page.component.scss',
  imports: [MatTableModule, MatSortModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyPage {
  private router = inject(Router);
  private pinpalService = inject(PinpalService);

  monthlyStats = signal<MonthlyStats[]>([]);
  sortedStats = signal<MonthlyStats[]>([]);

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

  chartData: ChartConfiguration['data'] = {
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
  };

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

  async ngOnInit() {
    const stats = await this.pinpalService.loadMonthlyStats();

    if (stats.length === 0) {
      await this.router.navigate(['/upload']);
      return;
    }

    this.monthlyStats.set(stats);
    this.sortedStats.set(stats);

    // Populate chart data (reverse to show oldest to newest)
    const reversedStats = [...stats].reverse();

    // Set labels (x-axis dates)
    this.chartData.labels = reversedStats.map((s) => s.date);

    // Set monthly average scores
    this.chartData.datasets[0].data = reversedStats.map((s) => s.averageScore);

    // Calculate and set trailing 4-month average
    const trailingAverages = this.calculateTrailing4MonthAverage(reversedStats);
    this.chartData.datasets[1].data = trailingAverages;
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

  private calculateTrailing4MonthAverage(stats: MonthlyStats[]): number[] {
    const trailing: number[] = [];

    for (let i = 0; i < stats.length; i++) {
      // Calculate average of current month and up to 3 previous months
      const startIndex = Math.max(0, i - 3);
      const slice = stats.slice(startIndex, i + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.averageScore, 0);
      const avg = sum / slice.length;
      trailing.push(Math.round(avg));
    }

    return trailing;
  }
}
