import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Game } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';
import { StatCard } from 'app/shared/components/stat-card.component';
import { Stats } from 'app/shared/components/stats.model';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  imports: [BaseChartDirective, MatCardModule, StatCard, MatButtonModule, RouterLink],
})
export class HomePage {
  public pinpalService = inject(PinpalService);
  loading = signal(true);
  existingData = signal(false);
  games = signal<Game[]>([]);
  stats?: Stats;
  chartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        // label: 'Score',
        tension: 0.4,
        borderColor: 'green',
        backgroundColor: 'green',
      },
    ],
  };
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

  async ngOnInit() {
    await this.loadData();
    this.loading.set(false);
  }

  async loadData() {
    const games = (await this.pinpalService.loadGames(30)).sort((a: Game, b: Game) => {
      if (a.week?.date == b.week?.date) {
        return a.pk - b.pk;
      }
      return a.week!.date.getTime() - b.week!.date.getTime();
    });
    if (games.length == 0) {
      return;
    }
    this.existingData.set(true);
    this.games.set(games);
    this.chartData.datasets[0].data = games.map((g: Game) => g.score);
    this.chartData.labels = games.map((g: Game) => g.week!.date.toLocaleDateString());

    this.stats = await this.pinpalService.loadGameStats(games);
  }
}
