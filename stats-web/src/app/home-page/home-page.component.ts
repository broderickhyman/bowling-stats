import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Game } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';
import { RouterLink } from '@angular/router';
import { GamesOverview } from '../shared/components/games-overview.component';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  imports: [GamesOverview, MatCardModule, MatButtonModule, RouterLink],
})
export class HomePage {
  public pinpalService = inject(PinpalService);
  loading = signal(true);
  existingData = signal(false);
  games = signal<Game[]>([]);

  async ngOnInit() {
    await this.loadData();
    this.loading.set(false);
  }

  async loadData() {
    const games = await this.pinpalService.loadGames({
      limit: 30,
    });
    if (games.length == 0) {
      return;
    }
    this.existingData.set(true);
    this.games.set(games);
  }
}
