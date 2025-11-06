# Time Tracking App - Technical Design Document

## 1. Architecture Overview

### 1.1 Technology Stack

**Frontend Framework**: React (recommended) or Vue.js
- Component-based architecture
- Virtual DOM for efficient updates
- Rich ecosystem and tooling
- Excellent for single-page applications

**Alternative**: Vanilla JavaScript with Web Components
- No framework dependencies
- Smaller bundle size
- More control over implementation

**Build Tool**: Vite
- Fast development server
- Optimized production builds
- Modern ES modules support

**Styling**: CSS Modules or Tailwind CSS
- Scoped styling
- Utility-first approach
- Responsive design support

**Storage**: IndexedDB (with localStorage fallback)
- Larger storage capacity than localStorage (50MB+ vs 5-10MB)
- Better performance for large datasets
- Structured data storage
- Use Dexie.js wrapper for easier API

**State Management**: Context API (React) or Pinia (Vue)
- No external dependencies needed for React Context
- Sufficient for client-only app

### 1.2 Architecture Pattern

**Client-Side MVC/MVVM Pattern**:
```
┌─────────────────────────────────────────┐
│            View Layer (UI)              │
│  - Current Period Display               │
│  - History List                         │
│  - Analytics Dashboard                  │
│  - Settings Panel                       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         State Management Layer          │
│  - Active Period State                  │
│  - Pause State (isPaused, resumeData)   │
│  - Period History State                 │
│  - Configuration State                  │
│  - UI State                             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Business Logic Layer           │
│  - Period Manager                       │
│  - Timer Manager                        │
│  - Analytics Engine                     │
│  - CSV Export Service                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Data Access Layer              │
│  - IndexedDB Wrapper                    │
│  - localStorage Fallback                │
│  - Data Validation                      │
└─────────────────────────────────────────┘
```

## 2. Data Models

### 2.1 Core Data Structures

```typescript
// Time Period
interface TimePeriod {
  id: string;                    // UUID
  startTime: number;             // Unix timestamp (ms)
  endTime: number | null;        // Unix timestamp (ms), null for active period
  theme: string | null;          // Theme identifier
  category: string | null;       // Category identifier
  name: string;                  // Period name/description
  notes: string;                 // Free-form notes
  tags: string[];                // Array of tag strings
  isPaused: boolean;             // True if this is a pause period
  resumeFromPeriodId: string | null; // Reference to period to resume from (for pauses)
  createdAt: number;             // Unix timestamp (ms)
  updatedAt: number;             // Unix timestamp (ms)
}

// Theme Configuration
interface Theme {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  color: string;                 // Hex color code
  icon?: string;                 // Optional icon identifier
  order: number;                 // Display order
}

// Category Configuration
interface Category {
  id: string;                    // Unique identifier
  themeId: string;               // Parent theme ID
  name: string;                  // Display name
  order: number;                 // Display order
}

// Application Configuration
interface AppConfig {
  version: string;               // Config schema version
  themes: Theme[];               // User-defined themes
  categories: Category[];        // User-defined categories
  settings: Settings;            // User preferences
}

// User Settings
interface Settings {
  keyboardShortcuts: KeyboardShortcuts;
  display: DisplaySettings;
  defaults: DefaultValues;
}

interface KeyboardShortcuts {
  endPeriod: string;             // Default: 'Space'
  pauseResume: string;           // Default: 'Alt+Space'
}

interface DisplaySettings {
  timeFormat: '12h' | '24h';     // Time display format
  dateFormat: string;            // Date format string
  firstDayOfWeek: 0 | 1;        // 0 = Sunday, 1 = Monday
  theme: 'light' | 'dark' | 'auto';
}

interface DefaultValues {
  themeId: string | null;        // Default theme for new periods
  categoryId: string | null;     // Default category for new periods
}
```

### 2.2 IndexedDB Schema

```typescript
// Database name: 'TimeTrackingDB'
// Version: 1

// Object Stores:

// 1. 'periods' - stores all time periods
// Key path: 'id'
// Indexes:
//   - 'startTime' (unique: false)
//   - 'endTime' (unique: false)
//   - 'theme' (unique: false)
//   - 'category' (unique: false)
//   - 'tags' (unique: false, multiEntry: true)
//   - 'isPaused' (unique: false)
//   - 'resumeFromPeriodId' (unique: false)

// 2. 'config' - stores application configuration
// Key path: 'key'
// Single document with key: 'appConfig'

// 3. 'metadata' - stores app metadata
// Key path: 'key'
// Used for versioning, migration tracking
```

## 3. Core Components/Modules

### 3.1 Period Manager

**Responsibilities**:
- Create new periods
- End current period and start next
- Update period metadata
- Retrieve period history
- Validate period integrity

**Key Methods**:
```typescript
class PeriodManager {
  // End current period and start new one
  async transitionPeriod(): Promise<TimePeriod>;

  // Pause/Resume toggle
  async pauseResume(): Promise<TimePeriod>;

  // Get currently active period
  async getActivePeriod(): Promise<TimePeriod | null>;

  // Check if currently paused
  async isPaused(): Promise<boolean>;

  // Update period metadata (not timestamps)
  async updatePeriod(id: string, updates: Partial<TimePeriod>): Promise<TimePeriod>;

  // Get period history with filtering
  async getPeriods(filter?: PeriodFilter): Promise<TimePeriod[]>;

  // Validate continuous time tracking (no gaps/overlaps)
  async validatePeriodContinuity(): Promise<ValidationResult>;

  // Handle edge case: recover from unexpected app closure
  async recoverIncompleteSession(): Promise<void>;
}
```

### 3.2 Timer Manager

**Responsibilities**:
- Track elapsed time for active period
- Emit updates at regular intervals (1 second)
- Handle visibility changes (tab switching)

**Key Methods**:
```typescript
class TimerManager {
  // Start tracking active period
  start(period: TimePeriod): void;

  // Stop tracking
  stop(): void;

  // Get current elapsed time
  getElapsedTime(): number;

  // Subscribe to timer updates
  subscribe(callback: (elapsed: number) => void): () => void;
}
```

### 3.3 Storage Service

**Responsibilities**:
- Abstract storage layer (IndexedDB primary, localStorage fallback)
- Handle CRUD operations
- Manage transactions
- Handle quota errors

**Key Methods**:
```typescript
class StorageService {
  // Initialize database
  async init(): Promise<void>;

  // Generic CRUD operations
  async get<T>(store: string, key: string): Promise<T | undefined>;
  async put<T>(store: string, value: T): Promise<void>;
  async delete(store: string, key: string): Promise<void>;
  async getAll<T>(store: string): Promise<T[]>;

  // Query with index
  async queryByIndex<T>(store: string, index: string, value: any): Promise<T[]>;

  // Batch operations
  async bulkPut<T>(store: string, values: T[]): Promise<void>;

  // Check storage quota
  async getStorageEstimate(): Promise<StorageEstimate>;
}
```

### 3.4 Analytics Engine

**Responsibilities**:
- Calculate time summaries
- Group by theme/category/tag
- Generate reports
- Compute statistics

**Key Methods**:
```typescript
class AnalyticsEngine {
  // Get total time by theme
  async getTotalByTheme(dateRange?: DateRange): Promise<Map<string, number>>;

  // Get total time by category
  async getTotalByCategory(dateRange?: DateRange): Promise<Map<string, number>>;

  // Get total time by tag
  async getTotalByTag(dateRange?: DateRange): Promise<Map<string, number>>;

  // Get daily summary
  async getDailySummary(date: Date): Promise<DailySummary>;

  // Get time distribution for charts
  async getTimeDistribution(groupBy: 'theme' | 'category' | 'tag', dateRange?: DateRange): Promise<ChartData>;
}
```

### 3.5 CSV Export Service

**Responsibilities**:
- Export period data to CSV format for spreadsheet analysis

**Key Methods**:
```typescript
class CSVExportService {
  // Export periods as CSV
  async exportCSV(dateRange?: DateRange): Promise<Blob>;

  // Format period data for CSV
  formatPeriodForCSV(period: TimePeriod): string[];

  // Generate CSV header row
  getCSVHeaders(): string[];
}
```

## 4. UI Components

### 4.1 Component Hierarchy (React Example)

```
App
├── KeyboardHandler (global)
├── Header
│   ├── AppTitle
│   └── NavigationTabs
├── MainView
│   ├── CurrentPeriodView
│   │   ├── TimerDisplay
│   │   ├── PauseIndicator (conditional)
│   │   ├── ResumePreview (conditional, shown when paused)
│   │   ├── PeriodMetadata
│   │   │   ├── ThemeSelector
│   │   │   ├── CategorySelector
│   │   │   ├── NameInput
│   │   │   ├── NotesEditor
│   │   │   └── TagsInput
│   │   └── ActionButtons
│   │       ├── EndPeriodButton
│   │       └── PauseResumeButton
│   ├── HistoryView
│   │   ├── FilterBar
│   │   └── PeriodList
│   │       └── PeriodCard (multiple)
│   ├── AnalyticsView
│   │   ├── DateRangePicker
│   │   ├── SummaryCards
│   │   └── Charts
│   │       ├── TimeDistributionChart
│   │       └── TrendChart
│   ├── TimelineView (fullscreen mode)
│   │   ├── TimelineCanvas
│   │   ├── TimelineScrollContainer
│   │   ├── TimelineSegment (multiple, virtualized)
│   │   ├── TimeMarkers
│   │   ├── TimelineControls
│   │   │   ├── ZoomControls (optional)
│   │   │   └── NavigationControls
│   │   ├── SegmentTooltip
│   │   └── PeriodDetailPanel (side panel)
│   └── SettingsView
│       ├── ThemeManager
│       ├── CategoryManager
│       ├── ShortcutSettings
│       └── ExportPanel
└── Modal (for dialogs)
```

### 4.2 Key Component Specifications

**CurrentPeriodView**:
- Large timer display (HH:MM:SS format)
- Real-time updates every second
- Color-coded by theme
- Pause state indicator (when paused)
- Resume preview (shows what will be resumed)
- Editable metadata fields
- Keyboard shortcut hints

**PeriodCard** (History):
- Compact display of period info
- Time range + duration
- Visual theme indicator
- Expandable for full notes
- Click to edit

**TimerDisplay**:
- Format: HH:MM:SS for < 24 hours
- Format: "X days HH:MM:SS" for > 24 hours
- Smooth updates (no flashing)

**TimelineView**:
- Fullscreen horizontal timeline visualization
- Infinite horizontal scrolling through all periods
- Color-coded segments representing time periods
- Segment width proportional to period duration
- Visual features:
  - Horizontal bar with colored segments for each period
  - Time axis with markers (hours, days, weeks depending on zoom level)
  - Current/active period highlighted with special indicator
  - Pause periods shown with distinct styling (e.g., striped pattern)
  - Smooth transitions when scrolling
- Interaction:
  - Click segment to view/edit period details in side panel
  - Hover shows tooltip with period name and duration
  - Drag to scroll or use mouse wheel
  - "Jump to Now" button to navigate to current period
  - Optional zoom controls to adjust time scale
- Performance:
  - Virtual rendering for efficient display of thousands of periods
  - Only render visible segments + buffer
  - Lazy load period data as user scrolls
  - Smooth 60fps scrolling performance

## 5. Implementation Details

### 5.1 Keyboard Shortcut Handler

```typescript
class KeyboardShortcutHandler {
  private shortcuts: Map<string, () => void>;

  constructor() {
    this.shortcuts = new Map();
    this.init();
  }

  private init() {
    document.addEventListener('keydown', (e) => {
      // Ignore if user is typing in input field
      if (this.isInputElement(e.target)) return;

      const key = this.normalizeKey(e);
      const handler = this.shortcuts.get(key);

      if (handler) {
        e.preventDefault();
        handler();
      }
    });
  }

  register(key: string, handler: () => void) {
    this.shortcuts.set(key, handler);
  }

  private isInputElement(target: EventTarget | null): boolean {
    if (!target) return false;
    const el = target as HTMLElement;
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) ||
           el.isContentEditable;
  }

  private normalizeKey(e: KeyboardEvent): string {
    // Handle special keys, modifiers, etc.
    const modifiers = [];
    if (e.altKey) modifiers.push('Alt');
    if (e.ctrlKey) modifiers.push('Ctrl');
    if (e.metaKey) modifiers.push('Meta');
    if (e.shiftKey) modifiers.push('Shift');

    const key = e.key === ' ' ? 'Space' : e.key;

    if (modifiers.length > 0) {
      return `${modifiers.join('+')}+${key}`;
    }

    return key.toLowerCase();
  }
}
```

### 5.2 Period Transition Logic

```typescript
async function transitionPeriod(): Promise<TimePeriod> {
  const now = Date.now();

  // 1. Get current active period
  const activePeriod = await periodManager.getActivePeriod();

  // 2. End current period
  if (activePeriod) {
    activePeriod.endTime = now;
    await storageService.put('periods', activePeriod);
  }

  // 3. Create new period starting at same timestamp
  const newPeriod: TimePeriod = {
    id: generateUUID(),
    startTime: now,
    endTime: null,
    theme: settings.defaults.themeId,
    category: settings.defaults.categoryId,
    name: '',
    notes: '',
    tags: [],
    createdAt: now,
    updatedAt: now
  };

  // 4. Save new period
  await storageService.put('periods', newPeriod);

  // 5. Emit event for UI update
  eventBus.emit('periodTransition', newPeriod);

  return newPeriod;
}
```

### 5.3 Pause/Resume Logic

```typescript
async function pauseResume(): Promise<TimePeriod> {
  const now = Date.now();

  // 1. Get current active period
  const activePeriod = await periodManager.getActivePeriod();

  if (!activePeriod) {
    throw new Error('No active period found');
  }

  // 2. Check if currently paused
  const isPausedNow = activePeriod.isPaused;

  // 3. End current period
  activePeriod.endTime = now;
  await storageService.put('periods', activePeriod);

  let newPeriod: TimePeriod;

  if (isPausedNow) {
    // RESUMING from pause
    // Get the period we were working on before pause
    const resumeFromPeriod = activePeriod.resumeFromPeriodId
      ? await storageService.get<TimePeriod>('periods', activePeriod.resumeFromPeriodId)
      : null;

    // Create new period with metadata from pre-pause period
    newPeriod = {
      id: generateUUID(),
      startTime: now,
      endTime: null,
      theme: resumeFromPeriod?.theme || settings.defaults.themeId,
      category: resumeFromPeriod?.category || settings.defaults.categoryId,
      name: resumeFromPeriod?.name || '',
      notes: resumeFromPeriod?.notes || '',
      tags: resumeFromPeriod?.tags || [],
      isPaused: false,
      resumeFromPeriodId: null,
      createdAt: now,
      updatedAt: now
    };
  } else {
    // PAUSING
    // Create pause period, remembering current period for resume
    newPeriod = {
      id: generateUUID(),
      startTime: now,
      endTime: null,
      theme: 'pause', // Special pause theme
      category: null,
      name: 'Paused',
      notes: '',
      tags: [],
      isPaused: true,
      resumeFromPeriodId: activePeriod.id, // Remember what to resume
      createdAt: now,
      updatedAt: now
    };
  }

  // 4. Save new period
  await storageService.put('periods', newPeriod);

  // 5. Emit event for UI update
  eventBus.emit('pauseResumeTransition', { isPaused: newPeriod.isPaused, period: newPeriod });

  return newPeriod;
}
```

### 5.4 Data Persistence Strategy

**Auto-save on every change**:
- No manual save button needed
- Changes to metadata immediately persisted
- Use debouncing for rapid changes (e.g., typing in notes)

**Debounce Example**:
```typescript
const debouncedSave = debounce(async (period: TimePeriod) => {
  await storageService.put('periods', period);
}, 500); // Wait 500ms after last change before saving
```

**Session Recovery**:
```typescript
async function initializeApp() {
  // Check for active period on startup
  const activePeriod = await periodManager.getActivePeriod();

  if (!activePeriod) {
    // No active period found - check if app crashed during session
    const lastPeriod = await getLastPeriod();

    if (lastPeriod && lastPeriod.endTime === null) {
      // Found incomplete period - create recovery period
      // Set end time to last app close time (if available) or now
      await recoverIncompleteSession(lastPeriod);
    } else {
      // Normal startup - create first period
      await createInitialPeriod();
    }
  }
}
```

### 5.5 Performance Optimizations

**Virtual Scrolling for History**:
- Use react-window or similar for large period lists
- Only render visible periods
- Maintains performance with years of data

**Indexed Queries**:
- Leverage IndexedDB indexes for fast filtering
- Pre-compute aggregations for analytics

**Lazy Loading**:
- Load analytics data only when Analytics view is opened
- Paginate history view

**Memoization**:
- Cache computed values (totals, summaries)
- Invalidate cache only when underlying data changes

### 5.6 Timeline View Implementation

**Core Concept**:
The timeline view renders all time periods as a continuous horizontal bar with colored segments, allowing infinite scrolling through historical data.

**Implementation Approach**:
```typescript
interface TimelineConfig {
  pixelsPerHour: number;        // Base scale: pixels per hour
  zoomLevel: number;             // 1.0 = default, 2.0 = 2x zoomed in
  viewportWidth: number;         // Visible width in pixels
  bufferWidth: number;           // Extra rendering buffer (2x viewport)
}

class TimelineRenderer {
  private config: TimelineConfig;
  private scrollPosition: number;  // Current scroll offset (timestamp)

  // Convert timestamp to pixel position
  timestampToPixel(timestamp: number): number {
    const hours = timestamp / (1000 * 60 * 60);
    return hours * this.config.pixelsPerHour * this.config.zoomLevel;
  }

  // Convert pixel position to timestamp
  pixelToTimestamp(pixel: number): number {
    const hours = pixel / (this.config.pixelsPerHour * this.config.zoomLevel);
    return hours * 1000 * 60 * 60;
  }

  // Get visible time range based on scroll position
  getVisibleTimeRange(): { start: number; end: number } {
    const startTime = this.scrollPosition;
    const viewportHours = this.config.viewportWidth /
                          (this.config.pixelsPerHour * this.config.zoomLevel);
    const endTime = startTime + (viewportHours * 60 * 60 * 1000);

    return { start: startTime, end: endTime };
  }

  // Load periods visible in current viewport + buffer
  async loadVisiblePeriods(): Promise<TimePeriod[]> {
    const { start, end } = this.getVisibleTimeRange();
    const bufferTime = this.pixelToTimestamp(this.config.bufferWidth);

    return await periodManager.getPeriods({
      startTime: start - bufferTime,
      endTime: end + bufferTime
    });
  }

  // Render segments for visible periods
  renderSegments(periods: TimePeriod[]): SegmentElement[] {
    return periods.map(period => {
      const startX = this.timestampToPixel(period.startTime);
      const endX = period.endTime
        ? this.timestampToPixel(period.endTime)
        : this.timestampToPixel(Date.now());
      const width = endX - startX;

      return {
        period,
        x: startX,
        width,
        color: getThemeColor(period.theme),
        isPaused: period.isPaused
      };
    });
  }
}
```

**Infinite Scrolling Strategy**:
- Timeline conceptually extends infinitely in both directions
- Actual rendering window: viewport + 2x viewport buffer on each side
- As user scrolls, dynamically load periods entering the buffer zone
- Unload periods that have scrolled out of buffer to save memory

**Virtual Rendering**:
```typescript
class VirtualTimeline {
  private visibleSegments: Map<string, SegmentElement>;

  updateVisibleSegments(scrollPosition: number) {
    const range = this.getVisibleTimeRange(scrollPosition);

    // Remove segments outside buffer
    for (const [id, segment] of this.visibleSegments) {
      if (segment.period.endTime < range.start - bufferTime ||
          segment.period.startTime > range.end + bufferTime) {
        this.visibleSegments.delete(id);
        this.removeSegmentFromDOM(id);
      }
    }

    // Add segments entering buffer
    const newPeriods = await this.loadPeriodsInRange(range);
    for (const period of newPeriods) {
      if (!this.visibleSegments.has(period.id)) {
        this.visibleSegments.set(period.id, this.createSegment(period));
      }
    }
  }
}
```

**Time Markers**:
- Generate time markers dynamically based on zoom level
- Zoom level 1: Show hour markers
- Zoom level 0.5: Show 2-hour or 4-hour markers
- Zoom level 2+: Show 30-minute or 15-minute markers
- Show date boundaries (midnight) with special styling

**Performance Considerations**:
- Use CSS transforms for smooth scrolling (translate3d for GPU acceleration)
- Debounce scroll events for period loading (load after 100ms idle)
- RequestAnimationFrame for smooth rendering
- Canvas-based rendering for timelines with 1000+ periods (alternative to DOM)
- IndexedDB queries optimized with time-range indexes

**Interaction Handling**:
```typescript
// Click detection on segments
function handleTimelineClick(clickX: number, clickY: number) {
  const timestamp = pixelToTimestamp(clickX + scrollPosition);
  const period = findPeriodAtTime(timestamp);

  if (period) {
    showPeriodDetail(period);
  }
}

// Navigation to current period
function jumpToNow() {
  const now = Date.now();
  const targetX = timestampToPixel(now);
  smoothScrollTo(targetX - viewportWidth / 2); // Center current time
}

// Zoom controls
function setZoomLevel(zoom: number) {
  const centerTime = getCurrentCenterTime();
  config.zoomLevel = zoom;
  // Recalculate scroll to keep center time in center
  const newCenterX = timestampToPixel(centerTime);
  scrollTo(newCenterX - viewportWidth / 2);
}
```

## 6. CSV Export Format

```csv
Start Time,End Time,Duration (seconds),Theme,Category,Name,Notes,Tags,Is Paused
2025-11-05 08:00:00,2025-11-05 09:00:00,3600,Work,Development,Feature implementation,Working on time tracking app,"coding,react",false
2025-11-05 12:00:00,2025-11-05 12:30:00,1800,Pause,,,Lunch break,,true
```

**Notes**:
- Timestamps formatted as YYYY-MM-DD HH:MM:SS for spreadsheet compatibility
- Duration in seconds for easy calculations
- Tags joined with commas and quoted
- Is Paused field indicates pause periods for filtering

## 7. Error Handling

### 7.1 Storage Quota Exceeded
```typescript
try {
  await storageService.put('periods', period);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Notify user to export and clear old data
    showQuotaExceededDialog();
  }
}
```

### 7.2 Browser Crash Recovery
- Store last known state timestamp
- On startup, compare with current time
- If gap detected, create recovery period or prompt user

### 7.3 Data Validation
- Check for overlapping periods
- Verify timestamp integrity
- Handle malformed data gracefully

## 8. Testing Strategy

### 8.1 Unit Tests
- Storage service operations
- Period transition logic
- Analytics calculations
- Data validation functions

### 8.2 Integration Tests
- Complete period lifecycle
- Pause/resume flow (preserves metadata correctly)
- CSV export workflow (including pause periods)
- Keyboard shortcut handling

### 8.3 E2E Tests
- User can start tracking immediately
- Period transitions work correctly
- Pause/resume preserves work context
- Data persists across page reloads
- Keyboard shortcuts function as expected (Space, Alt+Space)

## 9. Deployment

### 9.1 Build Process
```bash
# Development
npm run dev

# Production build
npm run build
# Output: dist/ folder with optimized static files

# Preview production build
npm run preview
```

### 9.2 Hosting Options (Static Hosting)
- **GitHub Pages**: Free, easy deployment from repo
- **Netlify**: Free tier, automatic deploys, custom domains
- **Vercel**: Free tier, excellent performance
- **Cloudflare Pages**: Free, global CDN

### 9.3 Progressive Web App (PWA)
- Add service worker for offline support
- Add manifest.json for installability
- Cache static assets
- Enable "Add to Home Screen"

## 10. Security Considerations

### 10.1 Data Privacy
- All data stays in browser
- No network requests (no data leakage)
- User has full control of their data

### 10.2 XSS Prevention
- Sanitize user input (notes, names)
- Use framework's built-in escaping (React, Vue)
- Avoid dangerouslySetInnerHTML / v-html

### 10.3 Data Backup
- Encourage regular CSV exports for backup
- Provide clear export instructions
- Warn before clearing data
- Users can maintain their own backup copies in spreadsheet format

## 11. Future Technical Enhancements

### 11.1 Sync Service (Optional Backend)
- End-to-end encryption
- Conflict resolution
- Multi-device support

### 11.2 Advanced Analytics
- Machine learning for pattern detection
- Productivity insights
- Recommendations

### 11.3 Integrations
- Browser extension for background tracking
- Calendar import/export
- Third-party integrations (Toggl, RescueTime)

## 12. Development Milestones

### Phase 1: MVP (Weeks 1-2)
- Basic UI with current period display
- Period transition with spacebar
- Pause/resume with Alt+Space
- IndexedDB storage
- Simple history view

### Phase 2: Metadata (Week 3)
- Theme/category system
- Notes and tags
- Metadata editing

### Phase 3: Analytics & Visualization (Week 4)
- Summary calculations
- Basic charts
- Timeline view with infinite horizontal scrolling
- CSV export functionality

### Phase 4: Polish (Week 5)
- Keyboard shortcuts
- Settings panel
- Responsive design
- PWA support

### Phase 5: Testing & Launch (Week 6)
- Comprehensive testing
- Documentation
- Deployment
