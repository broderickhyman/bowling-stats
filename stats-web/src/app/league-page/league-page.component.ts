import { Component, inject, signal } from '@angular/core';
import { Game } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { GamesOverview } from 'app/shared/components/games-overview.component';

@Component({
  selector: 'league-page',
  templateUrl: './league-page.component.html',
  styleUrl: './league-page.component.scss',
  imports: [GamesOverview, MatTabsModule],
})
export class LeaguePage {
  router = inject(Router);
  public pinpalService = inject(PinpalService);
  activatedRoute = inject(ActivatedRoute);
  games = signal<Game[]>([]);

  constructor() {
    this.activatedRoute.params.subscribe(async (params) => {
      const games = await this.pinpalService.loadGames({
        leagueId: params['id'],
      });
      if (games.length == 0) {
        await this.router.navigate(['/leagues']);
        return;
      }
      this.games.set(games);
    });
  }
}
