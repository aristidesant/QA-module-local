import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { TODAY } from '~/modules/qa/analytics/constants';

/** Whole calendar days from the mock today to the date; 0 is today. */
export const daysFromToday = (iso: string): number =>
	dayjs(iso.slice(0, 10)).diff(dayjs(TODAY), 'day');

/** Lowercase phrase for the middle of a sentence: "today", "tomorrow", "in 4 days". */
export const whenPhrase = (t: TFunction, iso: string): string => {
	const days = daysFromToday(iso);
	if (days <= 0) return t('agent.coaching.headline.when.today');
	if (days === 1) return t('agent.coaching.headline.when.tomorrow');
	return t('agent.coaching.headline.when.inDays', { count: days });
};

/** Capitalised phrase for a heading: "Today", "Tomorrow", "In 4 days". */
export const whenHeading = (t: TFunction, iso: string): string => {
	const days = daysFromToday(iso);
	if (days <= 0) return t('agent.coaching.next.relative.today');
	if (days === 1) return t('agent.coaching.next.relative.tomorrow');
	return t('agent.coaching.next.relative.inDays', { count: days });
};
