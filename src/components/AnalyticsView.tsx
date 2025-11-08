import { useEffect, useState } from "react";
import { analyticsEngine } from "@/services";
import { useStore } from "@/stores/useStore";
import { formatDuration } from "@/utils/format";

/**
 * Analytics View
 * Shows analytics, summaries, and charts
 */
export function AnalyticsView() {
	const periods = useStore((state) => state.periods);
	const config = useStore((state) => state.config);

	const [totalTime, setTotalTime] = useState(0);
	const [periodCount, setPeriodCount] = useState(0);
	const [mostActiveTheme, setMostActiveTheme] = useState<string | null>(null);
	const [byTheme, setByTheme] = useState<Map<string, number>>(new Map());

	useEffect(() => {
		const loadAnalytics = async () => {
			// Get today's summary
			const today = await analyticsEngine.getDailySummary(new Date());

			setTotalTime(today.totalDuration);
			setPeriodCount(today.periodCount);
			setByTheme(today.byTheme);

			// Get most active theme
			const mostActive = await analyticsEngine.getMostActiveTheme();
			setMostActiveTheme(mostActive);
		};

		loadAnalytics();
	}, [periods]);

	// Get theme name
	const getThemeName = (themeId: string) => {
		const theme = config.themes.find((t) => t.id === themeId);
		return theme?.name || themeId;
	};

	// Get theme color
	const getThemeColor = (themeId: string) => {
		const theme = config.themes.find((t) => t.id === themeId);
		return theme?.color || "#6b7280";
	};

	return (
		<div className="max-w-6xl mx-auto">
			<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
				Analytics
			</h2>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
						Total Time Today
					</h3>
					<p className="text-3xl font-bold text-gray-900 dark:text-white">
						{formatDuration(Math.floor(totalTime / 1000))}
					</p>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
						Periods Today
					</h3>
					<p className="text-3xl font-bold text-gray-900 dark:text-white">
						{periodCount}
					</p>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
						Most Active Theme
					</h3>
					<p className="text-3xl font-bold text-gray-900 dark:text-white">
						{mostActiveTheme ? getThemeName(mostActiveTheme) : "-"}
					</p>
				</div>
			</div>

			{/* Time by Theme */}
			{byTheme.size > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						Time by Theme
					</h3>

					<div className="space-y-3">
						{Array.from(byTheme.entries())
							.sort((a, b) => b[1] - a[1])
							.map(([themeId, duration]) => {
								const percentage =
									totalTime > 0 ? (duration / totalTime) * 100 : 0;

								return (
									<div key={themeId}>
										<div className="flex justify-between items-center mb-1">
											<div className="flex items-center gap-2">
												<div
													className="w-3 h-3 rounded-full"
													style={{ backgroundColor: getThemeColor(themeId) }}
												/>
												<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
													{getThemeName(themeId)}
												</span>
											</div>
											<span className="text-sm text-gray-600 dark:text-gray-400">
												{formatDuration(Math.floor(duration / 1000))} (
												{percentage.toFixed(0)}%)
											</span>
										</div>
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
											<div
												className="h-2 rounded-full transition-all"
												style={{
													width: `${percentage}%`,
													backgroundColor: getThemeColor(themeId),
												}}
											/>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			)}

			{periods.length === 0 && (
				<div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
					<p className="text-gray-600 dark:text-gray-400">
						No data available yet
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
						Start tracking your time to see analytics
					</p>
				</div>
			)}
		</div>
	);
}
