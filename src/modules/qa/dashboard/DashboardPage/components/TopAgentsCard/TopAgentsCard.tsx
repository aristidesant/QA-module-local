import { BarChart } from '@mantine/charts';
import { Skeleton } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import { TOP_AGENTS_BAR_COLOR } from '../../DashboardPage.constants';
import type { AgentScoreBar } from '../../DashboardPage.types';
import classes from './TopAgentsCard.module.css';

const AXIS_LABEL_MAX_LENGTH = 16;

function truncateLabel(value: unknown) {
	const label = String(value);

	return label.length > AXIS_LABEL_MAX_LENGTH
		? `${label.slice(0, AXIS_LABEL_MAX_LENGTH - 1)}…`
		: label;
}

export interface TopAgentsCardProps {
	agents: AgentScoreBar[];
	loading: boolean;
	className?: string;
}

export default function TopAgentsCard({
	agents,
	loading,
	className,
}: TopAgentsCardProps) {
	const { t } = useTranslation('qa.dashboard');
	const chartReady = useChartReady();

	return (
		<SectionCard
			className={className}
			description={t('topAgents.description')}
			icon={IconUsers}
			title={t('topAgents.title')}
		>
			{loading || !chartReady ? (
				<Skeleton className={classes.chartArea} />
			) : agents.length === 0 ? (
				<div className={classes.chartArea}>
					<EmptyState
						description={t('topAgents.emptyDescription')}
						icon={<IconUsers size={32} />}
						message={t('topAgents.empty')}
					/>
				</div>
			) : (
				<BarChart
					barProps={{ radius: [0, 4, 4, 0] }}
					className={classes.chartArea}
					data={agents}
					dataKey='agentName'
					gridAxis='x'
					orientation='vertical'
					series={[
						{
							name: 'avgScorePct',
							label: t('topAgents.series'),
							color: TOP_AGENTS_BAR_COLOR,
						},
					]}
					valueFormatter={(value) => `${value}%`}
					xAxisProps={{ domain: [0, 100] }}
					yAxisProps={{ tickFormatter: truncateLabel, width: 120 }}
				/>
			)}
		</SectionCard>
	);
}
