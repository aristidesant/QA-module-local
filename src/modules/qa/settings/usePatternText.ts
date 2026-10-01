import { useTranslation } from 'react-i18next';
import type { BurnoutDriverMetricId } from '~/modules/qa/analytics/types';
import { BUILT_IN_PATTERN_LABEL_KEY } from './constants';
import {
	displayThreshold,
	isCatalogueMetric,
	patternMetricInfo,
	unitSuffix,
} from './burnoutPatterns';
import type { BurnoutPattern } from './types';

/** Names and sentences for burnout patterns, shared by the Settings table, the drawer and the Burnout view. */
export const usePatternText = () => {
	const { t } = useTranslation([
		'qa.settings',
		'qa.teamAnalytics',
		'qa.triggers',
	]);

	const metricLabel = (id: BurnoutDriverMetricId) =>
		isCatalogueMetric(id)
			? t(`metrics.${id}`, { ns: 'qa.triggers' })
			: t(`burnout.metrics.${id}`, { ns: 'qa.settings' });

	/** Built-ins are named from i18n; patterns the QA Manager created carry their own name. */
	const patternName = (
		pattern: Pick<BurnoutPattern, 'id' | 'name' | 'builtIn'>
	) => {
		const key = BUILT_IN_PATTERN_LABEL_KEY[pattern.id];
		return pattern.builtIn && key
			? t(`burnout.drivers.${key}`, { ns: 'qa.teamAnalytics' })
			: pattern.name || pattern.id;
	};

	const unitOf = (pattern: BurnoutPattern) =>
		pattern.mode === 'STREAK'
			? ''
			: unitSuffix(patternMetricInfo(pattern.metricId).unit);

	/** "Agent sentiment drops by 0.3 pts or more vs the previous 14 days". */
	const condition = (pattern: BurnoutPattern) => {
		const metricUnit = unitSuffix(patternMetricInfo(pattern.metricId).unit);
		return t(`burnout.condition.${pattern.mode}.${pattern.direction}`, {
			ns: 'qa.settings',
			metric: metricLabel(pattern.metricId),
			threshold: displayThreshold(pattern),
			unit: pattern.mode === 'STREAK' ? '%' : metricUnit,
			dayLevel: pattern.dayLevel,
			days: pattern.windowDays,
		});
	};

	/** "Value · last 7 days", "Change vs previous 14 days" or "Streak · last 30 days". */
	const modeSummary = (pattern: BurnoutPattern) =>
		t(`burnout.modeSummary.${pattern.mode}`, {
			ns: 'qa.settings',
			days: pattern.windowDays,
		});

	/** Unit shown beside the threshold input: days for a streak, otherwise the metric's unit. */
	const thresholdUnit = (pattern: BurnoutPattern) =>
		pattern.mode === 'STREAK'
			? t('burnout.units.days', { ns: 'qa.settings' })
			: unitOf(pattern).trim();

	return { metricLabel, patternName, condition, modeSummary, thresholdUnit };
};
