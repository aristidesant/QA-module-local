import type { DayConfig, HourConfig } from '~/models/SchedulerModel';

export const MINUTES_PER_HOUR = 60;
export const TALK_MINUTES_PER_HOUR = 38.5;

type MaybeHourConfig = Partial<HourConfig>;
type MaybeDayConfig = Partial<DayConfig> & { hourConfigs?: MaybeHourConfig[] };

export const parseTimeToMinutes = (time?: string | null): number | null => {
	if (!time) {
		return null;
	}

	const [hoursPart = '0', minutesPart = '0'] = time.split(':');
	const hours = Number(hoursPart);
	const minutes = Number(minutesPart);

	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return null;
	}

	return hours * MINUTES_PER_HOUR + minutes;
};

export const calculateHourConfigMinutes = (
	hourConfigs?: MaybeHourConfig[]
): number => {
	if (!hourConfigs || hourConfigs.length === 0) {
		return 0;
	}

	const activeSlots = hourConfigs.filter((slot) => slot?.isActive);

	if (activeSlots.length === 0) {
		return 0;
	}

	return activeSlots.length * MINUTES_PER_HOUR;
};

export const calculateDayMinutes = (day?: MaybeDayConfig): number => {
	if (!day || !day.isActive) {
		return 0;
	}

	const hourConfigMinutes = calculateHourConfigMinutes(day.hourConfigs);
	if (hourConfigMinutes > 0) {
		return hourConfigMinutes;
	}

	const start = parseTimeToMinutes(day.startHour);
	const end = parseTimeToMinutes(day.endHour);

	if (start === null || end === null || end <= start) {
		return 0;
	}

	return end - start;
};

export const calculatePerAgentTalkMinutes = (dayMinutes: number): number => {
	if (!Number.isFinite(dayMinutes) || dayMinutes <= 0) {
		return 0;
	}

	return (dayMinutes / MINUTES_PER_HOUR) * TALK_MINUTES_PER_HOUR;
};

export const calculateTeamTalkMinutes = (
	perAgentMinutes: number,
	humanEquivalent: number
): number => {
	const headcount =
		Number.isFinite(humanEquivalent) && humanEquivalent > 0
			? humanEquivalent
			: 0;
	if (perAgentMinutes <= 0 || headcount <= 0) {
		return 0;
	}

	return perAgentMinutes * headcount;
};

export const formatMinutesLabel = (minutes: number): string => {
	if (!Number.isFinite(minutes) || minutes <= 0) {
		return '0 min';
	}

	return `${Math.round(minutes)} min`;
};

export type { MaybeDayConfig, MaybeHourConfig };
