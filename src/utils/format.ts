/**
 * Format elapsed time in milliseconds to HH:MM:SS
 */
export function formatElapsedTime(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const pad = (num: number) => String(num).padStart(2, "0");

	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format elapsed time with days if > 24 hours
 */
export function formatElapsedTimeWithDays(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const days = Math.floor(totalSeconds / 86400);

	if (days > 0) {
		const remainingSeconds = totalSeconds % 86400;
		const hours = Math.floor(remainingSeconds / 3600);
		const minutes = Math.floor((remainingSeconds % 3600) / 60);
		const seconds = remainingSeconds % 60;

		const pad = (num: number) => String(num).padStart(2, "0");

		return `${days} day${days > 1 ? "s" : ""} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
	}

	return formatElapsedTime(ms);
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	const parts: string[] = [];

	if (hours > 0) {
		parts.push(`${hours}h`);
	}

	if (minutes > 0) {
		parts.push(`${minutes}m`);
	}

	if (secs > 0 || parts.length === 0) {
		parts.push(`${secs}s`);
	}

	return parts.join(" ");
}

/**
 * Format timestamp to date string
 */
export function formatDate(
	timestamp: number,
	format: string = "YYYY-MM-DD",
): string {
	const date = new Date(timestamp);

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return format
		.replace("YYYY", String(year))
		.replace("MM", month)
		.replace("DD", day);
}

/**
 * Format timestamp to time string
 */
export function formatTime(
	timestamp: number,
	format24h: boolean = true,
): string {
	const date = new Date(timestamp);

	if (format24h) {
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${hours}:${minutes}`;
	} else {
		let hours = date.getHours();
		const ampm = hours >= 12 ? "PM" : "AM";
		hours = hours % 12 || 12;
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${hours}:${minutes} ${ampm}`;
	}
}

/**
 * Format timestamp to date and time string
 */
export function formatDateTime(
	timestamp: number,
	format24h: boolean = true,
): string {
	return `${formatDate(timestamp)} ${formatTime(timestamp, format24h)}`;
}
