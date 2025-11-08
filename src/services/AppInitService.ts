import { breakReminderService } from "./BreakReminderService";
import { keyboardShortcutService } from "./KeyboardShortcutService";
import { periodManager } from "./PeriodManager";
import { storageService } from "./StorageService";
import { timerManager } from "./TimerManager";

/**
 * App Initialization Service
 * Handles app startup and lifecycle management
 */
export class AppInitService {
	private initialized = false;

	/**
	 * Initialize the application
	 * Sets up all services and recovers state
	 */
	async initialize(): Promise<void> {
		if (this.initialized) {
			console.warn("App already initialized");
			return;
		}

		try {
			console.log("Initializing application...");

			// 1. Initialize storage (SQLite Wasm)
			console.log("Initializing storage...");
			await storageService.init();

			// 2. Initialize period manager (creates initial period if needed)
			console.log("Initializing period manager...");
			await periodManager.initialize();

			// 3. Get active period and start timer if exists
			const activePeriod = await periodManager.getActivePeriod();
			if (activePeriod) {
				console.log("Starting timer for active period...");
				timerManager.start(activePeriod);
			}

			// 4. Set up break reminder callbacks
			this.setupReminderCallbacks();

			// 5. Initialize keyboard shortcuts
			console.log("Initializing keyboard shortcuts...");
			keyboardShortcutService.initialize();
			this.setupKeyboardShortcuts();

			// 6. Set up visibility change handling
			this.setupVisibilityHandling();

			// 7. Set up beforeunload handling
			this.setupBeforeUnloadHandling();

			this.initialized = true;
			console.log("Application initialized successfully");
		} catch (error) {
			console.error("Failed to initialize application:", error);
			throw error;
		}
	}

	/**
	 * Set up reminder callbacks
	 */
	private setupReminderCallbacks(): void {
		breakReminderService.setOnReminderTriggered(() => {
			console.log("Break reminder triggered");
			// UI will handle updating state via store
		});

		breakReminderService.setOnReminderCancelled(() => {
			console.log("Break reminder cancelled");
			// UI will handle updating state via store
		});
	}

	/**
	 * Set up keyboard shortcuts
	 * Note: Actual handlers will be registered by UI components
	 * This is just setting up the service
	 */
	private setupKeyboardShortcuts(): void {
		// Default shortcuts will be registered by UI components
		// that have access to the store
		console.log("Keyboard shortcut service ready");
	}

	/**
	 * Set up visibility change handling
	 * Ensures timer syncs when tab becomes visible
	 */
	private setupVisibilityHandling(): void {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				console.log("App became visible, syncing state...");
				// Timer manager already handles this internally
			}
		});
	}

	/**
	 * Set up beforeunload handling
	 * Shows warning if user tries to close during active period
	 */
	private setupBeforeUnloadHandling(): void {
		window.addEventListener("beforeunload", (_e) => {
			// Check if there's an active period
			// Note: This is synchronous, so we can't use async storage calls
			// The data should already be persisted by this point
			// Optionally show confirmation dialog
			// Uncomment if you want to warn users before closing
			/*
      const activePeriod = timerManager.isRunning();
      if (activePeriod) {
        _e.preventDefault();
        _e.returnValue = '';
      }
      */
		});
	}

	/**
	 * Shutdown the application
	 * Clean up resources
	 */
	async shutdown(): Promise<void> {
		console.log("Shutting down application...");

		// Stop timer
		timerManager.stop();

		// Cancel any active reminders
		breakReminderService.cancelReminder();

		// Cleanup keyboard shortcuts
		keyboardShortcutService.cleanup();

		this.initialized = false;
		console.log("Application shutdown complete");
	}

	/**
	 * Check if app is initialized
	 */
	isInitialized(): boolean {
		return this.initialized;
	}
}

// Singleton instance
export const appInitService = new AppInitService();
