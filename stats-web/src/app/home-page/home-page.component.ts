import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Game } from '@core/services/pinpal.model';
import { PinpalService } from '@core/services/pinpal.service';
import { PageTitleService } from '@core/services/page-title.service';
import { RouterLink } from '@angular/router';
import { GamesOverview } from '../shared/components/games-overview.component';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  imports: [GamesOverview, MatCardModule, MatButtonModule, RouterLink, MatFormFieldModule, MatInputModule],
})
export class HomePage {
  public pinpalService = inject(PinpalService);
  private pageTitleService = inject(PageTitleService);
  loading = signal(true);
  existingData = signal(false);
  games = signal<Game[]>([]);
  gamesLimit = signal<number>(30);

  constructor() {
    this.pageTitleService.setTitle('Home');
    const savedLimit = localStorage.getItem('homePageGamesLimit');
    if (savedLimit) {
      const parsedLimit = parseInt(savedLimit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        this.gamesLimit.set(parsedLimit);
      }
    }
  }

  async ngOnInit() {
    await this.loadData();
    this.loading.set(false);
  }

  async loadData() {
    const games = await this.pinpalService.loadGames({
      limit: this.gamesLimit(),
    });
    if (games.length == 0) {
      return;
    }
    this.existingData.set(true);
    this.games.set(games);
  }

  onGamesLimitChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    if (isNaN(value) || value < 1) {
      value = 1;
      input.value = '1';
    }

    this.gamesLimit.set(value);
    localStorage.setItem('homePageGamesLimit', value.toString());
    this.loadData();
  }
}
