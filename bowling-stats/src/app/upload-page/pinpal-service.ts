import { Injectable } from '@angular/core';
import initSqlJs from 'sql.js';

@Injectable({
  providedIn: 'root',
})
export class PinpalService {
  private SQL: initSqlJs.SqlJsStatic | undefined;

  async initialize() {
    if (!this.SQL) {
      this.SQL = await initSqlJs({
        locateFile: (file) => `assets/sql-wasm/${file}`,
      });
    }
  }

  async importDatabase(file: File): Promise<void> {
    await this.initialize();

    const arrayBuffer = await file.arrayBuffer();
    const rawData = new Uint8Array(arrayBuffer);
    console.log(rawData);
    const startPosition = this.findStartPosition(rawData);
    if (startPosition < 0) {
      throw new Error('Could not find the SQLite start');
    }
    const sqliteData = rawData.subarray(startPosition);
    console.log(sqliteData);
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
