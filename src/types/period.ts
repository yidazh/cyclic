/**
 * Time Period
 * Represents a single tracked time period with metadata
 */
export interface TimePeriod {
	id: string; // UUID
	startTime: number; // Unix timestamp (ms)
	endTime: number | null; // Unix timestamp (ms), null for active period
	theme: string | null; // Theme identifier
	category: string | null; // Category identifier
	name: string; // Period name/description
	notes: string; // Free-form notes
	tags: string[]; // Array of tag strings
	isPaused: boolean; // True if this is a pause period
	resumeFromPeriodId: string | null; // Reference to period to resume from (for pauses)
	createdAt: number; // Unix timestamp (ms)
	updatedAt: number; // Unix timestamp (ms)
}

/**
 * Period Filter
 * Used for querying periods from storage
 */
export interface PeriodFilter {
	startTime?: number;
	endTime?: number;
	theme?: string;
	category?: string;
	isPaused?: boolean;
	tags?: string[];
}

/**
 * Validation Result
 * Result of period continuity validation
 */
export interface ValidationResult {
	valid: boolean;
	errors: string[];
}
