export interface Week {
  date: Date;
  games: Game[];
}

export interface Game {
  pk: number;
  week?: Week;
  score: number;
}

export interface League {
  pk: number;
  name: string;
  type: 'regular' | 'tournament';
}

export interface LeagueOverview extends League {
  average: number;
  count: number;
  start: Date;
  end: Date;
}

export interface BallStats {
  pk: number;
  name: string;
  games: number;
  average: number;
  firstUsed: Date;
}
