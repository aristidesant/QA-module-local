import { OTHER_SEGMENT_KEY } from '../../constants';

/**
 * Chart colours are CSS variables declared on the analytics page (light and dark steps are
 * validated with the dataviz palette validator). Series order is fixed and never re-sorted:
 * blue next to grape fails for deuteranopia.
 */
export const SERIES_CURRENT = 'var(--series-current)';
export const SERIES_PREVIOUS = 'var(--series-previous)';
export const SERIES_OTHER = 'var(--series-other)';
export const SERIES = [
	'var(--series-1)',
	'var(--series-2)',
	'var(--series-3)',
	'var(--series-4)',
	'var(--series-5)',
	'var(--series-6)',
] as const;
/** One hue, light to dark: magnitude and ordered outcomes. */
export const HEAT = [
	'var(--heat-1)',
	'var(--heat-2)',
	'var(--heat-3)',
	'var(--heat-4)',
	'var(--heat-5)',
] as const;
/** Two hues around a neutral midpoint: ordered scales such as sentiment. */
export const DIVERGING = [
	'var(--div-neg-2)',
	'var(--div-neg-1)',
	'var(--div-mid)',
	'var(--div-pos-1)',
	'var(--div-pos-2)',
] as const;
export const STATUS = {
	high: 'var(--status-high)',
	medium: 'var(--status-medium)',
	low: 'var(--status-low)',
} as const;

/** Colour of the segment at `index` in the order buildSegments returns; "Other" is always gray. */
export const seriesColorAt = (index: number, key?: string): string =>
	key === OTHER_SEGMENT_KEY ? SERIES_OTHER : SERIES[index % SERIES.length];
