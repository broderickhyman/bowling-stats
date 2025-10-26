import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'stat-card',
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  imports: [MatCardModule],
})
export class StatCard {
  value = input.required<number>();
  displayText = input.required<string>();
}
