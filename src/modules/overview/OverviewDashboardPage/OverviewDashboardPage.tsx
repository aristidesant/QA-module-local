import { Button, Stack, Text } from '@mantine/core';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import CampaignDashboardViewer from '~/modules/campaigns/CampaignDashboardViewer';
import { useDashboards } from '~/queries/analyticsDashboardsQueries';

const OverviewDashboardPage = () => {
	const { t } = useTranslation([
		'overview',
		'campaign.form.dashboards',
		'common',
	]);
	const navigate = useNavigate();
	const {
		data: dashboards = [],
		isLoading,
		error: dashboardsErrorObj,
	} = useDashboards({
		campaignId: null,
	});

	const isForbidden = (dashboardsErrorObj as any)?.response?.status === 403;

	if ((!isLoading && dashboards.length === 0) || isForbidden) {
		const emptyTitle = isForbidden
			? t('dashboard.unassignedTitle')
			: t('dashboardOverview.emptyTitle');
		const emptyDescription = isForbidden
			? null
			: t('dashboardOverview.emptyDescription');
		return (
			<ContentContainer>
				<SectionCard
					title={t('dashboardOverview.title')}
					description={t('dashboardOverview.description')}
					icon={IconLayoutDashboard}
				>
					<Stack gap='sm' align='flex-start'>
						<div>
							<Text size='sm' fw={600}>
								{emptyTitle}
							</Text>
							{emptyDescription && (
								<Text size='sm' c='dimmed'>
									{emptyDescription}
								</Text>
							)}
						</div>
						<Button size='sm' onClick={() => navigate('/dashboards')}>
							{t('dashboardOverview.emptyAction')}
						</Button>
					</Stack>
				</SectionCard>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			<CampaignDashboardViewer campaignId={null} allowLayoutEditing={false} />
		</ContentContainer>
	);
};

export default OverviewDashboardPage;
