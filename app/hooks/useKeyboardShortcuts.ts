import { useEffect } from 'react';
import { keyboardShortcutService } from '@/services';
import { usePeriodActions } from './usePeriodActions';

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts() {
  const { transitionPeriod, pauseResume } = usePeriodActions();

  useEffect(() => {
    // Register shortcuts
    keyboardShortcutService.register('space', () => {
      transitionPeriod().catch(console.error);
    });

    keyboardShortcutService.register('Alt+Space', () => {
      pauseResume().catch(console.error);
    });

    // Cleanup
    return () => {
      keyboardShortcutService.unregister('space');
      keyboardShortcutService.unregister('Alt+Space');
    };
  }, [transitionPeriod, pauseResume]);
}
