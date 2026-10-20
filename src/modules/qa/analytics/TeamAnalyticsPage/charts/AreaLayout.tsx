import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Text } from '@mantine/core';
import {
	selectDrill,
	useTeamAnalyticsStore,
} from '~/stores/qa/teamAnalyticsStore';
import BreadcrumbNav from '../Segmentation/BreadcrumbNav';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';

interface AreaLayoutProps {
	children: ReactNode;
	/** Views that do not depend on the filtered calls (burnout) skip the empty check. */
	requireCalls?: boolean;
}

/** The frame every tab shares: drill-down breadcrumb on top, one empty message when no call matches. */
export default function AreaLayout({
	children,
	requireCalls = true,
}: AreaLayoutProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const { calls } = useTeamAnalyticsData();
	const drill = useTeamAnalyticsStore(selectDrill);

	return (
		<Stack gap='md'>
			{drill && <BreadcrumbNav />}
			{requireCalls && calls.length === 0 ? (
				<Text size='sm' c='dimmed' py='xl' ta='center'>
					{t('charts.empty')}
				</Text>
			) : (
				children
			)}
		</Stack>
	);
}
