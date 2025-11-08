import { TimePeriod, PeriodFilter } from '@/types';

/**
 * Storage Service
 * Manages SQLite Wasm database connection and CRUD operations
 */
export class StorageService {
  private db: any = null;
  private initialized = false;

  /**
   * Initialize SQLite database
   * Sets up connection and creates schema if needed
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Import SQLite Wasm
      const sqlite3InitModule = (await import('@sqlite.org/sqlite-wasm')).default;

      const sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });

      // Create or open database in OPFS (Origin Private File System)
      if ('opfs' in sqlite3) {
        this.db = new sqlite3.oo1.OpfsDb('/timetracking.db');
        console.log('Using OPFS for persistence');
      } else {
        // Fallback to in-memory database (data lost on reload)
        this.db = new sqlite3.oo1.DB();
        console.warn('OPFS not available, using in-memory database');
      }

      // Initialize schema
      await this.initSchema();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  /**
   * Initialize database schema
   */
  private async initSchema(): Promise<void> {
    // Check if schema exists
    const tableExists = this.db.exec({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='metadata'",
      returnValue: 'resultRows'
    });

    if (tableExists.length === 0) {
      // Create schema
      const schema = `
        CREATE TABLE periods (
          id TEXT PRIMARY KEY,
          startTime INTEGER NOT NULL,
          endTime INTEGER,
          theme TEXT,
          category TEXT,
          name TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          tags TEXT NOT NULL DEFAULT '',
          isPaused INTEGER NOT NULL DEFAULT 0,
          resumeFromPeriodId TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          FOREIGN KEY (resumeFromPeriodId) REFERENCES periods(id)
        );

        CREATE INDEX idx_periods_startTime ON periods(startTime);
        CREATE INDEX idx_periods_endTime ON periods(endTime);
        CREATE INDEX idx_periods_theme ON periods(theme);
        CREATE INDEX idx_periods_category ON periods(category);
        CREATE INDEX idx_periods_isPaused ON periods(isPaused);

        CREATE TABLE config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE TABLE metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        INSERT INTO metadata (key, value) VALUES ('schema_version', '1');
      `;

      this.db.exec(schema);
      console.log('Database schema initialized');
    }
  }

  /**
   * Save or update a period
   */
  async savePeriod(period: TimePeriod): Promise<void> {
    const sql = `
      INSERT INTO periods (
        id, startTime, endTime, theme, category, name, notes, tags,
        isPaused, resumeFromPeriodId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        endTime = excluded.endTime,
        theme = excluded.theme,
        category = excluded.category,
        name = excluded.name,
        notes = excluded.notes,
        tags = excluded.tags,
        isPaused = excluded.isPaused,
        resumeFromPeriodId = excluded.resumeFromPeriodId,
        updatedAt = excluded.updatedAt
    `;

    this.db.exec({
      sql,
      bind: [
        period.id,
        period.startTime,
        period.endTime,
        period.theme,
        period.category,
        period.name,
        period.notes,
        JSON.stringify(period.tags),
        period.isPaused ? 1 : 0,
        period.resumeFromPeriodId,
        period.createdAt,
        period.updatedAt
      ]
    });
  }

  /**
   * Get a single period by ID
   */
  async getPeriod(id: string): Promise<TimePeriod | null> {
    const result = this.db.exec({
      sql: 'SELECT * FROM periods WHERE id = ?',
      bind: [id],
      returnValue: 'resultRows',
      rowMode: 'object'
    });

    if (result.length === 0) return null;

    return this.rowToPeriod(result[0]);
  }

  /**
   * Get periods with optional filtering
   */
  async getPeriods(filter?: PeriodFilter): Promise<TimePeriod[]> {
    let sql = 'SELECT * FROM periods WHERE 1=1';
    const params: any[] = [];

    if (filter?.startTime) {
      sql += ' AND startTime >= ?';
      params.push(filter.startTime);
    }

    if (filter?.endTime) {
      sql += ' AND endTime <= ?';
      params.push(filter.endTime);
    }

    if (filter?.theme) {
      sql += ' AND theme = ?';
      params.push(filter.theme);
    }

    if (filter?.category) {
      sql += ' AND category = ?';
      params.push(filter.category);
    }

    if (filter?.isPaused !== undefined) {
      sql += ' AND isPaused = ?';
      params.push(filter.isPaused ? 1 : 0);
    }

    sql += ' ORDER BY startTime DESC';

    const rows = this.db.exec({
      sql,
      bind: params,
      returnValue: 'resultRows',
      rowMode: 'object'
    });

    return rows.map((row: any) => this.rowToPeriod(row));
  }

  /**
   * Get the active period (endTime is null)
   */
  async getActivePeriod(): Promise<TimePeriod | null> {
    const result = this.db.exec({
      sql: 'SELECT * FROM periods WHERE endTime IS NULL ORDER BY startTime DESC LIMIT 1',
      returnValue: 'resultRows',
      rowMode: 'object'
    });

    if (result.length === 0) return null;

    return this.rowToPeriod(result[0]);
  }

  /**
   * Delete a period
   */
  async deletePeriod(id: string): Promise<void> {
    this.db.exec({
      sql: 'DELETE FROM periods WHERE id = ?',
      bind: [id]
    });
  }

  /**
   * Get configuration value
   */
  async getConfig(key: string): Promise<any> {
    const result = this.db.exec({
      sql: 'SELECT value FROM config WHERE key = ?',
      bind: [key],
      returnValue: 'resultRows',
      rowMode: 'object'
    });

    if (result.length === 0) return null;

    return JSON.parse(result[0].value);
  }

  /**
   * Save configuration value
   */
  async saveConfig(key: string, value: any): Promise<void> {
    this.db.exec({
      sql: `
        INSERT INTO config (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `,
      bind: [key, JSON.stringify(value)]
    });
  }

  /**
   * Execute transaction
   */
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    this.db.exec('BEGIN TRANSACTION');

    try {
      const result = await callback();
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get storage estimate (OPFS)
   */
  async getStorageEstimate(): Promise<StorageEstimate> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate();
    }
    return { usage: 0, quota: 0 };
  }

  /**
   * Convert database row to TimePeriod object
   */
  private rowToPeriod(row: any): TimePeriod {
    return {
      id: row.id,
      startTime: row.startTime,
      endTime: row.endTime,
      theme: row.theme,
      category: row.category,
      name: row.name,
      notes: row.notes,
      tags: JSON.parse(row.tags || '[]'),
      isPaused: row.isPaused === 1,
      resumeFromPeriodId: row.resumeFromPeriodId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
}

// Singleton instance
export const storageService = new StorageService();
