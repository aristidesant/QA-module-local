import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	selectSentimentAnalyzer,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';
import { selectThresholds, useSettingsStore } from '~/stores/qa/settingsStore';
import {
	SENTIMENT_CAUSES,
	SENTIMENT_CAUSES_NS,
	SENTIMENT_CAUSE_KEYS_BY_FAMILY,
	SENTIMENT_CAUSE_NONE_KEY,
	SENTIMENT_CAUSE_ORDER,
	isCustomCauseKey,
} from './constants';
import type {
	AnyCauseKey,
	CustomSentimentCause,
	SentimentCauseCatalogue,
	SentimentCauseFamily,
	SentimentCauseKey,
	SentimentCauseSettings,
} from './types';

/** What the QA Manager set in Settings for their operation (raw slice, stable reference). */
export const useCauseSettings = (): SentimentCauseSettings =>
	useSettingsStore(selectThresholds).sentiment.causes;

/** The shared catalogue from Global configuration: AI guidance and the causes added on top of the built-in nine. */
export const useCauseCatalogue = (): SentimentCauseCatalogue =>
	useGlobalConfigStore(selectSentimentAnalyzer).causes;

/**
 * Label of a cause: the operation's name from Settings, else the default
 * (translated for a built-in cause, the catalogue name for an added one).
 * Also resolves 'none' (the no-drop segment), which is never renamed.
 */
export function useCauseLabel() {
	const { t } = useTranslation(SENTIMENT_CAUSES_NS);
	const { names } = useCauseSettings();
	const { custom } = useCauseCatalogue();
	return (key: AnyCauseKey | typeof SENTIMENT_CAUSE_NONE_KEY): string => {
		if (key === SENTIMENT_CAUSE_NONE_KEY) return t('causes.none');
		const renamed = names[key]?.trim();
		if (renamed) return renamed;
		if (isCustomCauseKey(key))
			return custom.find((c) => c.key === key)?.name ?? key;
		return t(`causes.${key}`);
	};
}

/** Built-in causes still switched on, in catalogue order (what the analytics filter offers). */
export function useEnabledCauseKeys(): SentimentCauseKey[] {
	const { disabled } = useCauseSettings();
	return useMemo(
		() => SENTIMENT_CAUSE_ORDER.filter((key) => !disabled.includes(key)),
		[disabled]
	);
}

/** Every cause of one family, built-in first then the ones added in the catalogue. */
export const causeKeysOfFamily = (
	custom: CustomSentimentCause[],
	family: SentimentCauseFamily
): AnyCauseKey[] => [
	...SENTIMENT_CAUSE_KEYS_BY_FAMILY[family],
	...custom.filter((c) => c.family === family).map((c) => c.key),
];

/** Family a cause belongs to. */
export function useCauseFamily() {
	const { custom } = useCauseCatalogue();
	return (key: AnyCauseKey): SentimentCauseFamily =>
		isCustomCauseKey(key)
			? (custom.find((c) => c.key === key)?.family ?? 'BUSINESS')
			: SENTIMENT_CAUSES[key].family;
}
