import { Component, effect, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Game } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';
import { StatCard } from './stat-card.component';
import { Stats } from './stats.model';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Router } from '@angular/router';

@Component({
  selector: 'games-overview',
  templateUrl: './games-overview.component.html',
  styleUrl: './games-overview.component.scss',
  imports: [BaseChartDirective, MatCardModule, StatCard, MatButtonModule],
})
export class GamesOverview {
  games = input.required<Game[]>();
  public pinpalService = inject(PinpalService);
  router = inject(Router);
  stats = signal<Stats | null>(null);
  chartData = signal<ChartConfiguration['data']>({
    datasets: [
      {
        data: [],
        // label: 'Score',
        tension: 0.4,
        borderColor: 'green',
        backgroundColor: 'green',
      },
    ],
  });
  chartOptions: ChartConfiguration['options'] = {
    scales: {
      y: {
        min: 0,
      },
    },
    plugins: {
      title: {
        // display: true,
        // text: 'Score',
      },
      legend: {
        display: false,
      },
    },
  };

  constructor() {
    effect(async () => {
      const games = this.games();

      // Update chart data
      this.chartData.set({
        labels: games.map((g: Game) => g.week!.date.toLocaleDateString()),
        datasets: [
          {
            data: games.map((g: Game) => g.score),
            tension: 0.4,
            borderColor: 'green',
            backgroundColor: 'green',
          },
        ],
      });

      // Update stats
      this.stats.set(await this.pinpalService.loadGameStats(games));
    });
  }
}
