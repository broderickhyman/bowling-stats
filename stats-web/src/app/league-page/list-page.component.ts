import { Component, inject, signal } from '@angular/core';
import { LeagueOverview } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';
import { LeagueOverviewCard } from './overview-card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'league-list-page',
  templateUrl: './list-page.component.html',
  styleUrl: './list-page.component.scss',
  imports: [LeagueOverviewCard],
})
export class LeagueListPage {
  public pinpalService = inject(PinpalService);
  leagues = signal<LeagueOverview[]>([]);
  tournaments = signal<LeagueOverview[]>([]);

  constructor(private router: Router) {}

  async ngOnInit() {
    const all = await this.pinpalService.loadLeagueOverviews();
    if (all.length == 0) {
      await this.router.navigate(['/upload']);
      return;
    }
    const leagues = all.filter((l) => l.type == 'regular');
    const tournaments = all.filter((l) => l.type == 'tournament');
    this.leagues.set(leagues);
    this.tournaments.set(tournaments);
  }
}
