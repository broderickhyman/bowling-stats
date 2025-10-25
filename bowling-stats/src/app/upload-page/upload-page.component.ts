import { Component, Input, inject, signal } from '@angular/core';
import { PinpalService } from '@core/services/pinpal.service';

@Component({
  selector: 'upload-page',
  templateUrl: './upload-page.component.html',
})
export class UploadPage {
  private pinpalService = inject(PinpalService);
  status = signal('Loading...');
  dates = signal<Date[]>([]);

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
    const sql = this.pinpalService.sqlDB!;
    const result = sql.exec('select date from week order by date desc limit 10')[0];
    const dates = result.values.map((val) => new Date((val[0] as number) * 1000));
    this.dates.set(dates);
  }
}
