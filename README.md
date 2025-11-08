# Cyclic - Time Tracking Application

A 100% client-side time tracking application with continuous period tracking, pause/resume functionality, and break reminders.

## Features

- **Continuous Period Tracking**: No gaps between periods - ending one starts the next
- **Pause/Resume**: Pause work while preserving context, resume to continue
- **Break Reminders**: Browser notifications for break reminders
- **Rich Metadata**: Themes, categories, tags, and notes for each period
- **Analytics**: Daily, weekly, and monthly summaries with time distribution
- **Data Export**: CSV export for external analysis
- **Keyboard Shortcuts**:
  - `Space` - End current period
  - `Alt+Space` - Pause/resume

## Tech Stack

- **Frontend**: React 18.3.1 with TypeScript 5.7.2
- **Routing**: TanStack Router 1.87.0
- **State Management**: Zustand 5.0.2
- **Styling**: Tailwind CSS 3.4.16
- **Storage**: SQLite Wasm 3.47.2 with OPFS
- **Build Tool**: Vite 6.0.3 + Vinxi

## Implementation Status

✅ **Completed**:
- Service layer with full functionality
- UI components with state management and data integration
- Real-time timer with visibility handling
- Keyboard shortcuts
- Auto-saving period metadata (debounced 500ms)
- Pause/resume with context preservation
- Break reminders with browser notifications
- Analytics with real calculations
- CSV export functionality
- SQLite Wasm persistence with OPFS

## Known Issues

### TanStack Start Dependency Bug

**Issue**: TanStack Start 1.87.0 has a dependency bug where it tries to import `CONSTANTS` from `@tanstack/router-generator`, but this export doesn't exist in the version it uses.

**Error**:
```
SyntaxError: The requested module '@tanstack/router-generator' does not provide an export named 'CONSTANTS'
```

**Impact**: The development server cannot start with current configuration.

**Note**: All application code is complete and functional. The issue is purely with third-party dependency compatibility.

## Installation

```bash
npm install
```

## Development

```bash
npm run typecheck # Run TypeScript type checking (works)
npm run dev       # Start development server (currently fails due to TanStack Start bug)
npm run build     # Build for production
```
