import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'stat-card',
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  imports: [MatCardModule, DecimalPipe],
})
export class StatCard {
  displayText = input.required<string>();
  value = input.required<number>();
}
