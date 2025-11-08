import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

/**
 * Create TanStack Router instance
 */
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

/**
 * Type declaration for router
 */
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
