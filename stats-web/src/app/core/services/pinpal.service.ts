import { Injectable, inject } from '@angular/core';
import type { Database, SqlJsStatic } from 'sql.js';
import { AppDB } from './db.service';
import { Game, LeagueOverview, Week } from './pinpal.model';
import { Stats } from 'app/shared/components/stats.model';
import { GameQueryOptions, LeagueQueryOptions } from './pinpal-query.model';

// Declare global initSqlJs function loaded from script
declare global {
  interface Window {
    initSqlJs?: (config?: { locateFile: (file: string) => string }) => Promise<SqlJsStatic>;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PinpalService {
  private SQL: SqlJsStatic | undefined;
  private initPromise: Promise<void> | null = null;
  private appDB = inject(AppDB);
  public sqlDB: Database | undefined;
  public loaded = false;
  public status = '';
  public pinCombos: PinCombo[] = [];

  private async initialize() {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        this.SQL = await window.initSqlJs!({
          locateFile: (file: string) => `assets/sql-wasm/${file}`,
        });
        const file = await this.appDB.databaseFiles.get({
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
    if (!this.sqlDB) {
      return {
        average: 0,
        high: 0,
        count: 0,
      };
    }
    const placeholders = games.map(() => '?').join(',');
    const query = `SELECT
avg(g.score)
, max(g.score)
, count(g.score)
from game g
where g.pk in (${placeholders})`;
    const statResult = this.sqlDB.exec(
      query,
      games.map((g: Game) => g.pk),
    )[0].values[0];
    return {
      average: statResult[0] as number,
      high: statResult[1] as number,
      count: statResult[2] as number,
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
    this.appDB.databaseFiles.put({
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

    // console.log(this.splits.length);
  }
}

export interface PinCombo {
  type: LeaveType;
  value: number;
}

export type LeaveType = 'regular' | 'single' | 'split';
