import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

export interface DatabaseData {
  title: string;
  data: Uint8Array<ArrayBuffer>;
}

@Injectable({
  providedIn: 'root',
})
export class AppDB extends Dexie {
  databaseFiles!: Table<DatabaseData, number>;

  constructor() {
    super('pinpal-data');
    this.version(1).stores({
      databaseFiles: 'title',
    });
  }
}
