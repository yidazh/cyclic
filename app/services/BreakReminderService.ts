/**
 * Break Reminder Service
 * Manages simple break reminder timers with browser notifications
 */
export class BreakReminderService {
  private timerId: number | null = null;

  /**
   * Start a break reminder
   */
  startReminder(durationMinutes: number): void {
    // Cancel any existing reminder
    this.cancelReminder();

    // Set timeout for the specified duration
    const durationMs = durationMinutes * 60 * 1000;
    this.timerId = window.setTimeout(() => {
      this.showNotification();
      this.timerId = null; // Auto-clear after triggering
    }, durationMs);

    console.log(`Break reminder started for ${durationMinutes} minutes`);
  }

  /**
   * Cancel/dismiss the reminder
   */
  cancelReminder(): void {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
      console.log('Break reminder cancelled');
    }
  }

  /**
   * Check if reminder is active
   */
  isActive(): boolean {
    return this.timerId !== null;
  }

  /**
   * Show browser notification
   */
  private showNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Time to Take a Break!', {
        body: "You've been working for a while. Consider taking a short break.",
        icon: '/icon.png',
        tag: 'break-reminder', // Replace previous notifications
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else {
      console.warn('Notifications not available or not permitted');
    }
  }

  /**
   * Request notification permission (one-time, called on first use)
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }
}

// Singleton instance
export const breakReminderService = new BreakReminderService();
