import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { UserReactionType } from '../types/leaderboard';
import { useUserReaction } from '../hooks/useUserReaction';
import styles from './LeaderboardReactions.module.css';

const REACTION_OPTIONS: { emoji: UserReactionType; key: string }[] = [
	{ emoji: UserReactionType.THUMBS_UP, key: 'thumbsUp' },
	{ emoji: UserReactionType.CLAPPING_HANDS, key: 'clap' },
	{ emoji: UserReactionType.HEART, key: 'heart' },
	{ emoji: UserReactionType.FIRE, key: 'fire' },
];

interface LeaderboardReactionsProps {
	agentId: string;
	agentName: string;
	size?: 'sm' | 'md';
}

/**
 * Peer recognition inline on the leaderboard: one toggle per emoji with the
 * number of teammates who picked it. Agents cannot react to their own row.
 */
export const LeaderboardReactions: React.FC<LeaderboardReactionsProps> = ({
	agentId,
	agentName,
	size = 'sm',
}) => {
	const { t } = useTranslation('qa.rankings');
	const { currentReaction, totals, disabled, setReaction } =
		useUserReaction(agentId);

	if (disabled) {
		return (
			<Text size='xs' c='dimmed'>
				{t('reactions.you')}
			</Text>
		);
	}

	return (
		<Group gap={4} wrap='nowrap' onClick={(event) => event.stopPropagation()}>
			{REACTION_OPTIONS.map(({ emoji, key }) => {
				const count = totals[emoji] ?? 0;
				const mine = currentReaction === emoji;

				return (
					<Tooltip
						key={emoji}
						label={t(`reactions.${mine ? 'remove' : 'give'}`, {
							reaction: t(`reactions.labels.${key}`),
							name: agentName,
						})}
						withArrow
					>
						<UnstyledButton
							className={styles.chip}
							data-size={size}
							data-active={mine || undefined}
							aria-pressed={mine}
							onClick={() => setReaction(mine ? null : emoji)}
						>
							<span aria-hidden>{emoji}</span>
							{count > 0 && <span className={styles.count}>{count}</span>}
						</UnstyledButton>
					</Tooltip>
				);
			})}
		</Group>
	);
};

export default LeaderboardReactions;
