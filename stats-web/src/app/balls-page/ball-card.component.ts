import { Component, input } from '@angular/core';
import { BallStats } from '@core/services/pinpal.model';
import { MatCardModule } from '@angular/material/card';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'ball-card',
  templateUrl: './ball-card.component.html',
  styleUrl: './ball-card.component.scss',
  imports: [DatePipe, DecimalPipe, MatCardModule],
})
export class BallCard {
  ballStats = input.required<BallStats>();
}
