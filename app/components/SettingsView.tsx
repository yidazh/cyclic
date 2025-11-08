import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { csvExportService } from '@/services';

/**
 * Settings View
 * App configuration and preferences
 */
export function SettingsView() {
  const config = useStore((state) => state.config);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await csvExportService.exportAndDownload();
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h2>

      <div className="space-y-6">
        {/* Display Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Display
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Format
              </label>
              <select
                value={config.settings.display.timeFormat}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="12h">12-hour</option>
                <option value="24h">24-hour</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Currently read-only
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={config.settings.display.theme}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Currently read-only
              </p>
            </div>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Break Reminder
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Duration (minutes)
            </label>
            <input
              type="number"
              value={config.settings.reminder.defaultDuration}
              disabled
              min="1"
              max="120"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Default: {config.settings.reminder.defaultDuration} minutes (currently read-only)
            </p>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Keyboard Shortcuts
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">End Period</span>
              <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                {config.settings.keyboardShortcuts.endPeriod}
              </kbd>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700 dark:text-gray-300">Pause/Resume</span>
              <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                {config.settings.keyboardShortcuts.pauseResume}
              </kbd>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Keyboard shortcuts are currently not customizable
          </p>
        </div>

        {/* Themes Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Themes
          </h3>

          <div className="space-y-2">
            {config.themes.map(theme => (
              <div key={theme.id} className="flex items-center gap-3 py-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="text-gray-900 dark:text-white font-medium">
                  {theme.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  ({theme.color})
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Theme customization coming soon
          </p>
        </div>

        {/* Export */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Export Data
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Export all your time tracking data to a CSV file for analysis in spreadsheet applications.
          </p>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? 'Exporting...' : 'Export as CSV'}
          </button>
        </div>

        {/* App Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            About
          </h3>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-medium">Version:</span> {config.version}
            </p>
            <p>
              <span className="font-medium">Storage:</span> SQLite Wasm (OPFS)
            </p>
            <p>
              <span className="font-medium">Data Location:</span> Browser local storage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
