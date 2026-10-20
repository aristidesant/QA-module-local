import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '~/stores/qa/settingsStore';
import { PRIMARY_METRIC, VIEW_METRICS } from '../../constants';
import { errorMixSeries, qaScoreBands } from '../../helpers';
import SegmentationView from '../Segmentation/SegmentationView';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import {
	AreaLayout,
	BreakdownBars,
	ChartCard,
	MetricTileRow,
	Pair,
	SERIES,
	StackedMix,
	TrendSection,
	useMetricTiles,
} from '../charts';

/** QA score and errors: the score over time, the mix of error types and how scores are spread. */
export default function QaView() {
	const { t } = useTranslation('qa.teamAnalytics');
	const { calls, filters } = useTeamAnalyticsData();
	const { tile } = useMetricTiles();
	const lowScore = useSettingsStore((s) => s.thresholds.qa.lowScoreIncident);

	const mix = useMemo(
		() => errorMixSeries(calls, filters.granularity),
		[calls, filters.granularity]
	);
	const bands = useMemo(() => qaScoreBands(calls), [calls]);
	const hasErrors = mix.some((p) => p.ecn + p.enc + p.ecc + p.ecuf > 0);

	return (
		<AreaLayout>
			<MetricTileRow
				tiles={[
					tile('QA_OVERALL_SCORE'),
					tile('QA_AUTO_FAIL_COUNT'),
					tile('QA_ECN_COUNT'),
					tile('QA_ENC_COUNT'),
					tile('QA_ECC_COUNT'),
					tile('QA_ECUF_COUNT'),
				]}
			/>
			<TrendSection
				metricIds={VIEW_METRICS.qa}
				primary={PRIMARY_METRIC.qa}
				targetOf={(id) => (id === 'QA_OVERALL_SCORE' ? lowScore : null)}
			/>
			<Pair>
				<ChartCard
					title={t('qaView.errorMixTitle')}
					description={t('qaView.errorMixDescription')}
					empty={!hasErrors}
				>
					<StackedMix
						data={mix.map((p) => ({ ...p }))}
						keys={[
							{ name: 'enc', label: t('qaView.errors.enc'), color: SERIES[0] },
							{ name: 'ecn', label: t('qaView.errors.ecn'), color: SERIES[1] },
							{ name: 'ecc', label: t('qaView.errors.ecc'), color: SERIES[2] },
							{
								name: 'ecuf',
								label: t('qaView.errors.ecuf'),
								color: SERIES[3],
							},
						]}
					/>
				</ChartCard>
				<ChartCard title={t('qaView.distributionTitle')}>
					<BreakdownBars
						unit='COUNT'
						valueLabel={t('charts.calls')}
						rows={bands.map((b) => ({
							key: b.key,
							label: t(`qaView.bands.${b.key}`),
							value: b.count,
						}))}
					/>
				</ChartCard>
			</Pair>
			<SegmentationView
				metricIds={VIEW_METRICS.qa}
				primary={PRIMARY_METRIC.qa}
			/>
		</AreaLayout>
	);
}
