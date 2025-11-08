/**
 * Analytics View
 * Shows analytics, summaries, and charts
 */
export function AnalyticsView() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Analytics
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Analytics view - Coming soon
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Time
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              0h 0m
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Periods Today
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              0
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Most Active Theme
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              -
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
