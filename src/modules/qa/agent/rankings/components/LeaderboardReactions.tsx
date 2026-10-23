import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { UserReactionType } from '../types/leaderboard';
import { useUserReaction } from '../hooks/useUserReaction';
import { REACTION_ICON } from '../reactionMeta';
import styles from './LeaderboardReactions.module.css';

const REACTION_OPTIONS: { emoji: UserReactionType; key: string }[] = [
	{ emoji: UserReactionType.THUMBS_UP, key: 'thumbsUp' },
	{ emoji: UserReactionType.CLAPPING_HANDS, key: 'clap' },
	{ emoji: UserReactionType.HEART, key: 'heart' },
	{ emoji: UserReactionType.FIRE, key: 'fire' },
];

interface LeaderboardReactionsProps {
	programId: string;
	agentId: string;
	agentName: string;
	size?: 'sm' | 'md';
	/** Shows the counts without buttons, for roles that can see reactions but not give them. */
	readOnly?: boolean;
}

/**
 * Peer recognition inline on the standings: one toggle per emoji with the
 * number of teammates who picked it. Agents cannot react to their own row, and
 * managers only read the counts.
 */
export const LeaderboardReactions: React.FC<LeaderboardReactionsProps> = ({
	programId,
	agentId,
	agentName,
	size = 'sm',
	readOnly = false,
}) => {
	const { t } = useTranslation('qa.rankings');
	const { currentReaction, totals, disabled, setReaction } = useUserReaction(
		programId,
		agentId
	);
	// The reaction just given, so only that icon pops (taking one back plays nothing).
	const [popped, setPopped] = useState<UserReactionType | null>(null);
	// The count that just changed because of the agent's click; counts do not animate on load.
	const [bumped, setBumped] = useState<UserReactionType | null>(null);

	if (readOnly) {
		const given = REACTION_OPTIONS.filter(
			({ emoji }) => (totals[emoji] ?? 0) > 0
		);
		if (given.length === 0) {
			return (
				<Text size='xs' c='dimmed'>
					—
				</Text>
			);
		}
		return (
			<Group gap={8} wrap='nowrap'>
				{given.map(({ emoji, key }) => {
					const Icon = REACTION_ICON[emoji];
					return (
						<Tooltip key={emoji} label={t(`reactions.labels.${key}`)} withArrow>
							<Group gap={4} wrap='nowrap' className={styles.readOnlyChip}>
								<Icon size={14} stroke={2} />
								<Text size='xs' fw={600}>
									{totals[emoji]}
								</Text>
							</Group>
						</Tooltip>
					);
				})}
			</Group>
		);
	}

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
				const Icon = REACTION_ICON[emoji];

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
							data-pop={popped === emoji || undefined}
							data-bump={bumped === emoji || undefined}
							onClick={() => {
								setPopped(mine ? null : emoji);
								setBumped(emoji);
								setReaction(mine ? null : emoji);
							}}
						>
							<span className={styles.inner}>
								<Icon
									size={size === 'md' ? 16 : 14}
									className={styles.icon}
									stroke={2}
									onAnimationEnd={() => setPopped(null)}
								/>
								{count > 0 && (
									<span
										key={count}
										className={styles.count}
										onAnimationEnd={() => setBumped(null)}
									>
										{count}
									</span>
								)}
							</span>
						</UnstyledButton>
					</Tooltip>
				);
			})}
		</Group>
	);
};

export default LeaderboardReactions;
