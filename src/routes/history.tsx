import { createFileRoute } from "@tanstack/react-router";
import { HistoryView } from "@/components/HistoryView";

/**
 * History Route
 * Shows list of completed periods
 */
export const Route = createFileRoute("/history")({
	component: HistoryView,
});
