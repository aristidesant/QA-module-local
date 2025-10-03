import { Badge, Loader, Text } from '@mantine/core';
import { IconTargetArrow } from '@tabler/icons-react';
import { useGetAgentCampaigns } from '~/queries/agentQueries';
import { RightSectionCard } from '~/components/RightSectionCard/RightSectionCard';
import styles from './AgentCampaignDisplay.module.css';

type AgentCampaignDisplayProps = {
	agentId: string;
};

const getCampaignStatusColor = (status: string) => {
	switch (status) {
		case 'ACTIVE':
			return 'teal';
		case 'PAUSED':
		case 'RUNNING':
			return 'yellow';
		case 'COMPLETED':
			return 'blue';
		case 'INACTIVE':
		default:
			return 'gray';
	}
};

export const AgentCampaignDisplay: React.FC<AgentCampaignDisplayProps> = ({
	agentId,
}) => {
	const { data: campaigns = [], isLoading } = useGetAgentCampaigns(agentId);
	const primaryCampaign = campaigns[0];

	return (
		<RightSectionCard
			title='Primary Campaign'
			description='Shows the first active campaign linked to this agent'
			icon={IconTargetArrow}
			iconColor='var(--mantine-color-green-6)'
			rightSection={
				<Badge
					variant='light'
					size='sm'
					color={
						primaryCampaign
							? getCampaignStatusColor(primaryCampaign.status)
							: 'gray'
					}
				>
					{primaryCampaign?.status
						? primaryCampaign.status.toLowerCase()
						: 'not assigned'}
				</Badge>
			}
		>
			{isLoading ? (
				<div className={styles.loadingState}>
					<Loader size='sm' />
					<Text size='xs' c='dimmed'>
						Loading campaign…
					</Text>
				</div>
			) : primaryCampaign ? (
				<div className={styles.campaignBody}>
					<Text className={styles.campaignName}>{primaryCampaign.name}</Text>
					{primaryCampaign.description && (
						<Text size='xs' c='dimmed' className={styles.description}>
							{primaryCampaign.description}
						</Text>
					)}
					<div className={styles.metaRow}>
						<Text size='xs' c='dimmed'>
							Type: {primaryCampaign.type}
						</Text>
						<Text size='xs' c='dimmed'>
							Updated {new Date(primaryCampaign.updatedAt).toLocaleDateString()}
						</Text>
					</div>
				</div>
			) : (
				<Text className={styles.emptyState}>
					No campaigns assigned yet. Attach this agent to a campaign to start
					calling.
				</Text>
			)}
		</RightSectionCard>
	);
};

export default AgentCampaignDisplay;
