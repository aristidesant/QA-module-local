import React from 'react';
import { Card, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconInfoCircle } from '@tabler/icons-react';
import AgentCampaignAdd from '../AgentCampaignAdd';
import classes from './AgentCampaignList.module.css';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import { useCampaignId } from '../../../campaignFormFunctions';
import AgentCampaignPreview from '../AgentCampaignPreview';
import EmptyState from '~/components/EmptyState';
import { useTranslation } from 'react-i18next';
import AgentListSkeleton from './AgentListSkeleton';

export const AgentCampaignList: React.FC = () => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const campaignId = useCampaignId();
	const {
		data: campaignAgents,
		refetch,
		isLoading,
	} = useGetCampaignAgents(campaignId || 0);

	// Get assigned agent IDs for exclusion when opening the selector
	const assignedAgentIds = Array.isArray(campaignAgents)
		? campaignAgents.map((agent) => agent.agent?.id).filter(Boolean)
		: [];

	const totalAgents = campaignAgents?.length ?? 0;

	const handleAddAgent = () => {
		if (campaignId == null) {
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
					campaignId={campaignId}
					excludedAgents={assignedAgentIds}
					onComplete={() => {
						refetch();
						modals.close('add-campaign-agent');
					}}
				/>
			),
		});
	};

	// Show loading while campaign ID is not available yet
	const isInitializing = !campaignId;
	const showSkeleton = isLoading || isInitializing;

	if (showSkeleton) {
		return (
			<section className={classes.wrapper}>
				<AgentListSkeleton />
			</section>
		);
	}

	return (
		<section className={classes.wrapper}>
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
			{totalAgents === 0 ? (
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
						{campaignId && (
							<AgentCampaignPreview
								agentId={campaignAgent.agentId}
								campaignAgentId={campaignAgent.id}
								campaignId={campaignId}
							/>
						)}
					</React.Fragment>
				);
			})}
		</section>
	);
};

export default AgentCampaignList;
