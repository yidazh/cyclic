import { renderToString } from 'react-dom/server';
import { StartServer } from '@tanstack/start';
import { router } from './router';

/**
 * Server entry point (for SSG/SSR, though we're using client-only mode)
 */
export function render(url: string) {
  const html = renderToString(<StartServer router={router} url={url} />);
  return { html };
}
