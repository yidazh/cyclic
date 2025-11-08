import { createFileRoute } from "@tanstack/react-router";
import { TimelineView } from "@/components/TimelineView";

/**
 * Timeline Route
 * Fullscreen timeline visualization
 */
export const Route = createFileRoute("/timeline")({
	component: TimelineView,
});
