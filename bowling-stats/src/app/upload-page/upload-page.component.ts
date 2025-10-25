import { Component, Input, inject, signal } from '@angular/core';
import { Week } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';

@Component({
  selector: 'upload-page',
  templateUrl: './upload-page.component.html',
})
export class UploadPage {
  private pinpalService = inject(PinpalService);
  status = signal('Loading...');
  weeks = signal<Week[]>([]);

  async ngOnInit() {
    try {
      await this.pinpalService.loadExisting(this.status);
    } catch (error) {
      console.error('Load existing failed:', error);
      alert('Failed to load existing');
    }
    await this.loadData();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    try {
      await this.pinpalService.importDatabase(this.status, file);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import PinPal database');
    }
    await this.loadData();
  }

  async loadData() {
    const sql = this.pinpalService.sqlDB;
    if (!sql) {
      return;
    }
    const result = sql.exec(`select
w.date
, w.pk
, g.score
from week w
inner join game g on g.weekFk = w.pk
order by w.date desc limit 30;`)[0];
    const weeks = new Map<number, Week>();
    result.values.reduce((acc, val) => {
      const weekId = val[1] as number;
      if (!acc.has(weekId)) {
        acc.set(weekId, {
          date: new Date((val[0] as number) * 1000),
          games: [],
        });
      }
      acc.get(weekId)?.games.push({
        score: val[2] as number,
      });
      return acc;
    }, weeks);
    this.weeks.set([...weeks.values()]);
  }
}
