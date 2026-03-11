interface WaveDelayLabels {
	day: string;
	hour: string;
	minute: string;
	second: string;
	noDelay: string;
	notSet: string;
}

const getDurationParts = (totalSeconds: number) => {
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return [
		{ value: days, unit: 'day' as const },
		{ value: hours, unit: 'hour' as const },
		{ value: minutes, unit: 'minute' as const },
		{ value: seconds, unit: 'second' as const },
	].filter((part) => part.value > 0);
};

export const formatWaveDelaySeconds = (
	totalSeconds: number | null | undefined,
	labels: WaveDelayLabels
) => {
	if (totalSeconds === null || totalSeconds === undefined) {
		return labels.notSet;
	}

	if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
		return labels.notSet;
	}

	if (totalSeconds === 0) {
		return labels.noDelay;
	}

	const parts = getDurationParts(Math.round(totalSeconds)).slice(0, 2);

	if (parts.length === 0) {
		return labels.noDelay;
	}

	return parts.map((part) => `${part.value}${labels[part.unit]}`).join(' ');
};

export const formatWaveDateTime = (
	value: string | null | undefined,
	locale: string,
	fallback: string
) => {
	if (!value) {
		return fallback;
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return fallback;
	}

	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	}).format(date);
};
