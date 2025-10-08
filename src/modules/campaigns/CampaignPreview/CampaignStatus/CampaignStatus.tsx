import React, { useEffect, useMemo } from 'react';
import { Stack } from '@mantine/core';
import { getCampaignStatusIcon } from '../../CampaignsList/CampaignsListItem/CampaignsListItem';
import type { Campaign } from '../../../../models/CampaignsModel';
import { useGetCampaign } from '~/queries/campaignsQueries';
import TimeLeftCard from './TimeLeftCard';
import RightSectionCard from '~/components/RightSectionCard';

interface CampaignStatusProps {
	campaign: Campaign;
}

const getStatusDescription = (status: string): string => {
	const campaignStatus = status?.toLowerCase();

	switch (campaignStatus) {
		case 'active':
			return 'The campaign is ready to start.';
		case 'running':
			return 'The campaign is currently active and executing calls.';
		case 'paused':
			return 'The campaign has been temporarily paused and is not making calls.';
		case 'completed':
			return 'The campaign has successfully completed all scheduled calls.';
		case 'inactive':
			return 'The campaign is currently inactive and not running.';
		case 'incomplete':
		case 'error':
			return 'The campaign encountered an error and needs attention.';
		case 'ready':
		case 'scheduled':
			return 'The campaign is ready to start and waiting for scheduled time.';
		default:
			return 'Campaign status information is not available.';
	}
};

const CampaignStatus: React.FC<CampaignStatusProps> = ({ campaign }) => {
	const { data: campaignData, refetch } = useGetCampaign(`${campaign?.id}`);

	useEffect(() => {
		refetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [campaign, campaign.status]);
	const statusInfo = useMemo(
		() => getCampaignStatusIcon(campaignData?.status ?? ''),
		[campaignData?.status]
	);
	const description = useMemo(
		() => getStatusDescription(campaignData?.status ?? ''),
		[campaignData?.status]
	);

	return (
		<Stack gap='xs'>
			<RightSectionCard
				title={statusInfo.label}
				description={description}
				icon={statusInfo.iconComponent}
				iconColor={statusInfo.color}
			>
				<></>
			</RightSectionCard>
			<TimeLeftCard />
		</Stack>
	);
};

export default CampaignStatus;
