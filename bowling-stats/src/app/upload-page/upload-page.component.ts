import { Component, ElementRef, Input, ViewChild, inject, signal, viewChild } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { PinpalService } from '@core/services/pinpal.service';
import { Week } from '@core/services/pinpal.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'upload-page',
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.scss',
  imports: [MatListModule, MatButtonModule],
})
export class UploadPage {
  @ViewChild('fileUpload') fileUpload!: ElementRef;
  private pinpalService = inject(PinpalService);
  status = signal('Loading...');
  weeks = signal<Week[]>([]);

  gameScores(week: Week): string {
    return week.games.map((g) => g.score).join(', ');
  }

  async ngOnInit() {
    try {
      await this.pinpalService.initialize();
    } catch (error) {
      console.error('Load existing failed:', error);
      alert('Failed to load existing');
    }
    this.status.set(this.pinpalService.status);
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
    const result = sql.exec(`SELECT
w.date
, w.pk
, g.score
, g.pk
from week w
inner join (
	SELECT
	w.pk
	from week w
	order by w.date desc
	limit 4
) as sub on sub.pk = w.pk
inner join game g on g.weekFk = w.pk
order by
w.date desc
, g.pk;`)[0];
    const weeks = new Map<number, Week>();
    result.values.reduce((acc: Map<number, Week>, val: any) => {
      const weekId = val[1] as number;
      if (!acc.has(weekId)) {
        acc.set(weekId, {
          date: new Date((val[0] as number) * 1000),
          games: [],
        });
      }
      acc.get(weekId)?.games.push({
        score: val[2] as number,
        pk: val[3] as number,
      });
      return acc;
    }, weeks);
    this.weeks.set([...weeks.values()]);
  }

  onUploadClick() {
    this.fileUpload.nativeElement.click();
  }
}
