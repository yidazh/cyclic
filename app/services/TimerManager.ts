import { TimePeriod } from '@/types';

/**
 * Timer Manager
 * Tracks elapsed time for active period
 */
export class TimerManager {
  private startTime: number | null = null;
  private intervalId: number | null = null;
  private subscribers: Set<(elapsed: number) => void> = new Set();
  private visibilityChangeHandler: (() => void) | null = null;

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

    // Handle visibility changes (tab switching)
    this.setupVisibilityHandler();

    // Immediate update
    this.notifySubscribers();
  }

  /**
   * Set up visibility change handler
   * Ensures timer updates when tab becomes visible again
   */
  private setupVisibilityHandler(): void {
    // Clean up existing handler
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }

    // Create new handler
    this.visibilityChangeHandler = () => {
      if (document.visibilityState === 'visible') {
        // Update immediately when tab becomes visible
        this.notifySubscribers();
      }
    };

    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  /**
   * Stop tracking
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Clean up visibility handler
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
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
    this.subscribers.forEach(callback => {
      try {
        callback(elapsed);
      } catch (error) {
        console.error('Error in timer subscriber:', error);
      }
    });
  }

  /**
   * Check if timer is running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  /**
   * Get current start time
   */
  getStartTime(): number | null {
    return this.startTime;
  }
}

// Singleton instance
export const timerManager = new TimerManager();
