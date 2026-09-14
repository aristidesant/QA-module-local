import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Stack, Group, Text } from '@mantine/core';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { useTeamAnalyticsStore } from '~/stores/qa/teamAnalyticsStore';
import BreadcrumbNav from './BreadcrumbNav';
import GroupBySelector from './GroupBySelector';
import SegmentationTable from './SegmentationTable';

interface SegmentationViewProps {
	viewType: 'qa' | 'sentiment' | 'compliance';
}

/** Headline metric shown in the comparison table for each metric view. */
const VIEW_HEADLINE_METRIC: Record<SegmentationViewProps['viewType'], string> =
	{
		qa: 'QA_OVERALL_SCORE',
		sentiment: 'CUSTOMER_SENTIMENT_SCORE',
		compliance: 'COMPLIANCE_OVERALL_SCORE',
	};

export default function SegmentationView({ viewType }: SegmentationViewProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const location = useLocation();
	const role = roleFromPath(location.pathname) as 'supervisor' | 'qa-manager';
	const { groupBy, drill } = useTeamAnalyticsStore();

	const metricLabel = t(`metrics.${VIEW_HEADLINE_METRIC[viewType]}`);
	const groupByLabel = t(`filters.groupByOptions.${groupBy}`);

	const sampleData = [
		{
			key: 'agent-1',
			label: 'Agent Smith',
			current: 85,
			previous: 83,
			trend: 'up' as const,
			trendValue: 2.4,
			callCount: 142,
		},
		{
			key: 'agent-2',
			label: 'Agent Johnson',
			current: 78,
			previous: 80,
			trend: 'down' as const,
			trendValue: -2.5,
			callCount: 128,
		},
		{
			key: 'agent-3',
			label: 'Agent Williams',
			current: 92,
			previous: 88,
			trend: 'up' as const,
			trendValue: 4.5,
			callCount: 156,
		},
		{
			key: 'agent-4',
			label: 'Agent Brown',
			current: 81,
			previous: 82,
			trend: 'neutral' as const,
			trendValue: -1.2,
			callCount: 98,
		},
		{
			key: 'agent-5',
			label: 'Agent Davis',
			current: 88,
			previous: 85,
			trend: 'up' as const,
			trendValue: 3.5,
			callCount: 134,
		},
	];

	return (
		<Stack gap='md'>
			{drill && <BreadcrumbNav />}

			<Group justify='space-between' align='flex-start'>
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
				<GroupBySelector role={role} />
			</Group>

			<SegmentationTable
				data={sampleData}
				dimension={groupBy}
				metricLabel={metricLabel}
			/>
		</Stack>
	);
}
