import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/start';
import { router } from './router';
import './styles/globals.css';

/**
 * Client entry point
 * Hydrates the React app on the client side
 */
hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <StartClient router={router} />
  </StrictMode>
);
