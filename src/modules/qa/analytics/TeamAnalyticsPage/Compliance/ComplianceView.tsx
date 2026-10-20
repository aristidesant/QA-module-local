import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '~/stores/qa/settingsStore';
import { PRIMARY_METRIC, VIEW_METRICS } from '../../constants';
import { bucketSeries, complianceItemShares } from '../../helpers';
import type { AnalyticsMetricId } from '../../types';
import SegmentationView from '../Segmentation/SegmentationView';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import {
	AreaLayout,
	BreakdownBars,
	ChartCard,
	MetricTileRow,
	Pair,
	SmallMultiples,
	TrendSection,
	useMetricTiles,
} from '../charts';

const AREA_METRICS: AnalyticsMetricId[] = [
	'COMPLIANCE_SECURITY_SCORE',
	'COMPLIANCE_REGULATORY_SCORE',
	'COMPLIANCE_LEGAL_SCORE',
];

/** Compliance score over time, each area on its own chart and the items that miss the target most. */
export default function ComplianceView() {
	const { t } = useTranslation('qa.teamAnalytics');
	const { calls, filters } = useTeamAnalyticsData();
	const { tile } = useMetricTiles();
	const target = useSettingsStore(
		(s) => s.thresholds.compliance.areaTargetPerCall
	);

	const areas = useMemo(
		() =>
			AREA_METRICS.map((id) => ({
				key: id,
				label: t(`metrics.${id}`),
				data: bucketSeries(calls, id, filters.granularity),
			})),
		[calls, filters.granularity, t]
	);
	const items = useMemo(
		() => complianceItemShares(calls, target),
		[calls, target]
	);

	return (
		<AreaLayout>
			<MetricTileRow
				tiles={[
					tile('COMPLIANCE_OVERALL_SCORE'),
					tile('COMPLIANCE_SECURITY_SCORE'),
					tile('COMPLIANCE_REGULATORY_SCORE'),
					tile('COMPLIANCE_LEGAL_SCORE'),
					tile('COMPLIANCE_VIOLATION_COUNT'),
				]}
			/>
			<TrendSection
				metricIds={VIEW_METRICS.compliance}
				primary={PRIMARY_METRIC.compliance}
				targetOf={(id) => (id === 'COMPLIANCE_VIOLATION_COUNT' ? null : target)}
			/>
			<Pair>
				<ChartCard title={t('complianceView.byAreaTitle')}>
					<SmallMultiples items={areas} metricId='COMPLIANCE_OVERALL_SCORE' />
				</ChartCard>
				<ChartCard
					title={t('complianceView.itemsTitle')}
					description={t('complianceView.itemsDescription')}
				>
					<BreakdownBars
						unit='PERCENT'
						valueLabel={t('charts.share')}
						rows={items.map((i) => ({
							key: i.item,
							label: t(`complianceView.items.${i.item}`),
							value: i.share,
						}))}
					/>
				</ChartCard>
			</Pair>
			<SegmentationView
				metricIds={VIEW_METRICS.compliance}
				primary={PRIMARY_METRIC.compliance}
			/>
		</AreaLayout>
	);
}
