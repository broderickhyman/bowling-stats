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
}
