import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Select } from '@mantine/core';
import { MAX_SEGMENT_SERIES } from '../../constants';
import { buildSegments } from '../../helpers';
import type { GroupByDimension, SegmentMetricId } from '../../types';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import { ChartCard } from '../charts';
import GroupBySelector from './GroupBySelector';
import SegmentationTable from './SegmentationTable';
import { useSegmentLabel } from './segmentLabels';

interface SegmentationViewProps {
	metricIds: SegmentMetricId[];
	primary: SegmentMetricId;
	/** Offer the group-by here too (tabs without a trend section). */
	showGroupBy?: boolean;
	/** Fix the dimension instead of following the page's group-by (no drill-down then). */
	fixedGroupBy?: GroupByDimension;
}

/** The comparison table every area tab ends with: one row per segment, current vs previous period. */
export default function SegmentationView({
	metricIds,
	primary,
	showGroupBy = false,
	fixedGroupBy,
}: SegmentationViewProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const {
		role,
		filters,
		groupBy: pageGroupBy,
		calls,
		previousCalls,
	} = useTeamAnalyticsData();
	const groupBy = fixedGroupBy ?? pageGroupBy;

	const [metricId, setMetricId] = useState<SegmentMetricId>(primary);
	// Each tab offers its own metric list, so the choice resets when the tab changes.
	useEffect(() => setMetricId(primary), [primary]);

	const rows = useMemo(
		() =>
			buildSegments(
				calls,
				previousCalls,
				groupBy,
				metricIds,
				filters.from,
				filters.to,
				filters.minCalls
			),
		[
			calls,
			previousCalls,
			groupBy,
			metricIds,
			filters.from,
			filters.to,
			filters.minCalls,
		]
	);
	const labelOf = useSegmentLabel(groupBy);
	const groupByLabel = t(`filters.groupByOptions.${groupBy}`);
	const truncated = rows.some((r) => r.key === '__other');

	return (
		<ChartCard
			title={
				groupBy === 'none'
					? t('segments.tableTitle')
					: t('segments.title', { dimension: groupByLabel.toLowerCase() })
			}
			description={t('segments.description')}
			empty={rows.length === 0}
			controls={
				<Group gap='sm'>
					<Select
						size='xs'
						aria-label={t('segments.metric')}
						data={metricIds.map((id) => ({
							value: id,
							label: t(`metrics.${id}`),
						}))}
						value={metricId}
						onChange={(value) => value && setMetricId(value as SegmentMetricId)}
						allowDeselect={false}
						comboboxProps={{ withinPortal: true }}
					/>
					{showGroupBy && !fixedGroupBy && <GroupBySelector role={role} />}
				</Group>
			}
			footer={
				truncated
					? t('segments.hiddenSeries', { count: MAX_SEGMENT_SERIES - 1 })
					: undefined
			}
		>
			<SegmentationTable
				rows={rows}
				dimension={groupBy}
				metricId={metricId}
				metricLabel={t(`metrics.${metricId}`)}
				labelOf={labelOf}
				drillable={!fixedGroupBy}
			/>
		</ChartCard>
	);
}
