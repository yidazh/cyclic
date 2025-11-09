import type { PeriodFilter, TimePeriod } from "@/types";

/**
 * Storage Service
 * Manages SQLite Wasm database connection and CRUD operations
 */
export class StorageService {
	private promiser: any = null;
	private dbId: string = "";
	private initialized = false;

	/**
	 * Initialize SQLite database
	 * Sets up connection and creates schema if needed
	 */
	async init(): Promise<void> {
		if (this.initialized) return;

		try {
			console.log("Loading and initializing SQLite3 module...");

			// Dynamic import to avoid SSR issues
			const { sqlite3Worker1Promiser } = await import(
				"@sqlite.org/sqlite-wasm"
			);

			// Initialize SQLite worker with promiser
			this.promiser = await new Promise((resolve) => {
				const _promiser = sqlite3Worker1Promiser({
					onready: () => resolve(_promiser),
				});
			});

			console.log("Done initializing. Running demo...");

			// Get SQLite version info
			const configResponse = await this.promiser("config-get", {});
			console.log(
				"Running SQLite3 version",
				configResponse.result.version.libVersion,
			);

			// Open database with OPFS for persistence
			const openResponse = await this.promiser("open", {
				filename: "file:timetracking.db?vfs=opfs",
			});

			this.dbId = openResponse.dbId;
			console.log(
				"OPFS is available, created persisted database at",
				openResponse.result.filename.replace(/^file:(.*?)\?vfs=opfs$/, "$1"),
			);

			// Initialize schema
			await this.initSchema();
			this.initialized = true;
		} catch (error) {
			console.error("Failed to initialize storage:", error);
			throw error;
		}
	}

	/**
	 * Initialize database schema
	 */
	private async initSchema(): Promise<void> {
		// Check if schema exists
		const result = await this.promiser("exec", {
			dbId: this.dbId,
			sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='metadata'",
			returnValue: "resultRows",
		});

		if (result.result.resultRows.length === 0) {
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

			await this.promiser("exec", {
				dbId: this.dbId,
				sql: schema,
			});
			console.log("Database schema initialized");
		}
	}

	/**
	 * Save or update a period
	 */
	async savePeriod(period: TimePeriod): Promise<void> {
		this.ensureInitialized();

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

		try {
			await this.promiser("exec", {
				dbId: this.dbId,
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
					period.updatedAt,
				],
			});
		} catch (error) {
			console.error("Failed to save period:", error);
			throw new Error(`Failed to save period: ${error}`);
		}
	}

	/**
	 * Get a single period by ID
	 */
	async getPeriod(id: string): Promise<TimePeriod | null> {
		this.ensureInitialized();

		try {
			const result = await this.promiser("exec", {
				dbId: this.dbId,
				sql: "SELECT * FROM periods WHERE id = ?",
				bind: [id],
				returnValue: "resultRows",
				rowMode: "object",
			});

			if (result.result.resultRows.length === 0) return null;

			return this.rowToPeriod(result.result.resultRows[0]);
		} catch (error) {
			console.error("Failed to get period:", error);
			throw new Error(`Failed to get period: ${error}`);
		}
	}

	/**
	 * Get periods with optional filtering
	 */
	async getPeriods(filter?: PeriodFilter): Promise<TimePeriod[]> {
		this.ensureInitialized();

		let sql = "SELECT * FROM periods WHERE 1=1";
		const params: any[] = [];

		if (filter?.startTime) {
			sql += " AND startTime >= ?";
			params.push(filter.startTime);
		}

		if (filter?.endTime) {
			sql += " AND endTime <= ?";
			params.push(filter.endTime);
		}

		if (filter?.theme) {
			sql += " AND theme = ?";
			params.push(filter.theme);
		}

		if (filter?.category) {
			sql += " AND category = ?";
			params.push(filter.category);
		}

		if (filter?.isPaused !== undefined) {
			sql += " AND isPaused = ?";
			params.push(filter.isPaused ? 1 : 0);
		}

		sql += " ORDER BY startTime DESC";

		try {
			const result = await this.promiser("exec", {
				dbId: this.dbId,
				sql,
				bind: params,
				returnValue: "resultRows",
				rowMode: "object",
			});

			return result.result.resultRows.map((row: any) => this.rowToPeriod(row));
		} catch (error) {
			console.error("Failed to get periods:", error);
			return [];
		}
	}

	/**
	 * Get the active period (endTime is null)
	 */
	async getActivePeriod(): Promise<TimePeriod | null> {
		this.ensureInitialized();

		try {
			const result = await this.promiser("exec", {
				dbId: this.dbId,
				sql: "SELECT * FROM periods WHERE endTime IS NULL ORDER BY startTime DESC LIMIT 1",
				returnValue: "resultRows",
				rowMode: "object",
			});

			if (result.result.resultRows.length === 0) return null;

			return this.rowToPeriod(result.result.resultRows[0]);
		} catch (error) {
			console.error("Failed to get active period:", error);
			return null;
		}
	}

	/**
	 * Delete a period
	 */
	async deletePeriod(id: string): Promise<void> {
		this.ensureInitialized();

		try {
			await this.promiser("exec", {
				dbId: this.dbId,
				sql: "DELETE FROM periods WHERE id = ?",
				bind: [id],
			});
		} catch (error) {
			console.error("Failed to delete period:", error);
			throw new Error(`Failed to delete period: ${error}`);
		}
	}

	/**
	 * Get configuration value
	 */
	async getConfig(key: string): Promise<any> {
		this.ensureInitialized();

		try {
			const result = await this.promiser("exec", {
				dbId: this.dbId,
				sql: "SELECT value FROM config WHERE key = ?",
				bind: [key],
				returnValue: "resultRows",
				rowMode: "object",
			});

			if (result.result.resultRows.length === 0) return null;

			return JSON.parse(result.result.resultRows[0].value);
		} catch (error) {
			console.error("Failed to get config:", error);
			return null;
		}
	}

	/**
	 * Save configuration value
	 */
	async saveConfig(key: string, value: any): Promise<void> {
		this.ensureInitialized();

		try {
			await this.promiser("exec", {
				dbId: this.dbId,
				sql: `
          INSERT INTO config (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `,
				bind: [key, JSON.stringify(value)],
			});
		} catch (error) {
			console.error("Failed to save config:", error);
			throw new Error(`Failed to save config: ${error}`);
		}
	}

	/**
	 * Execute transaction
	 */
	async transaction<T>(callback: () => Promise<T>): Promise<T> {
		this.ensureInitialized();

		await this.promiser("exec", {
			dbId: this.dbId,
			sql: "BEGIN TRANSACTION",
		});

		try {
			const result = await callback();
			await this.promiser("exec", {
				dbId: this.dbId,
				sql: "COMMIT",
			});
			return result;
		} catch (error) {
			await this.promiser("exec", {
				dbId: this.dbId,
				sql: "ROLLBACK",
			});
			console.error("Transaction failed:", error);
			throw error;
		}
	}

	/**
	 * Ensure database is initialized
	 */
	private ensureInitialized(): void {
		if (!this.initialized || !this.promiser) {
			throw new Error("Storage service not initialized. Call init() first.");
		}
	}

	/**
	 * Get storage estimate (OPFS)
	 */
	async getStorageEstimate(): Promise<StorageEstimate> {
		if ("storage" in navigator && "estimate" in navigator.storage) {
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
			tags: JSON.parse(row.tags || "[]"),
			isPaused: row.isPaused === 1,
			resumeFromPeriodId: row.resumeFromPeriodId,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};
	}
}

// Singleton instance
export const storageService = new StorageService();
