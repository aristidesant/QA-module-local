import { useMemo } from 'react';
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
	IconChevronRight,
} from '@tabler/icons-react';
import { useTeamAnalyticsStore } from '~/stores/qa/teamAnalyticsStore';
import { DRILL_NEXT } from '../../constants';
import type { GroupByDimension } from '../../types';
import styles from '../TeamAnalyticsPage.module.css';

interface SegmentRow {
	key: string;
	label: string;
	current: number;
	previous: number;
	trend: 'up' | 'down' | 'neutral';
	trendValue: number;
	callCount: number;
}

interface SegmentationTableProps {
	data: SegmentRow[];
	dimension: GroupByDimension;
	metricLabel: string;
	onDrill?: (key: string, label: string) => void;
}

export default function SegmentationTable({
	data,
	dimension,
	metricLabel,
	onDrill,
}: SegmentationTableProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const { drillInto } = useTeamAnalyticsStore();

	const sortedData = useMemo(
		() => [...data].sort((a, b) => b.callCount - a.callCount),
		[data]
	);

	const handleDrill = (key: string, label: string) => {
		const nextDimension = DRILL_NEXT[dimension] || 'agent';
		drillInto({ dimension, key, label }, nextDimension);
		onDrill?.(key, label);
	};

	const segmentColumnLabel =
		dimension === 'none'
			? t('segments.columns.segment')
			: t(`filters.groupByOptions.${dimension}`);

	const rows = sortedData.map((row) => (
		<Table.Tr key={row.key}>
			<Table.Td>
				<Group gap='xs'>
					<Text fw={500} size='sm'>
						{row.label}
					</Text>
					<Badge size='sm' variant='light'>
						{row.callCount}
					</Badge>
				</Group>
			</Table.Td>
			<Table.Td align='right'>
				<Text fw={700}>{row.current.toFixed(1)}</Text>
			</Table.Td>
			<Table.Td align='right'>
				<Text c='dimmed'>{row.previous.toFixed(1)}</Text>
			</Table.Td>
			<Table.Td align='right'>
				<Group gap={4} justify='flex-end'>
					<Text fw={500}>{row.trendValue.toFixed(1)}%</Text>
					<ThemeIcon
						size='sm'
						variant='light'
						color={
							row.trend === 'up'
								? 'green'
								: row.trend === 'down'
									? 'red'
									: 'gray'
						}
					>
						{row.trend === 'up' ? (
							<IconTrendingUp size={14} />
						) : row.trend === 'down' ? (
							<IconTrendingDown size={14} />
						) : null}
					</ThemeIcon>
				</Group>
			</Table.Td>
			<Table.Td align='right'>
				<Tooltip
					label={t('segments.drillInto', { label: row.label })}
					withArrow
				>
					<ActionIcon
						size='sm'
						variant='light'
						aria-label={t('actions.drillDown')}
						onClick={() => handleDrill(row.key, row.label)}
					>
						<IconChevronRight size={16} />
					</ActionIcon>
				</Tooltip>
			</Table.Td>
		</Table.Tr>
	));

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
						<Table.Th align='right'>{t('segments.columns.trend')}</Table.Th>
						<Table.Th align='right' className={styles.actionColumn} />
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{rows}</Table.Tbody>
			</Table>
		</div>
	);
}
