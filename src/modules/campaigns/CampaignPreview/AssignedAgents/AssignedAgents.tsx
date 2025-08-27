import React from 'react';
import { Card, Text, Stack, Group, Avatar, Skeleton } from '@mantine/core';
import styles from './AssignedAgents.module.css';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import { CampaignAgent } from '~/models/CampaignAgentModel';

interface AssignedAgentsProps {
	agents?: CampaignAgent[];
}

const AssignedAgents: React.FC<AssignedAgentsProps> = () => {
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);
	const { data, isLoading } = useGetCampaignAgents(
		selectedCampaign?.id as number
	);

	const getCountryFlag = (countryCode: string) => {
		const flags: Record<string, string> = {
			ES: '🇪🇸',
			US: '🇺🇸',
			GB: '🇬🇧',
			FR: '🇫🇷',
			DE: '🇩🇪',
			IT: '🇮🇹',
		};
		return flags[countryCode] || '🌐';
	};

	return (
		<Stack gap='md' mt='sm'>
			<div>
				<Text fw={600} size='md' className={styles.title}>
					Assigned Agents
				</Text>
				<Text size='xs' c='dimmed' className={styles.subtitle}>
					These agents are currently linked to this campaign.
				</Text>
			</div>

			<Stack gap='xs' className={styles.agentsList}>
				{isLoading ? (
					// Loading skeleton
					Array.from({ length: 3 }).map((_, index) => (
						<Card
							key={`skeleton-${index}`}
							radius='md'
							padding='sm'
							withBorder
							className={styles.agentCard}
						>
							<Group gap='md' className={styles.agentItem}>
								<div className={styles.avatarContainer}>
									<Skeleton circle height={36} />
								</div>
								<div className={styles.agentInfo}>
									<Skeleton height={16} width='60%' mb={4} />
									<Skeleton height={12} width='40%' />
								</div>
							</Group>
						</Card>
					))
				) : data && data.length > 0 ? (
					data.map((agent: CampaignAgent) => (
						<Card
							key={agent.id}
							radius='md'
							padding='sm'
							withBorder
							className={styles.agentCard}
						>
							<Group gap='md' className={styles.agentItem}>
								<div className={styles.avatarContainer}>
									<Avatar
										// src={agent.avatarUrl}
										size={36}
										radius='xl'
										className={styles.avatar}
									/>
									<div
										className={`${styles.statusIndicator} ${
											agent.agent.status === 'ACTIVE'
										}`}
									/>
								</div>
								<div className={styles.agentInfo}>
									<Text fw={500} size='sm' className={styles.agentName}>
										{agent.agent.name}
									</Text>
									<Group gap='xs' align='center'>
										<span className={styles.flag}>
											{getCountryFlag(agent.agent.language.toUpperCase())}
										</span>
										<Text size='xs' c='dimmed'>
											{agent.agent.language}
										</Text>
									</Group>
								</div>
							</Group>
						</Card>
					))
				) : (
					<Card
						radius='md'
						padding='lg'
						withBorder
						className={styles.emptyState}
					>
						<Stack align='center' gap='sm'>
							<Text size='sm' ta='center'>
								No agents assigned yet
							</Text>
							<Text size='xs' c='dimmed' ta='center'>
								Assign agents to start running campaigns
							</Text>
						</Stack>
					</Card>
				)}
			</Stack>
		</Stack>
	);
};

export default AssignedAgents;
