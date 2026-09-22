import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Avatar,
	Badge,
	Collapse,
	Group,
	Paper,
	Stack,
	Text,
	ThemeIcon,
	UnstyledButton,
} from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconHeartHandshake,
} from '@tabler/icons-react';
import { useRankingsStore, selectReactions } from '~/stores/qa/rankingsStore';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { UserReactionType } from '../../types/leaderboard';
import { REACTION_ICON, REACTION_ORDER } from '../../reactionMeta';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import styles from './ReactionsTab.module.css';

const LABEL_KEY: Record<UserReactionType, string> = {
	[UserReactionType.THUMBS_UP]: 'thumbsUp',
	[UserReactionType.CLAPPING_HANDS]: 'clap',
	[UserReactionType.HEART]: 'heart',
	[UserReactionType.FIRE]: 'fire',
};

const getInitials = (name: string): string =>
	name
		.split(' ')
		.map((part) => part.charAt(0))
		.slice(0, 2)
		.join('')
		.toUpperCase();

interface ReactionGroup {
	type: UserReactionType;
	givers: { agentId: string; agentName: string; avatarColor: string }[];
}

interface ReactionRowProps {
	group: ReactionGroup;
}

const ReactionRow: React.FC<ReactionRowProps> = ({ group }) => {
	const { t } = useTranslation('qa.rankings');
	const [expanded, setExpanded] = useState(false);
	const Icon = REACTION_ICON[group.type];
	const hasGivers = group.givers.length > 0;

	return (
		<Paper
			withBorder
			radius='md'
			p='sm'
			className={styles.card}
			data-muted={hasGivers ? undefined : true}
		>
			<UnstyledButton
				className={styles.trigger}
				onClick={() => hasGivers && setExpanded((value) => !value)}
				disabled={!hasGivers}
				aria-expanded={expanded}
			>
				<Group gap='sm' wrap='nowrap'>
					<ThemeIcon
						size='md'
						variant='light'
						color={hasGivers ? 'blue' : 'gray'}
						radius='sm'
					>
						<Icon size={16} />
					</ThemeIcon>

					<div className={styles.labelBlock}>
						<Text size='sm' fw={600}>
							{t(`reactions.labels.${LABEL_KEY[group.type]}`)}
						</Text>
					</div>

					<Group gap='xs' wrap='nowrap'>
						<Badge
							variant='light'
							color={hasGivers ? 'blue' : 'gray'}
							radius='sm'
						>
							{group.givers.length}
						</Badge>
						{hasGivers ? (
							<span className={styles.chevron} aria-hidden>
								{expanded ? (
									<IconChevronDown size={16} />
								) : (
									<IconChevronRight size={16} />
								)}
							</span>
						) : null}
					</Group>
				</Group>
			</UnstyledButton>

			<Collapse expanded={expanded && hasGivers}>
				<Stack gap='xs' pt='sm'>
					{group.givers.map((giver) => (
						<Group key={giver.agentId} gap='sm' wrap='nowrap'>
							<Avatar color={giver.avatarColor} radius='xl' size='sm'>
								{getInitials(giver.agentName)}
							</Avatar>
							<Text size='sm' lineClamp={1} className={styles.giverName}>
								{giver.agentName}
							</Text>
						</Group>
					))}
				</Stack>
			</Collapse>
		</Paper>
	);
};

export interface ReactionsTabProps {
	entry: AgentRankingEntry;
	/** Ranking program the entry belongs to — reactions are scoped per program. */
	programId: string;
}

/** Who reacted to this agent on this ranking, grouped by the reaction they gave. */
export const ReactionsTab: React.FC<ReactionsTabProps> = ({
	entry,
	programId,
}) => {
	const allReactions = useRankingsStore(selectReactions);

	const groups = useMemo<ReactionGroup[]>(() => {
		const given = allReactions[programId]?.[entry.agentId] ?? {};
		return REACTION_ORDER.map((type) => ({
			type,
			givers: Object.entries(given)
				.filter(([, reaction]) => reaction === type)
				.map(([agentId]) => {
					const agent = TEAM_AGENTS.find(
						(candidate) => candidate.id === agentId
					);
					return {
						agentId,
						agentName: agent?.name ?? agentId,
						avatarColor: agent?.avatarColor ?? 'gray',
					};
				}),
		}));
	}, [allReactions, programId, entry.agentId]);

	const total = groups.reduce((sum, group) => sum + group.givers.length, 0);

	if (total === 0) {
		return (
			<Paper withBorder radius='md' p='lg' className={styles.emptyState}>
				<Stack gap={4} align='center'>
					<ThemeIcon size={40} variant='light' color='gray' radius='xl'>
						<IconHeartHandshake size={20} />
					</ThemeIcon>
					<Text size='sm' fw={600}>
						No reactions yet
					</Text>
					<Text size='xs' c='dimmed' ta='center'>
						Share your appreciation — be the first to react.
					</Text>
				</Stack>
			</Paper>
		);
	}

	return (
		<Stack gap='xs'>
			<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
				{total} reaction{total === 1 ? '' : 's'} received
			</Text>
			{groups.map((group) => (
				<ReactionRow key={group.type} group={group} />
			))}
		</Stack>
	);
};

export default ReactionsTab;
