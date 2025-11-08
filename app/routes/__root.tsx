import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '@/components/Header';

/**
 * Root Route
 * Layout for all pages
 */
export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  ),
});
