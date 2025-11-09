import { useCallback } from "react";
import { breakReminderService, periodManager } from "@/services";
import { useStore } from "@/stores/useStore";

/**
 * Hook to handle period transitions
 */
export function usePeriodActions() {
	const setActivePeriod = useStore((state) => state.setActivePeriod);
	const addPeriod = useStore((state) => state.addPeriod);
	const setIsPaused = useStore((state) => state.setIsPaused);

	const transitionPeriod = useCallback(async () => {
		try {
			// Auto-dismiss break reminder when ending period
			breakReminderService.cancelReminder();

			const newPeriod = await periodManager.transitionPeriod();
			setActivePeriod(newPeriod);
			setIsPaused(false);

			// Reload periods to update history
			const periods = await periodManager.getPeriods();
			useStore.getState().setPeriods(periods);
		} catch (error) {
			console.error("Failed to transition period:", error);
			throw error;
		}
	}, [setActivePeriod, setIsPaused, addPeriod]);

	const pauseResume = useCallback(async () => {
		try {
			const newPeriod = await periodManager.pauseResume();
			setActivePeriod(newPeriod);
			setIsPaused(newPeriod.isPaused);

			// Reload periods to update history
			const periods = await periodManager.getPeriods();
			useStore.getState().setPeriods(periods);
		} catch (error) {
			console.error("Failed to pause/resume:", error);
			throw error;
		}
	}, [setActivePeriod, setIsPaused]);

	const updateActivePeriod = useCallback(
		async (updates: {
			name?: string;
			notes?: string;
			theme?: string;
			category?: string;
			tags?: string[];
		}) => {
			const activePeriod = useStore.getState().activePeriod;
			if (!activePeriod) return;

			try {
				const updated = await periodManager.updatePeriod(
					activePeriod.id,
					updates,
				);
				setActivePeriod(updated);
			} catch (error) {
				console.error("Failed to update period:", error);
				throw error;
			}
		},
		[setActivePeriod],
	);

	return {
		transitionPeriod,
		pauseResume,
		updateActivePeriod,
	};
}
