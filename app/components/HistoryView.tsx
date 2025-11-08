import { usePeriods } from '@/stores/useStore';
import { formatDateTime, formatDuration } from '@/utils/format';

/**
 * History View
 * Shows list of completed periods
 */
export function HistoryView() {
  const periods = usePeriods();

  const completedPeriods = periods.filter(p => p.endTime !== null);

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
          </div>
        ) : (
          completedPeriods.map(period => (
            <div
              key={period.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {period.name || 'Unnamed Period'}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDateTime(period.startTime)} - {period.endTime && formatDateTime(period.endTime)}
                  </p>

                  {period.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {period.notes}
                    </p>
                  )}

                  {period.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {period.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {period.endTime && formatDuration(Math.floor((period.endTime - period.startTime) / 1000))}
                  </div>
                  {period.theme && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {period.theme}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
