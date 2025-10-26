export interface Week {
  date: Date;
  games: Game[];
}

export interface Game {
  pk: number;
  week?: Week;
  score: number;
}
