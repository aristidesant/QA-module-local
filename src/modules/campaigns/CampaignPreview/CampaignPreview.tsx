import React from 'react';
import { Stack, ScrollArea } from '@mantine/core';
import { IconHeartbeat } from '@tabler/icons-react';
import RightSectionCard from '~/components/RightSectionCard';
import CampaignOverview from './CampaignOverview';
import type { Campaign } from '../../../models/CampaignsModel';
import CampaignStatus from './CampaignStatus';
import CampaignContactOutcomeSummary from './CampaignContactOutcomeSummary';
import CampaignParameters from './CampaignParameters';
import AssignedAgents from './AssignedAgents';
import CampaignHealth from '../CampaignHealth';

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
				<CampaignOverview {...{ campaign }} />
				<RightSectionCard
					title='Campaign health'
					description='Readiness overview and key operational requirements'
					icon={IconHeartbeat}
					iconColor='var(--mantine-color-green-6)'
				>
					<CampaignHealth campaignId={String(campaign.id)} />
				</RightSectionCard>

				<CampaignContactOutcomeSummary {...{ campaign }} />

				<CampaignParameters />

				<AssignedAgents />
			</Stack>
		</ScrollArea>
	);
};

export default CampaignPreview;
