import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { PinpalService } from '@core/services/pinpal.service';
import { PageTitleService } from '@core/services/page-title.service';
import { Week } from '@core/services/pinpal.model';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'upload-page',
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.scss',
  imports: [MatListModule, MatButtonModule, RouterLink],
})
export class UploadPage {
  @ViewChild('fileUpload') fileUpload!: ElementRef;
  private pinpalService = inject(PinpalService);
  private pageTitleService = inject(PageTitleService);
  status = signal('Loading...');
  weeks = signal<Week[]>([]);

  constructor() {
    this.pageTitleService.setTitle('Upload Database');
  }

  gameScores(week: Week): string {
    return week.games.map((g) => g.score).join(', ');
  }

  async ngOnInit() {
    await this.loadData();
    this.status.set(this.pinpalService.status);
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    try {
      await this.pinpalService.importDatabase(file);
      this.status.set('Imported database');
      await this.loadData();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import PinPal database');
    }
  }

  async loadData() {
    const weeks = await this.pinpalService.loadWeeks(4);
    this.weeks.set([...weeks.values()]);
  }

  onUploadClick() {
    this.fileUpload.nativeElement.click();
  }
}
