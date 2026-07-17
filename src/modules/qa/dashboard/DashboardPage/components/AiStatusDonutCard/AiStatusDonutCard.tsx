import { DonutChart } from '@mantine/charts';
import { Group, Skeleton, Stack, Text } from '@mantine/core';
import { IconChartDonut } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import { AI_STATUS_CHART_COLORS } from '../../DashboardPage.constants';
import type { AiStatusSegment } from '../../DashboardPage.types';
import classes from './AiStatusDonutCard.module.css';

export interface AiStatusDonutCardProps {
	segments: AiStatusSegment[];
	loading: boolean;
	className?: string;
}

export default function AiStatusDonutCard({
	segments,
	loading,
	className,
}: AiStatusDonutCardProps) {
	const { t } = useTranslation('qa.dashboard');
	const chartReady = useChartReady();
	const total = segments.reduce((sum, segment) => sum + segment.count, 0);
	const data = segments.map((segment) => ({
		name: t(`aiStatus.statuses.${segment.status.toLowerCase()}`),
		value: segment.count,
		color: AI_STATUS_CHART_COLORS[segment.status],
	}));

	return (
		<SectionCard
			className={className}
			description={t('aiStatus.description')}
			icon={IconChartDonut}
			title={t('aiStatus.title')}
		>
			{loading || !chartReady ? (
				<Skeleton className={classes.chartArea} />
			) : total === 0 ? (
				<div className={classes.chartArea}>
					<EmptyState
						description={t('aiStatus.emptyDescription')}
						icon={<IconChartDonut size={32} />}
						message={t('aiStatus.empty')}
					/>
				</div>
			) : (
				<Stack className={classes.chartArea} gap='xs' justify='center'>
					<Group justify='center'>
						<DonutChart
							chartLabel={t('aiStatus.centerLabel', { count: total })}
							data={data}
							size={150}
							thickness={22}
							withTooltip
						/>
					</Group>
					<Stack gap={4}>
						{segments.map((segment) => (
							<Group
								gap='xs'
								justify='space-between'
								key={segment.status}
								wrap='nowrap'
							>
								<Group gap={6} wrap='nowrap'>
									<span
										className={classes.legendDot}
										data-status={segment.status}
									/>
									<Text size='sm'>
										{t(`aiStatus.statuses.${segment.status.toLowerCase()}`)}
									</Text>
								</Group>
								<Text fw={600} size='sm'>
									{segment.count}
								</Text>
							</Group>
						))}
					</Stack>
				</Stack>
			)}
		</SectionCard>
	);
}
