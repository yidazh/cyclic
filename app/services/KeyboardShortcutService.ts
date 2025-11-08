import { isInputElement, normalizeKey } from '@/utils/keyboard';

/**
 * Keyboard Shortcut Handler
 * Manages global keyboard shortcuts
 */
export class KeyboardShortcutService {
  private shortcuts: Map<string, () => void> = new Map();
  private enabled = true;
  private handler: ((e: KeyboardEvent) => void) | null = null;

  /**
   * Initialize keyboard shortcut handler
   */
  initialize(): void {
    this.handler = (e: KeyboardEvent) => {
      // Ignore if shortcuts are disabled
      if (!this.enabled) return;

      // Ignore if user is typing in input field
      if (isInputElement(e.target)) return;

      const key = normalizeKey(e);
      const handler = this.shortcuts.get(key);

      if (handler) {
        e.preventDefault();
        try {
          handler();
        } catch (error) {
          console.error('Error in keyboard shortcut handler:', error);
        }
      }
    };

    document.addEventListener('keydown', this.handler);
    console.log('Keyboard shortcuts initialized');
  }

  /**
   * Register a keyboard shortcut
   */
  register(key: string, handler: () => void): void {
    this.shortcuts.set(key, handler);
    console.log(`Registered keyboard shortcut: ${key}`);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string): void {
    this.shortcuts.delete(key);
    console.log(`Unregistered keyboard shortcut: ${key}`);
  }

  /**
   * Enable keyboard shortcuts
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable keyboard shortcuts
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if shortcuts are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Cleanup keyboard shortcut handler
   */
  cleanup(): void {
    if (this.handler) {
      document.removeEventListener('keydown', this.handler);
      this.handler = null;
    }
    this.shortcuts.clear();
    console.log('Keyboard shortcuts cleaned up');
  }

  /**
   * Get all registered shortcuts
   */
  getRegisteredShortcuts(): string[] {
    return Array.from(this.shortcuts.keys());
  }
}

// Singleton instance
export const keyboardShortcutService = new KeyboardShortcutService();
