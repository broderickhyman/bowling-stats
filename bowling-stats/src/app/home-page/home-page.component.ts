import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Game } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';
import { StatCard } from 'app/shared/components/stat-card.component';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  imports: [BaseChartDirective, MatCardModule, StatCard],
})
export class HomePage {
  private pinpalService = inject(PinpalService);
  loading = signal(true);
  games = signal<Game[]>([]);
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
    const result = sql.exec(`SELECT
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
    const games = result.values
      .map<Game>((v) => ({
        pk: v[2] as number,
        score: v[0] as number,
        week: {
          date: new Date((v[1] as number) * 1000),
          games: [],
        },
      }))
      .sort((a, b) => {
        if (a.week?.date == b.week?.date) {
          return a.pk - b.pk;
        }
        return a.week!.date.getTime() - b.week!.date.getTime();
      });
    this.games.set(games);
    this.chartData.datasets[0].data = games.map((g) => g.score);
    this.chartData.labels = games.map((g) => g.week!.date.toLocaleDateString());
    this.loading.set(false);
  }
}
