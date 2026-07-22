/** Formats a 0-100 score percentage with one decimal, e.g. "86.7". */
export function formatScorePct(value: number | string | null | undefined) {
	return Number(value ?? 0).toFixed(1);
}

/** Formats a raw score/points value with two decimals, e.g. "5.00". */
export function formatPoints(value: number) {
	return value.toFixed(2);
}

/** Formats a delta with an explicit sign, e.g. "+5.00" / "-2.50". */
export function formatSignedDelta(value: number) {
	return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
}
