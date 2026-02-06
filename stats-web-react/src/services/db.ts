import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface DatabaseData {
  title: string;
  data: Uint8Array<ArrayBuffer>;
}

export class AppDB extends Dexie {
  databaseFiles!: Table<DatabaseData, number>;

  constructor() {
    super('pinpal-data');
    this.version(1).stores({
      databaseFiles: 'title',
    });
  }
}

export const appDB = new AppDB();
