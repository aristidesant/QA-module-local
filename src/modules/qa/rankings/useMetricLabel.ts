import { useTranslation } from 'react-i18next';
import type { RankingMetricId } from '~/models/qa/rankingPrograms';
import { isOperationalMetric } from './metrics';

/** Label of any ranking metric: operational ones live in this namespace, the rest in Team Analytics. */
export const useMetricLabel = () => {
	const { t } = useTranslation('qa.rankings');
	const { t: tMetrics } = useTranslation('qa.teamAnalytics');
	return (id: RankingMetricId): string =>
		isOperationalMetric(id) ? t(`metrics.${id}`) : tMetrics(`metrics.${id}`);
};
