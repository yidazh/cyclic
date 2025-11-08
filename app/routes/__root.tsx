import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '@/components/Header';
import { AppProvider } from '@/components/AppProvider';

/**
 * Root Route
 * Layout for all pages with AppProvider for initialization
 */
export const Route = createRootRoute({
  component: () => (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </AppProvider>
  ),
});
