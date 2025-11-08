/**
 * Theme Configuration
 * Defines visual themes for time periods
 */
export interface Theme {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  color: string;                 // Hex color code
  icon?: string;                 // Optional icon identifier
  order: number;                 // Display order
}

/**
 * Category Configuration
 * Categories belong to themes
 */
export interface Category {
  id: string;                    // Unique identifier
  themeId: string;               // Parent theme ID
  name: string;                  // Display name
  order: number;                 // Display order
}

/**
 * Keyboard Shortcuts
 * Configurable keyboard shortcuts
 */
export interface KeyboardShortcuts {
  endPeriod: string;             // Default: 'Space'
  pauseResume: string;           // Default: 'Alt+Space'
}

/**
 * Display Settings
 * User preferences for UI display
 */
export interface DisplaySettings {
  timeFormat: '12h' | '24h';     // Time display format
  dateFormat: string;            // Date format string
  firstDayOfWeek: 0 | 1;        // 0 = Sunday, 1 = Monday
  theme: 'light' | 'dark' | 'auto';
}

/**
 * Default Values
 * Default settings for new periods
 */
export interface DefaultValues {
  themeId: string | null;        // Default theme for new periods
  categoryId: string | null;     // Default category for new periods
}

/**
 * Reminder Settings
 * Break reminder configuration
 */
export interface ReminderSettings {
  defaultDuration: number;       // Default reminder duration in minutes (default: 30)
}

/**
 * User Settings
 * All user preferences
 */
export interface Settings {
  keyboardShortcuts: KeyboardShortcuts;
  display: DisplaySettings;
  defaults: DefaultValues;
  reminder: ReminderSettings;
}

/**
 * Application Configuration
 * Complete app configuration
 */
export interface AppConfig {
  version: string;               // Config schema version
  themes: Theme[];               // User-defined themes
  categories: Category[];        // User-defined categories
  settings: Settings;            // User preferences
}

/**
 * Default Configuration
 */
export const defaultConfig: AppConfig = {
  version: '1.0.0',
  themes: [
    { id: 'work', name: 'Work', color: '#3b82f6', order: 1 },
    { id: 'personal', name: 'Personal', color: '#10b981', order: 2 },
    { id: 'health', name: 'Health', color: '#f59e0b', order: 3 },
    { id: 'pause', name: 'Pause', color: '#94a3b8', order: 4 },
  ],
  categories: [
    { id: 'development', themeId: 'work', name: 'Development', order: 1 },
    { id: 'meetings', themeId: 'work', name: 'Meetings', order: 2 },
    { id: 'exercise', themeId: 'health', name: 'Exercise', order: 1 },
  ],
  settings: {
    keyboardShortcuts: {
      endPeriod: 'Space',
      pauseResume: 'Alt+Space',
    },
    display: {
      timeFormat: '24h',
      dateFormat: 'YYYY-MM-DD',
      firstDayOfWeek: 1,
      theme: 'auto',
    },
    defaults: {
      themeId: null,
      categoryId: null,
    },
    reminder: {
      defaultDuration: 30,
    },
  },
};
