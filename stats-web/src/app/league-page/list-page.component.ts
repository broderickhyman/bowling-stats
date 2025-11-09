import { Component, inject, signal } from '@angular/core';
import { LeagueOverview } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';

@Component({
  selector: 'league-list-page',
  templateUrl: './list-page.component.html',
})
export class LeagueListPage {
  public pinpalService = inject(PinpalService);
  leagues = signal<LeagueOverview[]>([]);
  tournaments = signal<LeagueOverview[]>([]);

  async ngOnInit() {
    const all = await this.pinpalService.loadLeagueOverviews();
    const leagues = all.filter((l) => l.type == 'regular');
    const tournaments = all.filter((l) => l.type == 'tournament');
    this.leagues.set(leagues);
    this.tournaments.set(tournaments);
  }
}
