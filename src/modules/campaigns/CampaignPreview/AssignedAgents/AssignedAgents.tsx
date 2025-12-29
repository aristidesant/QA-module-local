import React from 'react';
import { Stack, Skeleton } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import styles from './AssignedAgents.module.css';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import { CampaignAgent } from '~/models/CampaignAgentModel';
import RightSectionCard from '~/components/RightSectionCard';
import AssignedAgentCard from './AssignedAgentCard';

interface AssignedAgentsProps {
	agents?: CampaignAgent[];
}

const AssignedAgents: React.FC<AssignedAgentsProps> = () => {
	const { t } = useTranslation('campaign.detail');
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);
	const { data, isLoading } = useGetCampaignAgents(
		selectedCampaign?.id as number
	);

	return (
		<RightSectionCard
			title={t('preview.assignedAgents.title')}
			description={t('preview.assignedAgents.description')}
			icon={IconUsers}
		>
			<Stack gap='xs' className={styles.agentsList}>
				{isLoading ? (
					// Loading skeleton
					Array.from({ length: 3 }).map((_, index) => (
						<RightSectionCard
							key={`skeleton-${index}`}
							title={t('preview.assignedAgents.loadingAgent')}
							description={<Skeleton height={12} width='40%' />}
							rightSection={<Skeleton circle height={24} />}
							style={{
								padding: 'var(--mantine-spacing-xs)',
								backgroundColor: 'var(--mantine-color-gray-1)',
							}}
						>
							<></>
						</RightSectionCard>
					))
				) : data && data.length > 0 ? (
					data.map((agent: CampaignAgent) => (
						<AssignedAgentCard key={agent.id} agent={agent} />
					))
				) : (
					<RightSectionCard
						title={t('preview.assignedAgents.noAgents')}
						description={t('preview.assignedAgents.noAgentsDescription')}
						style={{
							padding: 'var(--mantine-spacing-xs)',
							backgroundColor: 'var(--mantine-color-red-0)',
						}}
					>
						<></>
					</RightSectionCard>
				)}
			</Stack>
		</RightSectionCard>
	);
};

export default AssignedAgents;
