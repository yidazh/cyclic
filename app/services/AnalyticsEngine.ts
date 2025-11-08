import { DateRange, DailySummary, ChartData, TimeDistribution } from '@/types';
import { storageService } from './StorageService';

/**
 * Analytics Engine
 * Calculates summaries and statistics
 */
export class AnalyticsEngine {
  /**
   * Get total time by theme
   */
  async getTotalByTheme(dateRange?: DateRange): Promise<Map<string, number>> {
    const periods = await this.getPeriodsInRange(dateRange);
    const totals = new Map<string, number>();

    periods.forEach(period => {
      if (period.endTime && period.theme) {
        const duration = period.endTime - period.startTime;
        const current = totals.get(period.theme) || 0;
        totals.set(period.theme, current + duration);
      }
    });

    return totals;
  }

  /**
   * Get total time by category
   */
  async getTotalByCategory(dateRange?: DateRange): Promise<Map<string, number>> {
    const periods = await this.getPeriodsInRange(dateRange);
    const totals = new Map<string, number>();

    periods.forEach(period => {
      if (period.endTime && period.category) {
        const duration = period.endTime - period.startTime;
        const current = totals.get(period.category) || 0;
        totals.set(period.category, current + duration);
      }
    });

    return totals;
  }

  /**
   * Get total time by tag
   */
  async getTotalByTag(dateRange?: DateRange): Promise<Map<string, number>> {
    const periods = await this.getPeriodsInRange(dateRange);
    const totals = new Map<string, number>();

    periods.forEach(period => {
      if (period.endTime && period.tags.length > 0) {
        const duration = period.endTime - period.startTime;

        period.tags.forEach(tag => {
          const current = totals.get(tag) || 0;
          totals.set(tag, current + duration);
        });
      }
    });

    return totals;
  }

  /**
   * Get daily summary
   */
  async getDailySummary(date: Date): Promise<DailySummary> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const periods = await storageService.getPeriods({
      startTime: startOfDay.getTime(),
      endTime: endOfDay.getTime()
    });

    let totalDuration = 0;
    let pauseDuration = 0;
    const byTheme = new Map<string, number>();
    const byCategory = new Map<string, number>();

    periods.forEach(period => {
      if (period.endTime) {
        const duration = period.endTime - period.startTime;
        totalDuration += duration;

        if (period.isPaused) {
          pauseDuration += duration;
        }

        if (period.theme) {
          const current = byTheme.get(period.theme) || 0;
          byTheme.set(period.theme, current + duration);
        }

        if (period.category) {
          const current = byCategory.get(period.category) || 0;
          byCategory.set(period.category, current + duration);
        }
      }
    });

    return {
      date,
      totalDuration,
      byTheme,
      byCategory,
      periodCount: periods.length,
      pauseDuration
    };
  }

  /**
   * Get time distribution for charts
   */
  async getTimeDistribution(
    groupBy: 'theme' | 'category' | 'tag',
    dateRange?: DateRange
  ): Promise<TimeDistribution[]> {
    let totalsMap: Map<string, number>;

    switch (groupBy) {
      case 'theme':
        totalsMap = await this.getTotalByTheme(dateRange);
        break;
      case 'category':
        totalsMap = await this.getTotalByCategory(dateRange);
        break;
      case 'tag':
        totalsMap = await this.getTotalByTag(dateRange);
        break;
    }

    const total = Array.from(totalsMap.values()).reduce((sum, val) => sum + val, 0);

    const distribution: TimeDistribution[] = Array.from(totalsMap.entries()).map(([key, duration]) => ({
      key,
      label: key,
      duration,
      percentage: total > 0 ? (duration / total) * 100 : 0,
      color: this.getColorForKey(key)
    }));

    return distribution.sort((a, b) => b.duration - a.duration);
  }

  /**
   * Get periods in date range
   */
  private async getPeriodsInRange(dateRange?: DateRange) {
    if (!dateRange) {
      return await storageService.getPeriods();
    }

    return await storageService.getPeriods({
      startTime: dateRange.start.getTime(),
      endTime: dateRange.end.getTime()
    });
  }

  /**
   * Get color for a key (theme/category/tag)
   * TODO: Integrate with theme configuration
   */
  private getColorForKey(key: string): string {
    // Placeholder colors
    const colors: Record<string, string> = {
      work: '#3b82f6',
      personal: '#10b981',
      health: '#f59e0b',
      pause: '#94a3b8'
    };

    return colors[key] || '#6b7280';
  }
}

// Singleton instance
export const analyticsEngine = new AnalyticsEngine();
