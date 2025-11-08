import { TimePeriod } from '@/types';

/**
 * Timer Manager
 * Tracks elapsed time for active period
 */
export class TimerManager {
  private startTime: number | null = null;
  private intervalId: number | null = null;
  private subscribers: Set<(elapsed: number) => void> = new Set();

  /**
   * Start tracking active period
   */
  start(period: TimePeriod): void {
    this.stop(); // Stop any existing timer

    this.startTime = period.startTime;

    // Update every second
    this.intervalId = window.setInterval(() => {
      this.notifySubscribers();
    }, 1000);

    // Immediate update
    this.notifySubscribers();
  }

  /**
   * Stop tracking
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.startTime = null;
  }

  /**
   * Get current elapsed time in milliseconds
   */
  getElapsedTime(): number {
    if (this.startTime === null) return 0;
    return Date.now() - this.startTime;
  }

  /**
   * Subscribe to timer updates
   * Returns unsubscribe function
   */
  subscribe(callback: (elapsed: number) => void): () => void {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(): void {
    const elapsed = this.getElapsedTime();
    this.subscribers.forEach(callback => callback(elapsed));
  }
}

// Singleton instance
export const timerManager = new TimerManager();
