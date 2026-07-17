/** Extracts the text of a TEXT-answer value shaped as `{ text: string }`. */
export function answerValueToText(value: unknown) {
	if (
		typeof value === 'object' &&
		value !== null &&
		'text' in value &&
		typeof value.text === 'string'
	) {
		return value.text;
	}

	return '';
}
