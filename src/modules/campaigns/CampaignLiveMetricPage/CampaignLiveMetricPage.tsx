import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Stack, SimpleGrid, Select, Flex, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer';
import { SectionCard } from '~/components/SectionCard';
import { MetricInfoCard } from './components/MetricInfoCard';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useGetCampaignLiveMetrics } from '~/queries/campaignsQueries';
import styles from './CampaignLiveMetricPage.module.css';

// TODO: Connect to real data and implement filtering/sorting
export const CampaignLiveMetricPage = () => {
	const { campaignId } = useParams<{ campaignId: string }>();
	const [timeRange, setTimeRange] = useState<'5m' | '15m' | '1h' | 'today'>(
		'today'
	);
	const navigate = useNavigate();

	// Fetch campaign data
	const {
		data: campaign,
		isLoading,
		isError,
		error,
	} = useGetCampaign(campaignId || '');

	// Fetch live metrics
	const { data: liveMetrics } = useGetCampaignLiveMetrics(
		campaignId || '',
		timeRange
	);

	// Loading state
	if (isLoading) {
		return (
			<ContentContainer
				title='Loading Campaign...'
				description='Please wait while we fetch the campaign details.'
			>
				<Flex justify='center' align='center' style={{ minHeight: '400px' }}>
					<Loader size='lg' />
				</Flex>
			</ContentContainer>
		);
	}

	// Error state
	if (isError || !campaign) {
		return (
			<ContentContainer
				title='Error Loading Campaign'
				description='Unable to load campaign details.'
			>
				<Alert
					icon={<IconAlertCircle size={16} />}
					title='Error'
					color='red'
					variant='light'
				>
					{error instanceof Error
						? error.message
						: 'Campaign not found or failed to load.'}
				</Alert>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer
			title={campaign.name || 'Campaign Metrics'}
			showBackButton
			onBackClick={() => {
				navigate('/campaigns');
			}}
			description={
				campaign.description ||
				'Quick snapshot of your AI operations, campaign performance, and real-time engagement metrics — all in one place.'
			}
		>
			<Stack gap='lg' className={styles.container}>
				{/* Campaign Live Metrics */}
				{liveMetrics && (
					<SectionCard
						title='Campaign Live Metrics'
						description='Real-time performance metrics and engagement data'
						headerActions={
							<Select
								placeholder='Select time range'
								value={timeRange}
								onChange={(value) =>
									setTimeRange(
										(value as '5m' | '15m' | '1h' | 'today') || 'today'
									)
								}
								data={[
									{ value: '5m', label: 'Last 5 minutes' },
									{ value: '15m', label: 'Last 15 minutes' },
									{ value: '1h', label: 'Last 1 hour' },
									{ value: 'today', label: 'Today' },
								]}
								className={styles.timeRangeSelect}
								style={{ minWidth: '150px' }}
							/>
						}
					>
						<SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing='md'>
							<MetricInfoCard
								label='Campaign'
								value={liveMetrics.campaign}
								tooltip='Campaign name'
							/>
							<MetricInfoCard
								label='Average Handle Time'
								value={liveMetrics.aht}
								tooltip='Average time spent handling calls'
							/>
							<MetricInfoCard
								label='Total Calls'
								value={liveMetrics.calls.total.toString()}
								tooltip='Total number of calls'
							/>
							<MetricInfoCard
								label='Contactable'
								value={liveMetrics.calls.contactable.toString()}
								tooltip='Number of contactable calls'
							/>
							<MetricInfoCard
								label='Non-Contactable'
								value={liveMetrics.calls.non_contactable.toString()}
								tooltip='Number of non-contactable calls'
							/>
							<MetricInfoCard
								label='Contactable %'
								value={liveMetrics.percentages.contactable}
								tooltip='Percentage of contactable calls'
							/>
							<MetricInfoCard
								label='Non-Contactable %'
								value={liveMetrics.percentages.non_contactable}
								tooltip='Percentage of non-contactable calls'
							/>
						</SimpleGrid>
					</SectionCard>
				)}
			</Stack>
		</ContentContainer>
	);
};

export default CampaignLiveMetricPage;
