import { Component, Input, inject, signal } from '@angular/core';
import { PinpalService } from '@core/services/pinpal.service';

@Component({
  selector: 'upload-page',
  templateUrl: './upload-page.component.html',
})
export class UploadPage {
  private pinpalService = inject(PinpalService);
  status = signal('Loading...');

  async ngOnInit() {
    await this.pinpalService.loadExisting(this.status);
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
  }
}
