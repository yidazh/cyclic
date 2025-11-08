import { useEffect, useState } from 'react';
import { useActivePeriod, useStore } from '@/stores/useStore';
import { formatElapsedTime } from '@/utils/format';

/**
 * Current Period View
 * Main view showing the active period with live timer
 */
export function CurrentPeriodView() {
  const activePeriod = useActivePeriod();
  const [elapsed, setElapsed] = useState(0);

  // Update timer every second
  useEffect(() => {
    if (!activePeriod) return;

    const updateElapsed = () => {
      setElapsed(Date.now() - activePeriod.startTime);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activePeriod]);

  if (!activePeriod) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Active Period
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Press Space to start tracking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-4">
            {formatElapsedTime(elapsed)}
          </div>

          {activePeriod.isPaused && (
            <div className="inline-block px-4 py-2 bg-pause-light dark:bg-pause-dark rounded-full">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Paused
              </span>
            </div>
          )}
        </div>

        {/* Period Metadata */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={activePeriod.name}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="What are you working on?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={activePeriod.notes}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Additional details..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">
            End Period (Space)
          </button>
          <button className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium">
            {activePeriod.isPaused ? 'Resume' : 'Pause'} (Alt+Space)
          </button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Space</kbd> to end period</p>
          <p>Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Alt+Space</kbd> to pause/resume</p>
        </div>
      </div>
    </div>
  );
}
