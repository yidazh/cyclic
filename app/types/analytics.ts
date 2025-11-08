/**
 * Date Range
 * Used for filtering analytics by date
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Daily Summary
 * Summary statistics for a single day
 */
export interface DailySummary {
  date: Date;
  totalDuration: number;        // Total time in milliseconds
  byTheme: Map<string, number>; // Duration by theme
  byCategory: Map<string, number>; // Duration by category
  periodCount: number;          // Number of periods
  pauseDuration: number;        // Total pause time
}

/**
 * Chart Data Point
 * Single data point for charts
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/**
 * Chart Data
 * Data structure for charts
 */
export interface ChartData {
  labels: string[];
  datasets: ChartDataPoint[];
}

/**
 * Time Distribution
 * Aggregated time by category
 */
export interface TimeDistribution {
  key: string;
  label: string;
  duration: number;
  percentage: number;
  color: string;
}
