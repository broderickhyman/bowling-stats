import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Game } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';
import { PinCard } from 'app/shared/components/pin-card.component';
import { StatCard } from 'app/shared/components/stat-card.component';
import { Stats } from 'app/shared/components/stats.model';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  imports: [BaseChartDirective, MatCardModule, StatCard, PinCard],
})
export class HomePage {
  public pinpalService = inject(PinpalService);
  loading = signal(true);
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
    try {
      await this.pinpalService.initialize();
    } catch (error) {
      console.error('Load existing failed:', error);
      alert('Failed to load existing');
    }
    this.loadData();
  }

  loadData() {
    const sql = this.pinpalService.sqlDB;
    if (!sql) {
      return;
    }
    const gamesResult = sql.exec(`SELECT
g.score
, w.date
, g.pk
from week w
inner join game g on g.weekFk = w.pk
where w.leagueFk >= 0
order by
w.date desc
, g.pk
limit 30;`)[0];
    const games = gamesResult.values
      .map((v: any): Game => ({
        pk: v[2] as number,
        score: v[0] as number,
        week: {
          date: new Date((v[1] as number) * 1000),
          games: [],
        },
      }))
      .sort((a: Game, b: Game) => {
        if (a.week?.date == b.week?.date) {
          return a.pk - b.pk;
        }
        return a.week!.date.getTime() - b.week!.date.getTime();
      });
    this.games.set(games);
    this.chartData.datasets[0].data = games.map((g: Game) => g.score);
    this.chartData.labels = games.map((g: Game) => g.week!.date.toLocaleDateString());

    const placeholders = games.map(() => '?').join(',');
    const query = `SELECT
avg(g.score)
, max(g.score)
, count(g.score)
from game g
where g.pk in (${placeholders})`;
    const statResult = sql.exec(
      query,
      games.map((g: Game) => g.pk),
    )[0].values[0];
    this.stats = {
      average: statResult[0] as number,
      high: statResult[1] as number,
      count: statResult[2] as number,
    };
    this.loading.set(false);
  }
}
