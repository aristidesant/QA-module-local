import dayjs from 'dayjs';

/** Axis label of a period key: `2026-09-12` → "12 Sep", `2026-W37` → "W37", `2026-09` → "Sep 26". */
export const formatPeriod = (period: string): string => {
	if (/-W\d{2}$/.test(period)) return `W${period.slice(-2)}`;
	if (/^\d{4}-\d{2}$/.test(period))
		return dayjs(`${period}-01`).format('MMM YY');
	return dayjs(period).format('DD MMM');
};
