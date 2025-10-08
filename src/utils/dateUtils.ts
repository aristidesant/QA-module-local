import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Returns a human-readable relative time string (e.g., "2 hours ago", "3 days ago")
 * Considers the current timezone for accurate calculations
 *
 * @param date - The date to calculate relative time from (assumed to be in UTC)
 * @returns Relative time string
 */
export function timeAgo(date: Date | string | number): string {
	const now = dayjs(); // Current time in local timezone

	let target: dayjs.Dayjs;
	if (typeof date === 'string') {
		// Always treat string dates as UTC from the backend
		target = dayjs.utc(date).local();
	} else {
		// Date objects and numbers are treated as local time
		target = dayjs(date);
	}

	if (!target.isValid()) {
		return 'Invalid date';
	}

	const diffInMinutes = now.diff(target, 'minute');
	const diffInHours = now.diff(target, 'hour');
	const diffInDays = now.diff(target, 'day');
	const diffInWeeks = now.diff(target, 'week');
	const diffInMonths = now.diff(target, 'month');
	const diffInYears = now.diff(target, 'year');

	if (diffInMinutes < 1) {
		return 'Just now';
	} else if (diffInMinutes < 60) {
		return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
	} else if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
	} else if (diffInDays < 7) {
		return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
	} else if (diffInWeeks < 4) {
		return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
	} else if (diffInMonths < 12) {
		return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
	} else {
		return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
	}
}

/**
 * Formats an expiration date string to a human-readable format (e.g., "Jan 1, 2025")
 * Handles different date formats including ISO strings and YYYY-MM-DD
 *
 * @param dateString - The date string to format
 * @returns Formatted date string in "MMM D, YYYY" format or empty string if invalid
 */
export function formatExpirationDate(dateString?: string | null): string {
	if (!dateString) return '';

	try {
		// Handle ISO format strings by splitting at T
		const datePart = dateString.includes('T')
			? dateString.split('T')[0]
			: dateString;

		// Use dayjs for all parsing and formatting
		const parsed = dayjs(datePart);
		if (parsed.isValid()) {
			return parsed.format('MMM D, YYYY');
		}
		return '';
	} catch (e) {
		console.error('Error formatting expiration date:', e, dateString);
		return '';
	}
}

/**
 * Checks if a date string represents a valid date
 *
 * @param dateString - The date string to validate
 * @returns Boolean indicating if the date is valid
 */
export function isValidDate(dateString?: string | null): boolean {
	if (!dateString) return false;

	try {
		const datePart = dateString.includes('T')
			? dateString.split('T')[0]
			: dateString;
		return dayjs(datePart).isValid();
	} catch (e) {
		return false;
	}
}
