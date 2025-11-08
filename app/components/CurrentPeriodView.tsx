import { useEffect, useState } from 'react';
import { useStore } from '@/stores/useStore';
import { formatElapsedTime } from '@/utils/format';
import { usePeriodActions } from '@/hooks/usePeriodActions';
import { timerManager, breakReminderService } from '@/services';
import { debounce } from '@/utils/debounce';

/**
 * Current Period View
 * Main view showing the active period with live timer
 */
export function CurrentPeriodView() {
  const activePeriod = useStore((state) => state.activePeriod);
  const isPaused = useStore((state) => state.isPaused);
  const config = useStore((state) => state.config);
  const reminderActive = useStore((state) => state.reminderActive);
  const setReminderActive = useStore((state) => state.setReminderActive);

  const { transitionPeriod, pauseResume, updateActivePeriod } = usePeriodActions();

  const [elapsed, setElapsed] = useState(0);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  // Subscribe to timer updates
  useEffect(() => {
    if (!activePeriod) return;

    const unsubscribe = timerManager.subscribe((elapsedMs) => {
      setElapsed(elapsedMs);
    });

    return unsubscribe;
  }, [activePeriod?.id]);

  // Sync local state with active period
  useEffect(() => {
    if (activePeriod) {
      setName(activePeriod.name);
      setNotes(activePeriod.notes);
    }
  }, [activePeriod?.id]);

  // Debounced update for name
  const debouncedUpdateName = debounce((newName: string) => {
    updateActivePeriod({ name: newName });
  }, 500);

  // Debounced update for notes
  const debouncedUpdateNotes = debounce((newNotes: string) => {
    updateActivePeriod({ notes: newNotes });
  }, 500);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    debouncedUpdateName(newName);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    debouncedUpdateNotes(newNotes);
  };

  const handleStartReminder = async () => {
    if (reminderActive) {
      breakReminderService.cancelReminder();
      setReminderActive(false);
    } else {
      // Request permission if needed
      const permission = await breakReminderService.requestNotificationPermission();

      if (permission === 'granted') {
        breakReminderService.startReminder(config.settings.reminder.defaultDuration);
        setReminderActive(true);

        // Set up callback to update state when reminder fires
        breakReminderService.setOnReminderTriggered(() => {
          setReminderActive(false);
        });
      } else {
        alert('Please enable notifications to use break reminders');
      }
    }
  };

  if (!activePeriod) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Active Period
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Loading...
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

          {isPaused && (
            <div className="inline-block px-4 py-2 bg-pause-light dark:bg-pause-dark rounded-full">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                ⏸ Paused
              </span>
            </div>
          )}

          {reminderActive && (
            <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full ml-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-200">
                🔔 Break reminder active
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
              value={name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What are you working on?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional details..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => transitionPeriod()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            End Period (Space)
          </button>
          <button
            onClick={() => pauseResume()}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'} (Alt+Space)
          </button>
          <button
            onClick={handleStartReminder}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              reminderActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {reminderActive ? 'Cancel Reminder' : 'Start Break Reminder'}
          </button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>
            Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Space</kbd> to end
            period
          </p>
          <p>
            Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Alt+Space</kbd> to
            pause/resume
          </p>
        </div>
      </div>
    </div>
  );
}
