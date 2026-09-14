import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Select, Stack, Text } from '@mantine/core';
import {
	useTeamAnalyticsStore,
	selectDrill,
} from '~/stores/qa/teamAnalyticsStore';
import {
	MAX_SEGMENT_SERIES,
	OTHER_SEGMENT_KEY,
	PRIMARY_METRIC,
	VIEW_METRICS,
} from '../../constants';
import { buildSegments } from '../../helpers';
import type { MetricView, SegmentMetricId, SegmentRow } from '../../types';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import BreadcrumbNav from './BreadcrumbNav';
import GroupBySelector from './GroupBySelector';
import SegmentationTable from './SegmentationTable';

interface SegmentationViewProps {
	viewType: Extract<MetricView, 'qa' | 'sentiment' | 'compliance'>;
}

/** Dimensions whose segment key is a raw enum value needing a translated label. */
const KEY_LABEL_NAMESPACE: Partial<Record<string, string>> = {
	campaignType: 'filters.campaignTypeLabels',
	callDirection: 'filters.directionLabels',
	shift: 'filters.shiftLabels',
	tenure: 'filters.tenureLabels',
};

export default function SegmentationView({ viewType }: SegmentationViewProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const { role, filters, groupBy, calls, previousCalls } =
		useTeamAnalyticsData();
	const drill = useTeamAnalyticsStore(selectDrill);

	const metricIds = VIEW_METRICS[viewType];
	const [metricId, setMetricId] = useState<SegmentMetricId>(
		PRIMARY_METRIC[viewType]
	);
	// Each view offers its own metric list, so the choice resets when the tab changes.
	useEffect(() => setMetricId(PRIMARY_METRIC[viewType]), [viewType]);

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

	const labelOf = (row: SegmentRow) => {
		if (row.key === OTHER_SEGMENT_KEY) {
			return t('segments.other', { count: row.calls });
		}
		const ns = KEY_LABEL_NAMESPACE[groupBy];
		return ns ? t(`${ns}.${row.key}`, { defaultValue: row.label }) : row.label;
	};

	const groupByLabel = t(`filters.groupByOptions.${groupBy}`);
	const metricLabel = t(`metrics.${metricId}`);
	const truncated = rows.some((r) => r.key === OTHER_SEGMENT_KEY);

	return (
		<Stack gap='md'>
			{drill && <BreadcrumbNav />}

			<Group justify='space-between' align='flex-end' wrap='wrap'>
				<div>
					<Text fw={600} size='sm'>
						{groupBy === 'none'
							? t('segments.tableTitle')
							: t('segments.title', { dimension: groupByLabel.toLowerCase() })}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('segments.description')}
					</Text>
				</div>
				<Group gap='sm'>
					<Select
						size='sm'
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
					<GroupBySelector role={role} />
				</Group>
			</Group>

			{rows.length === 0 ? (
				<Text size='sm' c='dimmed' py='xl' ta='center'>
					{t('segments.empty')}
				</Text>
			) : (
				<>
					<SegmentationTable
						rows={rows}
						dimension={groupBy}
						metricId={metricId}
						metricLabel={metricLabel}
						labelOf={labelOf}
					/>
					{truncated && (
						<Text size='xs' c='dimmed'>
							{t('segments.hiddenSeries', { count: MAX_SEGMENT_SERIES - 1 })}
						</Text>
					)}
				</>
			)}
		</Stack>
	);
}
