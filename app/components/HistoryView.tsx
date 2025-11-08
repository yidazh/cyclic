import { useStore } from '@/stores/useStore';
import { formatDateTime, formatDuration } from '@/utils/format';

/**
 * History View
 * Shows list of completed periods
 */
export function HistoryView() {
  const periods = useStore((state) => state.periods);
  const config = useStore((state) => state.config);

  const completedPeriods = periods.filter(p => p.endTime !== null);

  // Get theme color
  const getThemeColor = (themeId: string | null) => {
    if (!themeId) return '#6b7280';
    const theme = config.themes.find(t => t.id === themeId);
    return theme?.color || '#6b7280';
  };

  // Get theme name
  const getThemeName = (themeId: string | null) => {
    if (!themeId) return 'No theme';
    const theme = config.themes.find(t => t.id === themeId);
    return theme?.name || themeId;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        History
      </h2>

      <div className="space-y-4">
        {completedPeriods.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400">
              No completed periods yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Start tracking your time to see history here
            </p>
          </div>
        ) : (
          completedPeriods.map(period => (
            <div
              key={period.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title and theme indicator */}
                  <div className="flex items-center gap-3 mb-2">
                    {period.theme && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getThemeColor(period.theme) }}
                        title={getThemeName(period.theme)}
                      />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {period.name || 'Unnamed Period'}
                    </h3>
                    {period.isPaused && (
                      <span className="px-2 py-1 bg-pause-light dark:bg-pause-dark text-xs rounded">
                        Pause
                      </span>
                    )}
                  </div>

                  {/* Time range */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDateTime(period.startTime)} - {period.endTime && formatDateTime(period.endTime)}
                  </p>

                  {/* Theme and category */}
                  {(period.theme || period.category) && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {period.theme && <span>{getThemeName(period.theme)}</span>}
                      {period.theme && period.category && <span> / </span>}
                      {period.category && <span>{period.category}</span>}
                    </p>
                  )}

                  {/* Notes */}
                  {period.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                      {period.notes}
                    </p>
                  )}

                  {/* Tags */}
                  {period.tags.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {period.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {period.endTime && formatDuration(Math.floor((period.endTime - period.startTime) / 1000))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {completedPeriods.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {completedPeriods.length} period{completedPeriods.length !== 1 ? 's' : ''} total
        </div>
      )}
    </div>
  );
}
