import { Injectable, WritableSignal, inject } from '@angular/core';
import type { Database, SqlJsStatic } from 'sql.js';
import { AppDB } from './db.service';

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
  private appDB = inject(AppDB);
  public sqlDB: Database | undefined;
  public loaded = false;
  public status = '';
  private splits: PinCombo[] = [];
  public pinCombos: PinCombo[] = [];

  async initialize() {
    if (!this.SQL) {
      this.SQL = await window.initSqlJs!({
        locateFile: (file: string) => `assets/sql-wasm/${file}`,
      });
    }
    await this.loadExisting();
  }

  async loadExisting() {
    if (this.loaded) {
      return;
    }
    const file = await this.appDB.databaseFiles.get({
      title: 'main',
    });
    if (file) {
      this.status = 'Found existing database';
      await this.loadData(file.data);
    } else {
      this.status = 'No database found';
    }
  }

  private async loadData(data: Uint8Array) {
    if (this.sqlDB) {
      this.sqlDB.close();
    }
    this.sqlDB = new this.SQL!.Database(data);
    this.calculateSplits();
    this.loaded = true;
  }

  async importDatabase(statusUpdate: WritableSignal<string>, file: File): Promise<void> {
    statusUpdate.set('Importing file');
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
    statusUpdate.set('Database loaded');
  }

  findStartPosition(rawData: Uint8Array): number {
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

  calculateSplits() {
    const adjacency = [
      [2, 3],
      [1, 4, 5],
      [1, 5, 6],
      [2, 7, 8],
      [2, 3, 8, 9],
      [3, 9, 10],
      [4],
      [4, 5],
      [5, 6],
      [6],
    ];
    for (var pinComboNumber = 1; pinComboNumber < 1024; pinComboNumber++) {
      // for (var pinCombo = 1; pinCombo < 16; pinCombo++) {
      if (pinComboNumber & 1) {
        // Head pin
        continue;
      } else if (
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
        // Single pin
        continue;
      }
      // console.log('  ' + pinCombo.toString(2).padStart(10, '0'));
      // Starting at 1 to skip the head pin
      let bitOffset = 1;
      let split = false;
      while (bitOffset < 10) {
        const pinValue = (pinComboNumber >> bitOffset) & 1;
        if (pinValue == 0) {
          bitOffset++;
          continue;
        }
        // console.log(bitOffset);
        const connectedPins = adjacency[bitOffset];
        // console.log(connectedPins);
        const foundPin = connectedPins.some((cp) => ((pinComboNumber >> (cp - 1)) & 1) == 1);
        if (!foundPin) {
          split = true;
          // console.log('Split');
          break;
        }
        bitOffset++;
      }
const pinCombo: PinCombo = {
        type: split ? 'split' : 'regular',
        value: pinComboNumber
      };
      this.pinCombos.push(pinCombo);
      if (split) {
        this.splits.push(pinCombo);
      }
    }

    this.splits.forEach((v) => console.log(v.value.toString(2).padStart(10, '0')));
    console.log(this.splits.length);
  }
}

export interface PinCombo {
type: LeaveType;
  value: number;
}

export type LeaveType = 'regular' | 'split';
