# Cyclic - Time Tracking App

A 100% client-side web application for tracking daily time usage with continuous period tracking, keyboard shortcuts, and rich metadata support.

## Tech Stack

- **Language**: TypeScript
- **Frontend Framework**: React
- **Full-Stack Framework**: TanStack Start
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Storage**: SQLite Wasm (OPFS)

## Project Structure

```
cyclic/
├── app/
│   ├── components/      # React components
│   ├── routes/          # TanStack Start routes
│   ├── services/        # Business logic layer
│   ├── stores/          # Zustand state management
│   ├── styles/          # Global styles
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── REQUIREMENTS.md      # Feature requirements
├── TECH_DESIGN.md       # Technical design document
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Run tests
npm run test
```

## Features

- **Continuous Time Tracking**: No gaps between periods
- **Keyboard Shortcuts**: Space to end period, Alt+Space to pause/resume
- **Pause/Resume**: Maintain context when taking breaks
- **Rich Metadata**: Themes, categories, tags, notes
- **Break Reminders**: Simple timer-based notifications
- **Timeline View**: Visual timeline with infinite scrolling
- **Analytics**: Time summaries by theme/category/tag
- **CSV Export**: Export data for external analysis
- **100% Client-Side**: All data stays in your browser

## Development Status

This is the initial skeleton structure. Core features are being implemented according to the technical design document.

## License

Private project
