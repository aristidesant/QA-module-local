import React, { useMemo, useState } from 'react';
import {
	Anchor,
	Avatar,
	Badge,
	Collapse,
	Group,
	Paper,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { REACTION_TYPES } from '~/models/qa/reactions';
import {
	getRankingReactionBreakdown,
	type AgentRankingEntry,
	type RankingReactionBreakdown,
} from '~/modules/qa/dashboard/mockData';
import styles from './ReactionsTab.module.css';

/** Givers shown before the "View more" link. */
const PREVIEW_GIVERS = 4;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	day: 'numeric',
	month: 'short',
});

const formatGivenAt = (isoDate: string): string =>
	dateFormatter.format(new Date(isoDate));

const getInitials = (name: string): string =>
	name
		.split(' ')
		.map((part) => part.charAt(0))
		.slice(0, 2)
		.join('')
		.toUpperCase();

interface ReactionRowProps {
	breakdown: RankingReactionBreakdown;
}

const ReactionRow: React.FC<ReactionRowProps> = ({ breakdown }) => {
	const [expanded, setExpanded] = useState(false);
	const [showAll, setShowAll] = useState(false);

	const config = REACTION_TYPES[breakdown.type];
	const hasGivers = breakdown.givenBy.length > 0;
	const visibleGivers = showAll
		? breakdown.givenBy
		: breakdown.givenBy.slice(0, PREVIEW_GIVERS);
	const hiddenSampled = breakdown.givenBy.length - visibleGivers.length;
	const notSampled = breakdown.count - breakdown.givenBy.length;

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
					<span className={styles.emoji} aria-hidden>
						{config.emoji}
					</span>

					<div className={styles.labelBlock}>
						<Text size='sm' fw={600}>
							{config.label}
						</Text>
						<Text size='xs' c='dimmed' lineClamp={1}>
							{config.description}
						</Text>
					</div>

					<Group gap='xs' wrap='nowrap'>
						<Badge
							variant='light'
							color={hasGivers ? 'blue' : 'gray'}
							radius='sm'
						>
							{breakdown.count}
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
					{visibleGivers.map((giver) => (
						<Group
							key={`${giver.agentId}-${giver.givenAt}`}
							gap='sm'
							wrap='nowrap'
						>
							<Avatar color={giver.avatarColor} radius='xl' size='sm'>
								{getInitials(giver.agentName)}
							</Avatar>
							<Text size='sm' lineClamp={1} className={styles.giverName}>
								{giver.agentName}
							</Text>
							<Text size='xs' c='dimmed' ml='auto'>
								{formatGivenAt(giver.givenAt)}
							</Text>
						</Group>
					))}

					{hiddenSampled > 0 ? (
						<Anchor
							component='button'
							type='button'
							size='xs'
							onClick={() => setShowAll(true)}
						>
							View more ({hiddenSampled})
						</Anchor>
					) : null}

					{notSampled > 0 && showAll ? (
						<Text size='xs' c='dimmed'>
							+{notSampled} more teammate{notSampled === 1 ? '' : 's'}
						</Text>
					) : null}
				</Stack>
			</Collapse>
		</Paper>
	);
};

export interface ReactionsTabProps {
	entry: AgentRankingEntry;
}

/** Social proof breakdown: who gave each reaction type, most recent first. */
export const ReactionsTab: React.FC<ReactionsTabProps> = ({ entry }) => {
	const breakdowns = useMemo(() => getRankingReactionBreakdown(entry), [entry]);

	const total = breakdowns.reduce((sum, breakdown) => sum + breakdown.count, 0);

	if (total === 0) {
		return (
			<Paper withBorder radius='md' p='lg' className={styles.emptyState}>
				<Stack gap={4} align='center'>
					<span className={styles.emptyIcon} aria-hidden>
						👏
					</span>
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
			{breakdowns.map((breakdown) => (
				<ReactionRow key={breakdown.type} breakdown={breakdown} />
			))}
		</Stack>
	);
};

export default ReactionsTab;
