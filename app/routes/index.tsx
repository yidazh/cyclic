import { createFileRoute } from '@tanstack/react-router';
import { CurrentPeriodView } from '@/components/CurrentPeriodView';

/**
 * Index Route
 * Main view showing current period
 */
export const Route = createFileRoute('/')({
  component: CurrentPeriodView,
});
