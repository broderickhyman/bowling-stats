import { Component, input } from '@angular/core';
import { LeagueOverview } from '@core/services/pinpal.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'league-overview-card',
  templateUrl: './overview-card.component.html',
  styleUrl: './overview-card.component.scss',
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule],
})
export class LeagueOverviewCard {
  leagueOverview = input.required<LeagueOverview>();
}
