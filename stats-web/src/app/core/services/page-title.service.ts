import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PageTitleService {
  private readonly _title = signal('Bowling Stats');

  // Expose readonly signal for consumers
  public readonly title = this._title.asReadonly();

  /**
   * Sets the page title
   */
  setTitle(title: string): void {
    this._title.set(title);
  }

  /**
   * Resets to the default title
   */
  resetTitle(): void {
    this._title.set('Bowling Stats');
  }
}
