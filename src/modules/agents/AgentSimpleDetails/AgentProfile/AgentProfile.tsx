import { Avatar, Text } from '@mantine/core';
import React from 'react';
import {
	getAgentAvatarUrl,
	getAgentLanguage,
	getLanguageFlagEmoji,
} from '~/utils/agentUtils';
import type AgentListObject from '~/models/AgentListObject';
import styles from './AgentProfile.module.css';

export type AgentProfileProps = {
	agent?: AgentListObject;
	traits?: string[];
	size?: 'sm' | 'md' | 'lg';
	onClick?: () => void;
};

const avatarSizes: Record<NonNullable<AgentProfileProps['size']>, number> = {
	sm: 72,
	md: 92,
	lg: 112,
};

const AgentProfile: React.FC<AgentProfileProps> = ({
	agent,
	traits = [],
	size = 'md',
	onClick,
}) => {
	const avatarSize = avatarSizes[size];
	const isOnline = agent?.status === 'ACTIVE';
	const avatarUrl = getAgentAvatarUrl(agent as unknown as AgentListObject);
	const language = getAgentLanguage(agent as unknown as AgentListObject);
	const flagEmoji = getLanguageFlagEmoji(language);

	return (
		<div className={styles.container} onClick={onClick}>
			<div className={styles.avatarStack}>
				<Avatar
					src={avatarUrl}
					size={avatarSize}
					radius={avatarSize}
					alt={agent?.name || 'Agent avatar'}
					className={styles.avatar}
				/>
				<span
					className={`${styles.statusDot} ${
						isOnline ? styles.statusOnline : styles.statusOffline
					}`}
					aria-label={isOnline ? 'Online' : 'Offline'}
				/>
			</div>

			<Text className={styles.name}>{agent?.name || 'Unnamed agent'}</Text>

			<div className={styles.languageChip}>
				<span className={styles.flagIcon} role='img' aria-label={language}>
					{flagEmoji}
				</span>
				<Text className={styles.languageText}>{language}</Text>
			</div>

			{traits.length > 0 && (
				<ul className={styles.traitsList}>
					{traits.map((trait) => (
						<li key={trait} className={styles.trait}>
							{trait}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default AgentProfile;
