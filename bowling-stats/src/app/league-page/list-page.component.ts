import { Component, inject } from '@angular/core';
import { PinpalService } from '@core/services/pinpal.service';

@Component({
  selector: 'league-list-page',
  templateUrl: './list-page.component.html',
})
export class LeagueListPage {
  public pinpalService = inject(PinpalService);
}
