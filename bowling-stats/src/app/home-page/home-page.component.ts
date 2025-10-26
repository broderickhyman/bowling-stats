import { Component, Input, inject, signal } from '@angular/core';
import { Game } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
})
export class HomePage {
  private pinpalService = inject(PinpalService);
  games = signal<Game[]>([]);

  async ngOnInit() {
    try {
      await this.pinpalService.initialize();
    } catch (error) {
      console.error('Load existing failed:', error);
      alert('Failed to load existing');
    }
    await this.loadData();
  }

  async loadData() {
    const sql = this.pinpalService.sqlDB;
    if (!sql) {
      return;
    }
    const result = sql.exec(`SELECT
g.score
from week w
inner join game g on g.weekFk = w.pk
order by
w.date desc
, g.pk
limit 30;`)[0];
    this.games.set(
      result.values.map<Game>((v) => ({
        score: v[0] as number,
      })),
    );
    console.log(this.games());
  }
}
