import { Avatar, Text } from '@mantine/core';
import React from 'react';
import { getAgentLanguage, getLanguageFlagEmoji } from '~/utils/agentUtils';
import type AgentListObject from '~/models/AgentListObject';
import styles from './AgentProfile.module.css';
import { useTranslation } from 'react-i18next';

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

const getInitials = (name: string): string => {
	return name
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase())
		.join('')
		.slice(0, 2);
};

const getAvatarColor = (gender?: string): string => {
	if (gender?.toUpperCase() === 'FEMALE') {
		return 'var(--mantine-color-pink-6)';
	}
	return 'var(--mantine-color-blue-6)';
};

const AgentProfile: React.FC<AgentProfileProps> = ({
	agent,
	size = 'md',
	onClick,
}) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const avatarSize = avatarSizes[size];
	const isOnline = agent?.status === 'ACTIVE';
	const language = getAgentLanguage(agent as unknown as AgentListObject);
	const flagEmoji = getLanguageFlagEmoji(language);
	const initials = getInitials(agent?.name || 'A');
	const voiceGender = agent?.voice?.gender;
	const avatarColor = getAvatarColor(voiceGender);

	return (
		<div className={styles.container} onClick={onClick}>
			<div className={styles.avatarStack}>
				<Avatar
					color={avatarColor}
					size={avatarSize}
					radius={avatarSize}
					alt={agent?.name || t('form.agent.preview.avatarAlt')}
					className={styles.avatar}
				>
					{initials}
				</Avatar>
				<span
					className={`${styles.statusDot} ${
						isOnline ? styles.statusOnline : styles.statusOffline
					}`}
					aria-label={
						isOnline
							? t('form.agent.preview.online')
							: t('form.agent.preview.offline')
					}
				/>
			</div>

			<Text className={styles.name}>
				{agent?.name || t('form.agent.preview.unnamed')}
			</Text>

			<div className={styles.languageChip}>
				<span className={styles.flagIcon} role='img' aria-label={language}>
					{flagEmoji}
				</span>
				<Text className={styles.languageText}>{language}</Text>
			</div>
		</div>
	);
};

export default AgentProfile;
