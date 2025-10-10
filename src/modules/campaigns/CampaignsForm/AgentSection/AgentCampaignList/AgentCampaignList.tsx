import React from 'react';
import { Card, Button, LoadingOverlay } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconInfoCircle } from '@tabler/icons-react';
import AgentCampaignAdd from '../AgentCampaignAdd';
import classes from './AgentCampaignList.module.css';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import AgentCampaignPreview from '../AgentCampaignPreview';
import EmptyState from '~/components/EmptyState';

export const AgentCampaignList: React.FC = () => {
	const { selectedCampaign } = useCampaignsStore((state) => state);
	const {
		data: campaignAgents,
		refetch,
		isLoading,
	} = useGetCampaignAgents(selectedCampaign?.id || 0);

	// Get assigned agent IDs for exclusion when opening the selector
	const assignedAgentIds = Array.isArray(campaignAgents)
		? campaignAgents.map((agent) => agent.agent?.id).filter(Boolean)
		: [];

	const totalAgents = campaignAgents?.length ?? 0;

	const handleAddAgent = () => {
		if (selectedCampaign?.id == null) {
			console.error('No campaign selected');
			return;
		}

		modals.open({
			modalId: 'add-campaign-agent',
			title: 'Add Agent to Campaign',
			centered: true,
			size: 'xl',
			children: (
				<AgentCampaignAdd
					campaignId={selectedCampaign.id}
					excludedAgents={assignedAgentIds}
					onComplete={() => {
						refetch();
						modals.close('add-campaign-agent');
					}}
				/>
			),
		});
	};

	return (
		<section className={classes.wrapper}>
			<LoadingOverlay
				visible={isLoading}
				zIndex={100}
				overlayProps={{ radius: 'md', blur: 2 }}
			/>
			{campaignAgents?.length === 0 && (
				<Button
					className={classes.addAgentBtn}
					leftSection={<IconPlus size={18} />}
					variant='light'
					color='blue'
					fullWidth
					radius='md'
					onClick={handleAddAgent}
				>
					Add Agent
				</Button>
			)}
			{totalAgents === 0 && !isLoading ? (
				<Card withBorder radius={'md'}>
					<EmptyState
						icon={<IconInfoCircle />}
						message='No Agents Assigned'
						description={
							'There are no agents currently assigned to this campaign.'
						}
					/>
				</Card>
			) : null}

			{campaignAgents?.map((campaignAgent) => {
				return (
					<>
						{selectedCampaign?.id && (
							<AgentCampaignPreview
								agentId={campaignAgent.agentId}
								campaignAgentId={campaignAgent.id}
								campaignId={selectedCampaign.id}
							/>
						)}
					</>
				);
			})}
		</section>
	);
};

export default AgentCampaignList;
