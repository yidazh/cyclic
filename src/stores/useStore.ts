import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { type AppConfig, defaultConfig, type TimePeriod } from "@/types";

/**
 * Main Application Store
 * Manages all global state using Zustand
 */
interface AppStore {
	// Active Period State
	activePeriod: TimePeriod | null;
	setActivePeriod: (period: TimePeriod | null) => void;

	// Period History
	periods: TimePeriod[];
	setPeriods: (periods: TimePeriod[]) => void;
	addPeriod: (period: TimePeriod) => void;
	updatePeriod: (id: string, updates: Partial<TimePeriod>) => void;

	// Pause State
	isPaused: boolean;
	setIsPaused: (paused: boolean) => void;

	// Configuration
	config: AppConfig;
	updateConfig: (updates: Partial<AppConfig>) => void;

	// Break Reminder
	reminderActive: boolean;
	setReminderActive: (active: boolean) => void;

	// UI State
	currentView: "current" | "history" | "analytics" | "timeline" | "settings";
	setCurrentView: (view: AppStore["currentView"]) => void;

	// Loading State
	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;
}

/**
 * Create Zustand Store
 * With devtools middleware for debugging
 */
export const useStore = create<AppStore>()(
	devtools(
		(set) => ({
			// Initial state
			activePeriod: null,
			periods: [],
			isPaused: false,
			config: defaultConfig,
			reminderActive: false,
			currentView: "current",
			isLoading: false,

			// Actions
			setActivePeriod: (period) => set({ activePeriod: period }),

			setPeriods: (periods) => set({ periods }),

			addPeriod: (period) =>
				set((state) => ({
					periods: [period, ...state.periods],
				})),

			updatePeriod: (id, updates) =>
				set((state) => ({
					periods: state.periods.map((p) =>
						p.id === id ? { ...p, ...updates } : p,
					),
				})),

			setIsPaused: (paused) => set({ isPaused: paused }),

			updateConfig: (updates) =>
				set((state) => ({
					config: { ...state.config, ...updates },
				})),

			setReminderActive: (active) => set({ reminderActive: active }),

			setCurrentView: (view) => set({ currentView: view }),

			setIsLoading: (loading) => set({ isLoading: loading }),
		}),
		{ name: "TimeTrackingStore" },
	),
);

/**
 * Selector Hooks
 * For selective subscriptions to avoid unnecessary re-renders
 */
export const useActivePeriod = () => useStore((state) => state.activePeriod);
export const usePeriods = () => useStore((state) => state.periods);
export const useIsPaused = () => useStore((state) => state.isPaused);
export const useConfig = () => useStore((state) => state.config);
export const useReminderActive = () =>
	useStore((state) => state.reminderActive);
export const useCurrentView = () => useStore((state) => state.currentView);
export const useIsLoading = () => useStore((state) => state.isLoading);
