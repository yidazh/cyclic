import type { DateRange, TimePeriod } from "@/types";
import { storageService } from "./StorageService";

/**
 * CSV Export Service
 * Exports period data to CSV format
 */
export class CSVExportService {
	/**
	 * Export periods as CSV
	 */
	async exportCSV(dateRange?: DateRange): Promise<Blob> {
		const periods = dateRange
			? await storageService.getPeriods({
					startTime: dateRange.start.getTime(),
					endTime: dateRange.end.getTime(),
				})
			: await storageService.getPeriods();

		// Generate CSV content
		const headers = this.getCSVHeaders();
		const rows = periods
			.filter((p) => p.endTime !== null)
			.map((p) => this.formatPeriodForCSV(p));

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.join(",")),
		].join("\n");

		// Create blob
		return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	}

	/**
	 * Generate CSV header row
	 */
	getCSVHeaders(): string[] {
		return [
			"Start Time",
			"End Time",
			"Duration (seconds)",
			"Theme",
			"Category",
			"Name",
			"Notes",
			"Tags",
			"Is Paused",
		];
	}

	/**
	 * Format period data for CSV
	 */
	formatPeriodForCSV(period: TimePeriod): string[] {
		const startTime = this.formatTimestamp(period.startTime);
		const endTime = period.endTime ? this.formatTimestamp(period.endTime) : "";
		const duration = period.endTime
			? Math.floor((period.endTime - period.startTime) / 1000)
			: 0;

		return [
			startTime,
			endTime,
			duration.toString(),
			this.escapeCSV(period.theme || ""),
			this.escapeCSV(period.category || ""),
			this.escapeCSV(period.name),
			this.escapeCSV(period.notes),
			this.escapeCSV(period.tags.join(", ")),
			period.isPaused.toString(),
		];
	}

	/**
	 * Format timestamp as YYYY-MM-DD HH:MM:SS
	 */
	private formatTimestamp(timestamp: number): string {
		const date = new Date(timestamp);

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");

		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}

	/**
	 * Escape CSV field (handle commas, quotes, newlines)
	 */
	private escapeCSV(value: string): string {
		if (value.includes(",") || value.includes('"') || value.includes("\n")) {
			return `"${value.replace(/"/g, '""')}"`;
		}
		return value;
	}

	/**
	 * Download CSV file
	 */
	downloadCSV(blob: Blob, filename?: string): void {
		const finalFilename = filename || this.generateFilename();

		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = finalFilename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	/**
	 * Generate filename with current date
	 */
	private generateFilename(): string {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");

		return `time-tracking-${year}-${month}-${day}.csv`;
	}

	/**
	 * Export and download in one step
	 */
	async exportAndDownload(
		dateRange?: DateRange,
		filename?: string,
	): Promise<void> {
		try {
			const blob = await this.exportCSV(dateRange);
			this.downloadCSV(blob, filename);
		} catch (error) {
			console.error("Failed to export CSV:", error);
			throw new Error("Failed to export CSV");
		}
	}
}

// Singleton instance
export const csvExportService = new CSVExportService();
