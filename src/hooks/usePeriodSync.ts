import { useEffect } from "react";
import { periodManager, timerManager } from "@/services";
import { useStore } from "@/stores/useStore";

/**
 * Hook to sync active period from storage to store
 */
export function useActivePeriodSync() {
	const setActivePeriod = useStore((state) => state.setActivePeriod);

	useEffect(() => {
		const loadActivePeriod = async () => {
			const activePeriod = await periodManager.getActivePeriod();
			setActivePeriod(activePeriod);
		};

		loadActivePeriod();
	}, [setActivePeriod]);
}

/**
 * Hook to sync periods from storage to store
 */
export function usePeriodSync() {
	const setPeriods = useStore((state) => state.setPeriods);

	const loadPeriods = async () => {
		const periods = await periodManager.getPeriods();
		setPeriods(periods);
	};

	useEffect(() => {
		loadPeriods();
	}, [setPeriods]);

	return { refresh: loadPeriods };
}

/**
 * Hook to subscribe to timer updates
 */
export function useTimerSubscription() {
	const activePeriod = useStore((state) => state.activePeriod);

	useEffect(() => {
		if (!activePeriod) return;

		// Start timer for active period
		timerManager.start(activePeriod);

		return () => {
			// Cleanup on unmount
			timerManager.stop();
		};
	}, [activePeriod?.id]); // Only restart if period ID changes
}
