import { Component, inject, signal } from '@angular/core';
import { Game, LeagueOverview } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { GamesOverview } from 'app/shared/components/games-overview.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'league-page',
  templateUrl: './league-page.component.html',
  styleUrl: './league-page.component.scss',
  imports: [GamesOverview, MatTabsModule, DatePipe],
})
export class LeaguePage {
  router = inject(Router);
  public pinpalService = inject(PinpalService);
  activatedRoute = inject(ActivatedRoute);
  games = signal<Game[]>([]);
  overview = signal<LeagueOverview | null>(null);

  constructor() {
    this.activatedRoute.params.subscribe(async (params) => {
      const id = params['id'];
      const overview = await this.pinpalService.loadLeagueOverviews({
        leagueId: id,
      });
      this.overview.set(overview[0]);
      const games = await this.pinpalService.loadGames({
        leagueId: id,
      });
      if (games.length == 0) {
        await this.router.navigate(['/leagues']);
        return;
      }
      this.games.set(games);
    });
  }
}
