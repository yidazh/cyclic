import { createFileRoute } from '@tanstack/react-router';
import { AnalyticsView } from '@/components/AnalyticsView';

/**
 * Analytics Route
 * Shows analytics and summaries
 */
export const Route = createFileRoute('/analytics')({
  component: AnalyticsView,
});
