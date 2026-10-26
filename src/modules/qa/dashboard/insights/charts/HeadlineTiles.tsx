import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import {
	MetricTileRow,
	type MetricTileProps,
} from '~/modules/qa/analytics/TeamAnalyticsPage/charts';
import { formatMetric } from '~/modules/qa/analytics/helpers';
import type { HeadlineKpi } from '../insightsMetrics';

interface HeadlineTilesProps {
	kpis: HeadlineKpi[];
}

/** The six headline numbers: value, change against the previous window and a sparkline each. */
export function HeadlineTiles({ kpis }: HeadlineTilesProps) {
	const { t } = useTranslation('qa.dashboard');
	const tiles: MetricTileProps[] = kpis.map((kpi) => ({
		label: t(`operationManager.insights.kpis.${kpi.key}`),
		value: formatMetric(kpi.metricId, kpi.current),
		metricId: kpi.metricId,
		current: kpi.current,
		previous: kpi.previous,
		neutral: kpi.key === 'calls',
		sparkline: kpi.sparkline,
		compare: kpi.previous !== null,
		hint:
			kpi.previous === null
				? t('operationManager.insights.noPrevious')
				: undefined,
	}));

	return (
		<SectionCard
			padding='md'
			title={t('operationManager.insights.glance.title')}
			description={t('operationManager.insights.glance.subtitle')}
		>
			<MetricTileRow tiles={tiles} columns={6} />
		</SectionCard>
	);
}

export default HeadlineTiles;
