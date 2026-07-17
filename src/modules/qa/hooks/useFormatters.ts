import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type DateFormatterPreset = 'date' | 'dateTime';

const DATE_PRESETS: Record<DateFormatterPreset, Intl.DateTimeFormatOptions> = {
	date: { dateStyle: 'medium' },
	dateTime: { dateStyle: 'medium', timeStyle: 'short' },
};

/** Locale-aware Intl.DateTimeFormat memoized on the active i18n language. */
export function useDateFormatter(preset: DateFormatterPreset = 'date') {
	const { i18n } = useTranslation();
	const locale = i18n.resolvedLanguage ?? 'en';

	return useMemo(
		() => new Intl.DateTimeFormat(locale, DATE_PRESETS[preset]),
		[locale, preset]
	);
}

/** Locale-aware Intl.NumberFormat memoized on the active i18n language. */
export function useNumberFormatter(options?: Intl.NumberFormatOptions) {
	const { i18n } = useTranslation();
	const locale = i18n.resolvedLanguage ?? 'en';
	const optionsKey = options ? JSON.stringify(options) : '';

	return useMemo(
		() => new Intl.NumberFormat(locale, options),
		// eslint-disable-next-line react-hooks/exhaustive-deps -- optionsKey captures options content
		[locale, optionsKey]
	);
}
