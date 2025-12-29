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
import { useTranslation } from 'react-i18next';

export const AgentCampaignList: React.FC = () => {
	const { t } = useTranslation('campaigns');
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
			title: t('form.agent.list.addAgentTitle'),
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
					{t('form.agent.list.addAgent')}
				</Button>
			)}
			{totalAgents === 0 && !isLoading ? (
				<Card withBorder radius={'md'}>
					<EmptyState
						icon={<IconInfoCircle />}
						message={t('form.agent.list.noAgents')}
						description={t('form.agent.list.noAgentsDesc')}
					/>
				</Card>
			) : null}

			{campaignAgents?.map((campaignAgent) => {
				return (
					<React.Fragment key={campaignAgent.id}>
						{selectedCampaign?.id && (
							<AgentCampaignPreview
								agentId={campaignAgent.agentId}
								campaignAgentId={campaignAgent.id}
								campaignId={selectedCampaign.id}
							/>
						)}
					</React.Fragment>
				);
			})}
		</section>
	);
};

export default AgentCampaignList;
