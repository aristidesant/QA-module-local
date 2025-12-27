import type { DayConfig } from '~/api/campaignsApi';
import type { TFunction } from 'i18next';

export const orderedDays: Array<DayConfig['dayOfWeek']> = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
];

export const getDayAbbrevLabel = (t: TFunction, day: DayConfig['dayOfWeek']) =>
	t(`days.abbrev.${day}`);

export const getDayFullLabel = (t: TFunction, day: DayConfig['dayOfWeek']) =>
	t(`days.full.${day}`);

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

export const getActiveDaysLabel = (dayConfigs: DayConfig[], t: TFunction) => {
	const activeDays = dayConfigs.filter((day) => day.isActive);
	if (!activeDays.length) return t('list.noActiveDays');

	const labels = activeDays.map((day) => getDayAbbrevLabel(t, day.dayOfWeek));
	const display = labels.slice(0, 4).join(', ');
	return labels.length > 4 ? `${display} +${labels.length - 4}` : display;
};

export const getHoursWindow = (dayConfigs: DayConfig[], t: TFunction) => {
	const activeDays = dayConfigs.filter((day) => day.isActive);
	if (!activeDays.length) return t('list.noActiveHours');

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
