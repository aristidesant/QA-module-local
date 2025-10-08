import React from 'react';
import { Text, Group, Avatar, Badge } from '@mantine/core';
import { CampaignAgent } from '~/models/CampaignAgentModel';
import styles from './AssignedAgentCard.module.css';

interface AssignedAgentCardProps {
	agent: CampaignAgent;
}

const AssignedAgentCard: React.FC<AssignedAgentCardProps> = ({ agent }) => {
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

	const isActive = agent.agent.status === 'ACTIVE';

	return (
		<div className={styles.card}>
			<div className={styles.content}>
				<div className={styles.avatarContainer}>
					<Avatar size={40} radius='xl' className={styles.avatar} />
					<div
						className={`${styles.statusIndicator} ${
							isActive ? styles.statusActive : styles.statusInactive
						}`}
					/>
				</div>

				<div className={styles.info}>
					<div className={styles.header}>
						<Text className={styles.name}>{agent.agent.name}</Text>
						<Badge
							size='xs'
							variant='light'
							color={isActive ? 'green' : 'gray'}
							className={styles.badge}
						>
							{isActive ? 'Active' : 'Inactive'}
						</Badge>
					</div>

					<Group gap={6} className={styles.language}>
						<span className={styles.flag}>
							{getCountryFlag(agent.agent.language.toUpperCase())}
						</span>
						<Text size='xs' c='dimmed' className={styles.languageText}>
							{agent.agent.language.toUpperCase()}
						</Text>
					</Group>
				</div>
			</div>
		</div>
	);
};

export default AssignedAgentCard;
