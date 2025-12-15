import { Component, inject, signal } from '@angular/core';
import { Game, LeagueOverview } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';
import { PageTitleService } from '@core/services/page-title.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { GamesOverview } from '../shared/components/games-overview.component';
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
  private pageTitleService = inject(PageTitleService);
  activatedRoute = inject(ActivatedRoute);
  games = signal<Game[]>([]);
  overview = signal<LeagueOverview | null>(null);

  constructor() {
    this.pageTitleService.setTitle('League');
    this.activatedRoute.params.subscribe(async (params) => {
      const id = params['id'];
      const overview = await this.pinpalService.loadLeagueOverviews({
        leagueId: id,
      });
      this.overview.set(overview[0]);
      if (overview[0]?.name) {
        this.pageTitleService.setTitle(`League: ${overview[0].name}`);
      }
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
