import React from 'react';
import { Stack, ScrollArea } from '@mantine/core';
import CampaignOverview from './CampaignOverview';
import type { Campaign } from '../../../models/CampaignsModel';
import CampaignContactOutcomeSummary from './CampaignContactOutcomeSummary';
import CampaignParameters from './CampaignParameters';
import AssignedAgents from './AssignedAgents';
import CleanQueueButton from './CleanQueueButton';

interface CampaignPreviewProps {
	campaign: Campaign & {
		stats?: {
			callsMade: number;
			callsAnswered: number;
			conversionRate: number;
			avgCallDuration: string;
			lastUpdated: string;
		};
		agentPerformance?: Array<{
			id: number;
			name: string;
			callsHandled: number;
			successRate: number;
			avgRating: number;
		}>;
	};
}

const CampaignPreview: React.FC<CampaignPreviewProps> = ({ campaign }) => {
	return (
		<ScrollArea h='100%' type='scroll' offsetScrollbars>
			<Stack gap='xs' p='xs'>
				{campaign?.type === 'INBOUND' && <CampaignOverview {...{ campaign }} />}

				<CampaignContactOutcomeSummary {...{ campaign }} />

				<CampaignParameters />

				<AssignedAgents />

				<CleanQueueButton campaignId={campaign.id} fullWidth />
			</Stack>
		</ScrollArea>
	);
};

export default CampaignPreview;
