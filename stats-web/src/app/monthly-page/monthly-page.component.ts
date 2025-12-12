import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { PinpalService } from '@core/services/pinpal.service';
import { MonthlyStats } from '@core/services/pinpal.model';

@Component({
  selector: 'monthly-page',
  templateUrl: './monthly-page.component.html',
  styleUrl: './monthly-page.component.scss',
  imports: [MatTableModule, MatSortModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyPage {
  private router = inject(Router);
  private pinpalService = inject(PinpalService);

  monthlyStats = signal<MonthlyStats[]>([]);
  sortedStats = signal<MonthlyStats[]>([]);

  displayedColumns: string[] = [
    'date',
    'averageScore',
    'strikesPercent',
    'pocketHitsPercent',
    'opensPercent',
    'sparesPercent',
    'singlePinPickupPercent',
    'gutters',
  ];

  async ngOnInit() {
    const stats = await this.pinpalService.loadMonthlyStats();

    if (stats.length === 0) {
      await this.router.navigate(['/upload']);
      return;
    }

    this.monthlyStats.set(stats);
    this.sortedStats.set(stats);
  }

  onSortChange(sort: Sort) {
    const data = this.monthlyStats().slice();

    if (!sort.active || sort.direction === '') {
      this.sortedStats.set(data);
      return;
    }

    const sorted = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      const aValue = a[sort.active as keyof MonthlyStats];
      const bValue = b[sort.active as keyof MonthlyStats];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return isAsc ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    this.sortedStats.set(sorted);
  }
}
