import { createFileRoute } from '@tanstack/react-router';
import { SettingsView } from '@/components/SettingsView';

/**
 * Settings Route
 * App configuration and preferences
 */
export const Route = createFileRoute('/settings')({
  component: SettingsView,
});
