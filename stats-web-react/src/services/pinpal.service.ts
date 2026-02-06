import type { Database, SqlJsStatic } from 'sql.js';
import { appDB } from './db';
import type { Game, LeagueOverview, Week, BallStats, MonthlyStats } from './pinpal.model';
import type { GameQueryOptions, LeagueQueryOptions } from './pinpal-query.model';

// Shared stats model from Angular app
export interface Stats {
  average: number;
  high: number;
  count: number;
  cleanCount: number;
  strikesPercent: number;
  pocketHitsPercent: number;
  opensPercent: number;
  sparesPercent: number;
  singlePinPickupPercent: number;
  gutters: number;
}

// Declare global initSqlJs function loaded from script
declare global {
  interface Window {
    initSqlJs?: (config?: { locateFile: (file: string) => string }) => Promise<SqlJsStatic>;
  }
}

export class PinpalService {
  private SQL: SqlJsStatic | undefined;
  private initPromise: Promise<void> | null = null;
  public sqlDB: Database | undefined;
  public loaded = false;
  public status = '';
  public pinCombos: PinCombo[] = [];

  private async initialize() {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        this.SQL = await window.initSqlJs!({
          locateFile: (file: string) =>
            `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`,
        });
        const file = await appDB.databaseFiles.get({
          title: 'main',
        });
        if (file) {
          this.status = 'Found existing database';
          await this.loadData(file.data);
        } else {
          this.status = 'No database found';
        }
        this.calculateLeaves();
      })();
    }
    await this.initPromise;
  }

  async loadLeagueOverviews(options: LeagueQueryOptions) {
    await this.initialize();
    if (!this.sqlDB) {
      return [];
    }
    const params: any[] = [];
    let sql = `SELECT
l.pk
, l.name
, l.flags
, ROUND(avg(g.score), 2) as 'average'
, count(g.score) as 'count'
, min(w.date) as 'start'
, max(w.date) as 'end'
from league l
inner join game g on g.leagueFk = l.pk
inner join week w on w.pk = g.weekFk
where 1=1`;
    if (options.leagueId) {
      sql += `
and l.pk = ?`;
      params.push(options.leagueId);
    }
    sql += `
group by
l.pk
, l.name
, l.flags`;
    if (!options.leagueId) {
      sql += `
order by
max(w.date) desc`;
    }
    const statement = this.sqlDB.prepare(sql);
    statement.bind(params);
    const leagues: LeagueOverview[] = [];
    while (statement.step()) {
      const data = statement.getAsObject();
      leagues.push({
        pk: data['pk'] as number,
        name: data['name'] as string,
        type: ((data['flags'] as number) & 1) == 1 ? 'tournament' : 'regular',
        average: data['average'] as number,
        count: data['count'] as number,
        start: new Date((data['start'] as number) * 1000),
        end: new Date((data['end'] as number) * 1000),
      });
    }
    return leagues;
  }

  async loadBallStats() {
    await this.initialize();
    if (!this.sqlDB) {
      return [];
    }

    const sql = `SELECT
  b.pk,
  b.name as 'Ball',
  count(*) / 10 as 'Games',
  ROUND(avg(f.scores & 15), 2) as 'Average',
  min(w.date) as 'Date'
FROM ball b
INNER JOIN frame f ON f.ballFk = b.pk
INNER JOIN week w ON w.pk = f.weekFk
WHERE 1=1
  AND f.flags & 1
  AND f.leagueFk > 0
GROUP BY b.pk, b.name
HAVING count(*) / 10 > 10
ORDER BY b.pk DESC`;

    const statement = this.sqlDB.prepare(sql);
    const ballStats: BallStats[] = [];

    while (statement.step()) {
      const data = statement.getAsObject();
      ballStats.push({
        pk: data['pk'] as number,
        name: data['Ball'] as string,
        games: data['Games'] as number,
        average: data['Average'] as number,
        firstUsed: new Date((data['Date'] as number) * 1000),
      });
    }

    statement.free();
    return ballStats;
  }

  private calculatePercent(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return Math.round((numerator / denominator) * 100);
  }

  async loadMonthlyStats() {
    await this.initialize();
    if (!this.sqlDB) {
      return [];
    }

    const sql = `SELECT
  STRFTIME('%Y-%m', DATETIME(w.date, 'unixepoch')) as 'date',
  CAST(AVG(averageScore._avg) as int) as 'averageScore',
  SUM(strikes._cnt) as 'strikeCount',
  SUM(allFrames._cnt) as 'allFrameCount',
  SUM(IFNULL(pocketHitsNoStrike._cnt, 0)) as 'pocketHitNoStrikeCount',
  SUM(opens._cnt) as 'openCount',
  SUM(pickedUpSpares._cnt) as 'pickedUpSpareCount',
  SUM(potentialSpares._cnt) as 'potentialSpareCount',
  SUM(pickedUpsinglePinSpares._cnt) as 'singlePinSparePickupCount',
  SUM(singlePinSpares._cnt) as 'singlePinSpareCount',
  SUM(IFNULL(gutters._cnt, 0)) as 'gutters'
FROM league l
INNER JOIN week w on w.leagueFk = l.pk
INNER JOIN (
  SELECT
    g.weekFk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.scores & 15 = 10
  GROUP BY g.weekFk
) as strikes on strikes.weekFk = w.pk
INNER JOIN (
  SELECT
    g.weekFk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.flags & 1 = 1
    AND f.scores >> 4 < 10
    AND f.flags & 2
  GROUP BY g.weekFk
) as opens on opens.weekFk = w.pk
INNER JOIN (
  SELECT
    g.weekFk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.flags & 1 = 1
  GROUP BY g.weekFk
) as allFrames on allFrames.weekFk = w.pk
INNER JOIN (
  SELECT
    g.weekFk,
    avg(g.score) as _avg
  FROM game g
  GROUP BY g.weekFk
) as averageScore on averageScore.weekFk = w.pk
INNER JOIN (
  SELECT
    g.weekFk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.scores & 15 < 10
    AND f.frameNum <= 10
    AND f.flags & 1
    AND f.flags & 2
  GROUP BY g.weekFk
) as potentialSpares on potentialSpares.weekFk = w.pk
INNER JOIN (
  SELECT
    g.weekFk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.scores & 15 < 10
    AND f.flags & 1
    AND f.flags & 2
    AND f.scores >> 4 = 10
  GROUP BY g.weekFk
) as pickedUpSpares on pickedUpSpares.weekFk = w.pk
INNER JOIN (
  SELECT
    g.weekFk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.scores & 15 = 9
    AND f.flags & 1
    AND f.flags & 2
  GROUP BY g.weekFk
) as singlePinSpares on singlePinSpares.weekFk = w.pk
INNER JOIN (
  SELECT
    g.weekFk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.scores & 15 = 9
    AND f.flags & 1
    AND f.flags & 2
    AND f.scores >> 4 = 10
  GROUP BY g.weekFk
) as pickedUpsinglePinSpares on pickedUpsinglePinSpares.weekFk = w.pk
LEFT JOIN (
  SELECT
    g.weekFk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.pins >> 6 > 0 and f.pins & 0x3F = 0
  GROUP BY g.weekFk
) as pocketHitsNoStrike on pocketHitsNoStrike.weekFk = w.pk
INNER JOIN (
  SELECT
    g.weekFk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.scores & 15 = 9
    AND f.flags & 1
    AND f.flags & 2
    AND f.scores >> 4 = 10
  GROUP BY g.weekFk
) as pickedUpsinglePinSpares on pickedUpsinglePinSpares.weekFk = w.pk
LEFT JOIN (
  SELECT
    g.weekFk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.flags & 1
    AND f.scores & 15 = 0 and f.frameNum < 11
  GROUP BY g.weekFk
) as gutters on gutters.weekFk = w.pk
GROUP BY STRFTIME('%Y-%m', DATETIME(w.date, 'unixepoch'))
ORDER BY w.date DESC`;

    const statement = this.sqlDB.prepare(sql);
    const monthlyStats: MonthlyStats[] = [];

    while (statement.step()) {
      const data = statement.getAsObject();

      const strikeCount = data['strikeCount'] as number;
      const allFrameCount = data['allFrameCount'] as number;
      const pocketHitNoStrikeCount = data['pocketHitNoStrikeCount'] as number;
      const openCount = data['openCount'] as number;
      const pickedUpSpareCount = data['pickedUpSpareCount'] as number;
      const potentialSpareCount = data['potentialSpareCount'] as number;
      const singlePinSparePickupCount = data['singlePinSparePickupCount'] as number;
      const singlePinSpareCount = data['singlePinSpareCount'] as number;

      monthlyStats.push({
        date: data['date'] as string,
        averageScore: data['averageScore'] as number,
        strikesPercent: this.calculatePercent(strikeCount, allFrameCount),
        pocketHitsPercent: this.calculatePercent(
          strikeCount + pocketHitNoStrikeCount,
          allFrameCount,
        ),
        opensPercent: this.calculatePercent(openCount, allFrameCount),
        sparesPercent: this.calculatePercent(pickedUpSpareCount, potentialSpareCount),
        singlePinPickupPercent: this.calculatePercent(
          singlePinSparePickupCount,
          singlePinSpareCount,
        ),
        gutters: (data['gutters'] as number) || 0,
      });
    }

    statement.free();
    return monthlyStats;
  }

  async loadGames(options: GameQueryOptions) {
    await this.initialize();
    if (!this.sqlDB) {
      return [];
    }
    let sql = `SELECT
g.score
, w.date
, g.pk
from week w
inner join game g on g.weekFk = w.pk
where 1=1`;
    const params: any[] = [];
    if (options.leagueId) {
      sql += `
and w.leagueFk = ?`;
      params.push(options.leagueId);
    } else {
      sql += `
and w.leagueFk >= 0`;
    }
    sql += `
order by
w.date desc
, g.pk`;
    if (options.limit) {
      sql += `
limit ?`;
      params.push(options.limit);
    }
    const statement = this.sqlDB.prepare(sql);
    statement.bind(params);
    const games: Game[] = [];
    while (statement.step()) {
      const data = statement.getAsObject();
      games.push({
        pk: data['pk'] as number,
        score: data['score'] as number,
        week: {
          date: new Date((data['date'] as number) * 1000),
          games: [],
        },
      });
    }
    return games.sort((a, b) => {
      const aDate = a.week?.date.getTime() ?? 0;
      const bDate = b.week?.date.getTime() ?? 0;
      if (aDate == aDate) {
        return a.pk - b.pk;
      }
      return aDate - bDate;
    });
  }

  async loadGameStats(games: Game[]): Promise<Stats> {
    await this.initialize();
    if (!this.sqlDB || games.length === 0) {
      return {
        average: 0,
        high: 0,
        count: 0,
        cleanCount: 0,
        strikesPercent: 0,
        pocketHitsPercent: 0,
        opensPercent: 0,
        sparesPercent: 0,
        singlePinPickupPercent: 0,
        gutters: 0,
      };
    }

    const placeholders = games.map(() => '?').join(',');
    const params = games.map((g: Game) => g.pk);

    const query = `SELECT
  avg(g.score) as 'average',
  max(g.score) as 'high',
  count(g.pk) as 'count',
  sum(case when g.flags & 4 = 4 then 1 else 0 end) as 'clean_count',
  sum(strikes._cnt) as 'strike_count',
  sum(all_frames._cnt) as 'all_frame_count',
  sum(IFNULL(pocket_hits_no_strike._cnt, 0)) as 'pocket_hit_no_strike_count',
  sum(opens._cnt) as 'open_count',
  sum(picked_up_spares._cnt) as 'picked_up_spare_count',
  sum(potential_spares._cnt) as 'potential_spare_count',
  sum(picked_up_single_pin_spares._cnt) as 'single_pin_spare_pickup_count',
  sum(single_pin_spares._cnt) as 'single_pin_spare_count',
  sum(IFNULL(gutters._cnt, 0)) as 'gutters'
FROM game g
LEFT JOIN (
  SELECT
    g.pk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.scores & 15 = 10
  GROUP BY g.pk
) as strikes ON strikes.pk = g.pk
INNER JOIN (
  SELECT
    g.pk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.flags & 1 = 1
  GROUP BY g.pk
) as all_frames ON all_frames.pk = g.pk
LEFT JOIN (
  SELECT
    g.pk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.flags & 1 = 1
    AND f.scores >> 4 < 10
    AND f.flags & 2
  GROUP BY g.pk
) as opens ON opens.pk = g.pk
LEFT JOIN (
  SELECT
    g.pk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.scores & 15 < 10
    AND f.frameNum <= 10
    AND f.flags & 1
    AND f.flags & 2
  GROUP BY g.pk
) as potential_spares ON potential_spares.pk = g.pk
LEFT JOIN (
  SELECT
    g.pk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.scores & 15 < 10
    AND f.flags & 1
    AND f.flags & 2
    AND f.scores >> 4 = 10
  GROUP BY g.pk
) as picked_up_spares ON picked_up_spares.pk = g.pk
LEFT JOIN (
  SELECT
    g.pk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.scores & 15 = 9
    AND f.flags & 1
    AND f.flags & 2
  GROUP BY g.pk
) as single_pin_spares ON single_pin_spares.pk = g.pk
LEFT JOIN (
  SELECT
    g.pk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.scores & 15 = 9
    AND f.flags & 1
    AND f.flags & 2
    AND f.scores >> 4 = 10
  GROUP BY g.pk
) as picked_up_single_pin_spares ON picked_up_single_pin_spares.pk = g.pk
LEFT JOIN (
  SELECT
    g.pk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.pins >> 6 > 0 and f.pins & 0x3F = 0
  GROUP BY g.pk
) as pocket_hits_no_strike ON pocket_hits_no_strike.pk = g.pk
LEFT JOIN (
  SELECT
    g.pk,
    count(*) as _cnt
  FROM game g
  INNER JOIN frame f on f.gameFk = g.pk
  WHERE f.flags & 1
    AND f.scores & 15 = 0 and f.frameNum < 11
  GROUP BY g.pk
) as gutters ON gutters.pk = g.pk
WHERE g.pk IN (${placeholders})`;

    const statement = this.sqlDB.prepare(query);
    const result = statement.getAsObject(params);
    statement.free();

    const strikeCount = (result['strike_count'] as number) || 0;
    const allFrameCount = (result['all_frame_count'] as number) || 0;
    const pocketHitNoStrikeCount = (result['pocket_hit_no_strike_count'] as number) || 0;
    const openCount = (result['open_count'] as number) || 0;
    const pickedUpSpareCount = (result['picked_up_spare_count'] as number) || 0;
    const potentialSpareCount = (result['potential_spare_count'] as number) || 0;
    const singlePinSparePickupCount = (result['single_pin_spare_pickup_count'] as number) || 0;
    const singlePinSpareCount = (result['single_pin_spare_count'] as number) || 0;

    return {
      average: Math.round(((result['average'] as number) || 0) * 100) / 100,
      high: (result['high'] as number) || 0,
      count: (result['count'] as number) || 0,
      cleanCount: (result['clean_count'] as number) || 0,
      strikesPercent: this.calculatePercent(strikeCount, allFrameCount),
      pocketHitsPercent: this.calculatePercent(strikeCount + pocketHitNoStrikeCount, allFrameCount),
      opensPercent: this.calculatePercent(openCount, allFrameCount),
      sparesPercent: this.calculatePercent(pickedUpSpareCount, potentialSpareCount),
      singlePinPickupPercent: this.calculatePercent(singlePinSparePickupCount, singlePinSpareCount),
      gutters: (result['gutters'] as number) || 0,
    };
  }

  async loadWeeks(count: number) {
    await this.initialize();
    const weeks = new Map<number, Week>();
    if (!this.sqlDB) {
      return weeks;
    }
    const statement = this.sqlDB.prepare(`SELECT
w.date
, w.pk as 'week_pk'
, g.score
, g.pk as 'game_pk'
from week w
inner join (
	SELECT
	w.pk
	from week w
	order by w.date desc
	limit :count
) as sub on sub.pk = w.pk
inner join game g on g.weekFk = w.pk
order by
w.date desc
, g.pk;`);
    statement.bind({ ':count': count });
    while (statement.step()) {
      const data = statement.getAsObject();
      const weekId = data['week_pk'] as number;
      if (!weeks.has(weekId)) {
        weeks.set(weekId, {
          date: new Date((data['date'] as number) * 1000),
          games: [],
        });
      }
      weeks.get(weekId)?.games.push({
        score: data['score'] as number,
        pk: data['game_pk'] as number,
      });
    }
    statement.free();
    return weeks;
  }

  private async loadData(data: Uint8Array) {
    if (this.sqlDB) {
      this.sqlDB.close();
    }
    this.sqlDB = new this.SQL!.Database(data);
    this.loaded = true;
    this.status = 'Loaded existing database';
  }

  async importDatabase(file: File): Promise<void> {
    await this.initialize();
    const arrayBuffer = await file.arrayBuffer();
    const rawData = new Uint8Array(arrayBuffer);
    const startPosition = this.findStartPosition(rawData);
    if (startPosition < 0) {
      throw new Error('Could not find the SQLite start');
    }
    const sqliteData = rawData.subarray(startPosition + 1);
    appDB.databaseFiles.put({
      title: 'main',
      data: sqliteData,
    });
    await this.loadData(sqliteData);
  }

  private findStartPosition(rawData: Uint8Array): number {
    let index = 0;
    let currentByte = rawData[index];
    const searchString = 'SQLite format 3';
    let currentSearchIndex = 0;
    while (currentByte >= 0) {
      const character = String.fromCharCode(currentByte);
      if (character === searchString[currentSearchIndex]) {
        currentSearchIndex++;
      } else if (currentSearchIndex > 0) {
        currentSearchIndex = 0;
      }
      if (currentSearchIndex >= searchString.length) {
        return index - searchString.length;
      }
      index++;
      currentByte = rawData[index];
    }

    return -1;
  }

  private calculateLeaves() {
    const adjacency = [
      [2, 3],
      [4, 5, 8],
      [5, 6, 9],
      [7, 8],
      [8, 9],
      [9, 10],
    ];
    for (var pinComboNumber = 1; pinComboNumber < 1024; pinComboNumber++) {
      const pinCombo: PinCombo = {
        type: 'regular',
        value: pinComboNumber,
      };
      this.pinCombos.push(pinCombo);
      if (
        pinComboNumber == 1 ||
        pinComboNumber == 2 ||
        pinComboNumber == 4 ||
        pinComboNumber == 8 ||
        pinComboNumber == 16 ||
        pinComboNumber == 32 ||
        pinComboNumber == 64 ||
        pinComboNumber == 128 ||
        pinComboNumber == 256 ||
        pinComboNumber == 512
      ) {
        pinCombo.type = 'single';
        continue;
      } else if (pinComboNumber & 1) {
        // Head pin
        continue;
      }
      // Starting at 1 to skip the head pin
      let bitOffset = 1;
      const standingPins = pinComboNumber.toString(2).replaceAll('0', '').length;
      while (bitOffset < 10) {
        const pinValue = (pinComboNumber >> bitOffset) & 1;
        if (pinValue == 0) {
          bitOffset++;
          continue;
        }
        const q: number[] = [bitOffset];
        let pinCounter = 0;
        while (q.length > 0) {
          const nextBitOffset = q.shift()!;
          const nextPinValue = (pinComboNumber >> nextBitOffset) & 1;
          if (nextPinValue == 0) {
            continue;
          }
          pinCounter++;
          if (nextBitOffset > 5) {
            continue;
          }
          const connectedPins = adjacency[nextBitOffset];
          connectedPins.forEach((cp) => {
            const adjusted = cp - 1;
            if (!q.includes(adjusted)) {
              q.push(adjusted);
            }
          });
        }
        if (pinCounter < standingPins) {
          pinCombo.type = 'split';
        }
        break;
      }
    }
  }
}

export interface PinCombo {
  type: LeaveType;
  value: number;
}

export type LeaveType = 'regular' | 'single' | 'split';
