import { useTranslation } from 'react-i18next';
import {
	Table,
	Badge,
	Group,
	ActionIcon,
	Tooltip,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconTrendingUp,
	IconTrendingDown,
	IconMinus,
	IconChevronRight,
} from '@tabler/icons-react';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
import { useTeamAnalyticsStore } from '~/stores/qa/teamAnalyticsStore';
import { DRILL_NEXT, OTHER_SEGMENT_KEY } from '../../constants';
import { comparison, formatMetric, isImprovement } from '../../helpers';
import type {
	GroupByDimension,
	SegmentMetricId,
	SegmentRow,
} from '../../types';
import styles from '../TeamAnalyticsPage.module.css';

interface SegmentationTableProps {
	rows: SegmentRow[];
	dimension: GroupByDimension;
	metricId: SegmentMetricId;
	metricLabel: string;
	/** Resolves raw segment keys (shift, tenure, …) to translated labels. */
	labelOf: (row: SegmentRow) => string;
}

export default function SegmentationTable({
	rows,
	dimension,
	metricId,
	metricLabel,
	labelOf,
}: SegmentationTableProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const { drillInto } = useTeamAnalyticsStore();

	const higherIsBetter = METRIC_BY_ID[metricId].higherIsBetter;
	const canDrill = dimension !== 'none' && Boolean(DRILL_NEXT[dimension]);

	const handleDrill = (row: SegmentRow) => {
		const nextDimension = DRILL_NEXT[dimension];
		if (!nextDimension || row.key === OTHER_SEGMENT_KEY) return;
		drillInto({ dimension, key: row.key, label: labelOf(row) }, nextDimension);
	};

	const segmentColumnLabel =
		dimension === 'none'
			? t('segments.columns.segment')
			: t(`filters.groupByOptions.${dimension}`);

	const body = rows.map((row) => {
		const current = row.metrics[metricId] ?? null;
		const previous = row.previous[metricId] ?? null;
		const cmp = comparison(current, previous);
		const improved = isImprovement(cmp, higherIsBetter);
		const trendColor = improved === null ? 'gray' : improved ? 'green' : 'red';
		const TrendIcon =
			cmp.trend === 'UP'
				? IconTrendingUp
				: cmp.trend === 'DOWN'
					? IconTrendingDown
					: IconMinus;
		const isOther = row.key === OTHER_SEGMENT_KEY;

		return (
			<Table.Tr key={row.key}>
				<Table.Td>
					<Group gap='xs'>
						<Text fw={500} size='sm'>
							{labelOf(row)}
						</Text>
						<Badge size='sm' variant='light'>
							{row.calls}
						</Badge>
					</Group>
				</Table.Td>
				<Table.Td align='right'>
					<Text fw={700} size='sm'>
						{formatMetric(metricId, current)}
					</Text>
				</Table.Td>
				<Table.Td align='right'>
					<Text c='dimmed' size='sm'>
						{formatMetric(metricId, previous)}
					</Text>
				</Table.Td>
				<Table.Td align='right' className={styles.trendColumn}>
					{cmp.trend === 'UNAVAILABLE' ? (
						<Text c='dimmed' size='sm'>
							{t('common.na')}
						</Text>
					) : (
						<Group gap={4} justify='flex-end' wrap='nowrap'>
							<Text fw={500} size='sm'>
								{cmp.absoluteChange !== null && cmp.absoluteChange > 0
									? '+'
									: ''}
								{formatMetric(metricId, cmp.absoluteChange)}
							</Text>
							<ThemeIcon size='sm' variant='light' color={trendColor}>
								<TrendIcon size={14} />
							</ThemeIcon>
						</Group>
					)}
				</Table.Td>
				<Table.Td align='right' className={styles.actionColumn}>
					{canDrill && !isOther && (
						<Tooltip
							label={t('segments.drillInto', { label: labelOf(row) })}
							withArrow
						>
							<ActionIcon
								size='sm'
								variant='light'
								aria-label={t('actions.drillDown')}
								onClick={() => handleDrill(row)}
							>
								<IconChevronRight size={16} />
							</ActionIcon>
						</Tooltip>
					)}
				</Table.Td>
			</Table.Tr>
		);
	});

	return (
		<div className={styles.tableSurface}>
			<Table striped highlightOnHover verticalSpacing='sm' miw={640}>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>{segmentColumnLabel}</Table.Th>
						<Table.Th align='right'>
							{metricLabel} · {t('overview.current')}
						</Table.Th>
						<Table.Th align='right'>
							{metricLabel} · {t('overview.previous')}
						</Table.Th>
						<Table.Th align='right'>{t('overview.delta')}</Table.Th>
						<Table.Th align='right' className={styles.actionColumn} />
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{body}</Table.Tbody>
			</Table>
		</div>
	);
}
