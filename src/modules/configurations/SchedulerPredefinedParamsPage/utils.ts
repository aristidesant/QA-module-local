import type { DayConfig } from '~/api/campaignsApi';

export const orderedDays: Array<DayConfig['dayOfWeek']> = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
];

export const dayLabelMap: Record<DayConfig['dayOfWeek'], string> = {
	monday: 'Mon',
	tuesday: 'Tue',
	wednesday: 'Wed',
	thursday: 'Thu',
	friday: 'Fri',
	saturday: 'Sat',
	sunday: 'Sun',
};

export const fullDayLabelMap: Record<DayConfig['dayOfWeek'], string> = {
	monday: 'Monday',
	tuesday: 'Tuesday',
	wednesday: 'Wednesday',
	thursday: 'Thursday',
	friday: 'Friday',
	saturday: 'Saturday',
	sunday: 'Sunday',
};

export const DEFAULT_START_HOUR = '08:00';
export const DEFAULT_END_HOUR = '17:00';

export const normalizeDayConfigs = (
	dayConfigs: DayConfig[] = []
): DayConfig[] =>
	orderedDays.map((dayOfWeek, index) => {
		const existing = dayConfigs.find((day) => day.dayOfWeek === dayOfWeek);
		const startHour =
			existing?.startHour && existing.startHour.trim()
				? existing.startHour
				: DEFAULT_START_HOUR;
		const endHour =
			existing?.endHour && existing.endHour.trim()
				? existing.endHour
				: DEFAULT_END_HOUR;

		return {
			dayOfWeek,
			dayOrder: existing?.dayOrder ?? index + 1,
			isActive: existing?.isActive ?? false,
			dailyCallLimit: existing?.dailyCallLimit ?? 0,
			dayCapacity: existing?.dayCapacity,
			startHour,
			endHour,
			hourConfigs: existing?.hourConfigs ?? [],
		};
	});

export const getActiveDaysLabel = (dayConfigs: DayConfig[]) => {
	const activeDays = dayConfigs.filter((day) => day.isActive);
	if (!activeDays.length) return 'No active days';

	const labels = activeDays.map((day) => dayLabelMap[day.dayOfWeek]);
	const display = labels.slice(0, 4).join(', ');
	return labels.length > 4 ? `${display} +${labels.length - 4}` : display;
};

export const getHoursWindow = (dayConfigs: DayConfig[]) => {
	const activeDays = dayConfigs.filter((day) => day.isActive);
	if (!activeDays.length) return 'No active hours';

	const earliestStart = activeDays.reduce((min, day) => {
		const start = day.startHour || DEFAULT_START_HOUR;
		return start < min ? start : min;
	}, activeDays[0].startHour || DEFAULT_START_HOUR);

	const latestEnd = activeDays.reduce((max, day) => {
		const end = day.endHour || DEFAULT_END_HOUR;
		return end > max ? end : max;
	}, activeDays[0].endHour || DEFAULT_END_HOUR);

	return `${earliestStart.slice(0, 5)} - ${latestEnd.slice(0, 5)}`;
};
