import { Component, inject, signal } from '@angular/core';
import { BallStats } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';
import { PageTitleService } from '@core/services/page-title.service';
import { BallCard } from './ball-card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'balls-page',
  templateUrl: './balls-page.component.html',
  styleUrl: './balls-page.component.scss',
  imports: [BallCard],
})
export class BallsPage {
  router = inject(Router);
  pinpalService = inject(PinpalService);
  private pageTitleService = inject(PageTitleService);
  balls = signal<BallStats[]>([]);

  constructor() {
    this.pageTitleService.setTitle('Balls');
  }

  async ngOnInit() {
    const ballStats = await this.pinpalService.loadBallStats();
    if (ballStats.length == 0) {
      await this.router.navigate(['/upload']);
      return;
    }
    this.balls.set(ballStats);
  }
}
