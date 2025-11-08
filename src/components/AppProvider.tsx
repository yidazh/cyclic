import { type ReactNode, useEffect, useState } from "react";
import {
	useActivePeriodSync,
	useKeyboardShortcuts,
	usePeriodSync,
} from "@/hooks";
import { appInitService } from "@/services";
import { useStore } from "@/stores/useStore";

interface AppProviderProps {
	children: ReactNode;
}

/**
 * App Provider
 * Initializes the application and provides global state
 */
export function AppProvider({ children }: AppProviderProps) {
	const [isInitializing, setIsInitializing] = useState(true);
	const [initError, setInitError] = useState<string | null>(null);
	const setIsLoading = useStore((state) => state.setIsLoading);

	useEffect(() => {
		const initialize = async () => {
			try {
				setIsLoading(true);
				await appInitService.initialize();
				setIsInitializing(false);
			} catch (error) {
				console.error("Failed to initialize app:", error);
				setInitError(
					error instanceof Error ? error.message : "Failed to initialize",
				);
				setIsInitializing(false);
			} finally {
				setIsLoading(false);
			}
		};

		initialize();

		// Cleanup on unmount
		return () => {
			appInitService.shutdown();
		};
	}, [setIsLoading]);

	// Show loading state during initialization
	if (isInitializing) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-400">Initializing...</p>
				</div>
			</div>
		);
	}

	// Show error state if initialization failed
	if (initError) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center max-w-md">
					<div className="text-red-600 text-5xl mb-4">⚠️</div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
						Initialization Failed
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-4">{initError}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
					>
						Reload Page
					</button>
				</div>
			</div>
		);
	}

	return <AppContent>{children}</AppContent>;
}

/**
 * App Content
 * Manages data syncing and keyboard shortcuts after initialization
 */
function AppContent({ children }: { children: ReactNode }) {
	// Sync active period and periods from storage
	useActivePeriodSync();
	usePeriodSync();

	// Register keyboard shortcuts
	useKeyboardShortcuts();

	return <>{children}</>;
}
