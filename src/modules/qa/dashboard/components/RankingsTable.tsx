import React, { useState } from 'react';
import {
	Card,
	Table,
	Group,
	Text,
	Badge,
	Stack,
	ThemeIcon,
	Tooltip,
	Center,
	Avatar,
	UnstyledButton,
	Paper,
} from '@mantine/core';
import { IconMedal, IconTrophy, IconTarget } from '@tabler/icons-react';
import styles from '../Dashboard.module.css';

/** The four reaction types teammates can give each other */
export type ReactionType = 'applause' | 'reverence' | 'salute' | 'thumbsUp';

export type ReactionCounts = Record<ReactionType, number>;

export interface RankingEntry {
	position: number;
	name: string;
	score: number;
	scoreDetails?: Record<string, number>;
	reactions: ReactionCounts;
	trend?: 'up' | 'down' | 'stable';
	trendValue?: number;
}

/**
 * The ranking goal defined by the supervisor: the single metric the ranking
 * is based on and the target/deadline for achievement.
 */
export interface RankingGoal {
	/** The single metric the ranking score is built from, e.g. 'QA Score' */
	metric: string;
	/** Human-readable scoring criteria, e.g. "Weighted score of 90 or above" */
	criteria: string;
	/** Optional target the team is ranked against */
	target?: string;
	/** Start date for the ranking goal (ISO date string, e.g. "2026-09-01") */
	startDate?: string;
	/** Due date for the ranking goal (ISO date string, e.g. "2026-12-31") */
	dueDate?: string;
	/** Who defined the goal */
	setBy?: string;
}

interface RankingsTableProps {
	entries: RankingEntry[];
	title?: string;
	description?: string;
	maxDisplay?: number;
	goal?: RankingGoal;
	onReact?: (position: number, reactionType: ReactionType) => void;
	currentAgentId?: number;
	compact?: boolean;
}

/**
 * Reaction display config. Emoji are used rather than icons because the
 * requested set (applause, reverence, military salute, thumbs up) has no
 * complete equivalent in the Tabler icon set, and emoji render identically
 * in both dark and light mode.
 */
const REACTION_CONFIG: { type: ReactionType; emoji: string; label: string }[] = [
	{ type: 'applause', emoji: '👏', label: 'Applause' },
	{ type: 'reverence', emoji: '🙇', label: 'Reverence' },
	{ type: 'salute', emoji: '🫡', label: 'Military Salute' },
	{ type: 'thumbsUp', emoji: '👍', label: 'Thumbs Up' },
];

/**
 * A single clickable reaction chip. Toggling it optimistically adjusts the
 * displayed count so the interaction feels live in the mockup.
 */
const ReactionButton: React.FC<{
	emoji: string;
	label: string;
	count: number;
	active: boolean;
	onClick: () => void;
}> = ({ emoji, label, count, active, onClick }) => (
	<Tooltip label={label} withArrow>
		<UnstyledButton
			onClick={onClick}
			aria-label={label}
			aria-pressed={active}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 4,
				padding: '2px 8px',
				borderRadius: 'var(--mantine-radius-xl)',
				border: active
					? '1px solid var(--mantine-color-blue-5)'
					: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
				backgroundColor: active
					? 'light-dark(var(--mantine-color-blue-0), var(--mantine-color-blue-9))'
					: 'transparent',
				cursor: 'pointer',
				lineHeight: 1.4,
			}}
		>
			<span aria-hidden style={{ fontSize: 14, color: 'light-dark(var(--mantine-color-dark-7), var(--mantine-color-gray-1))' }}>
				{emoji}
			</span>
			<Text size='xs' fw={active ? 700 : 500}>
				{count}
			</Text>
		</UnstyledButton>
	</Tooltip>
);

const MedalIcon: React.FC<{ position: number }> = ({ position }) => {
	const medals: Record<number, { icon: React.ReactNode; color: string }> = {
		1: { icon: <IconTrophy size={20} />, color: 'var(--mantine-color-yellow-5)' },
		2: { icon: <IconMedal size={20} />, color: 'var(--mantine-color-gray-5)' },
		3: { icon: <IconMedal size={20} />, color: 'var(--mantine-color-orange-5)' },
	};

	const config = medals[position];
	if (!config) return <Text fw={700}>{position}</Text>;

	return (
		<ThemeIcon size='lg' variant='transparent'>
			<span style={{ color: config.color }}>{config.icon}</span>
		</ThemeIcon>
	);
};

/**
 * The supervisor-defined ranking goal banner shown above the table.
 */
const RankingGoalBanner: React.FC<{ goal: RankingGoal }> = ({ goal }) => (
	<Paper
		p='md'
		radius='md'
		withBorder
		style={{ backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))' }}
	>
		<Group gap='sm' align='flex-start' wrap='nowrap'>
			<ThemeIcon size='lg' color='blue' radius='md' variant='light'>
				<IconTarget size={20} />
			</ThemeIcon>
			<Stack gap={6} style={{ flex: 1 }}>
				<Group justify='space-between' align='center' wrap='wrap'>
					<Text fw={600} size='sm'>
						Ranking Goal
					</Text>
					{goal.setBy && (
						<Text size='xs' c='dimmed'>
							Set by {goal.setBy}
						</Text>
					)}
				</Group>

				<Badge size='sm' variant='light' color='blue'>
					{goal.metric}
				</Badge>

				<Text size='xs' c='dimmed'>
					Scoring criteria: {goal.criteria}
					{goal.target ? ` · Target: ${goal.target}` : ''}
					{goal.startDate ? ` · Start: ${new Date(goal.startDate).toLocaleDateString()}` : ''}
					{goal.dueDate ? ` · Due: ${new Date(goal.dueDate).toLocaleDateString()}` : ''}
				</Text>
			</Stack>
		</Group>
	</Paper>
);

export const RankingsTable: React.FC<RankingsTableProps> = ({
	entries,
	title = 'Team Rankings',
	description = 'Agent performance ranking for current period',
	maxDisplay = 10,
	goal,
	onReact,
	compact = false,
}) => {
	/** Per-entry reaction the current user has given (mockup-local state) */
	const [reactionStates, setReactionStates] = useState<Record<number, ReactionType | null>>({});

	const displayEntries = entries.slice(0, maxDisplay);

	const handleReact = (position: number, reactionType: ReactionType) => {
		setReactionStates(prev => ({
			...prev,
			[position]: prev[position] === reactionType ? null : reactionType,
		}));
		onReact?.(position, reactionType);
	};

	if (compact) {
		return (
			<Card className={styles.metricCard} p='md' radius='md' withBorder>
				<Stack gap='sm'>
					<Text fw={600} size='sm'>
						{title}
					</Text>
					<Stack gap={8}>
						{displayEntries.map(entry => (
							<Group
								key={entry.position}
								justify='space-between'
								p='xs'
								style={{
									backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))',
									borderRadius: 'var(--mantine-radius-md)',
								}}
							>
								<Group gap='xs'>
									<MedalIcon position={entry.position} />
									<Text fw={500} size='sm'>
										{entry.name}
									</Text>
								</Group>
								<Text fw={700} size='sm'>
									{entry.score.toFixed(1)}
								</Text>
							</Group>
						))}
					</Stack>
				</Stack>
			</Card>
		);
	}

	return (
		<Card className={styles.metricCard} p='lg' radius='md' withBorder>
			<Stack gap='md'>
				<div>
					<Text fw={600} size='md'>
						{title}
					</Text>
					<Text size='xs' c='dimmed'>
						{description}
					</Text>
				</div>

				{goal && <RankingGoalBanner goal={goal} />}

				<div style={{ overflowX: 'auto' }}>
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th style={{ width: 60 }}>Rank</Table.Th>
								<Table.Th>Name</Table.Th>
								<Table.Th style={{ width: 90 }} ta='right'>
									Score
								</Table.Th>
								<Table.Th style={{ width: 280 }}>Reactions</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{displayEntries.length === 0 ? (
								<Table.Tr>
									<Table.Td colSpan={4}>
										<Center p='lg'>
											<Text size='sm' c='dimmed'>
												No rankings available
											</Text>
										</Center>
									</Table.Td>
								</Table.Tr>
							) : (
								displayEntries.map(entry => (
									<Table.Tr key={entry.position}>
										<Table.Td>
											<MedalIcon position={entry.position} />
										</Table.Td>
										<Table.Td>
											<Group gap='xs'>
												<Avatar name={entry.name} size='sm' color='blue' />
												<div>
													<Text fw={500} size='sm'>
														{entry.name}
													</Text>
													{entry.trend && (
														<Badge
															size='xs'
															variant='light'
															color={
																entry.trend === 'up' ? 'green' : entry.trend === 'down' ? 'red' : 'gray'
															}
														>
															{entry.trend === 'up' && '↑'}
															{entry.trend === 'down' && '↓'} {entry.trendValue ?? 0}
														</Badge>
													)}
												</div>
											</Group>
										</Table.Td>
										<Table.Td ta='right'>
											<Text fw={700} size='md'>
												{entry.score.toFixed(1)}
											</Text>
										</Table.Td>
										<Table.Td>
											<Group gap={6} wrap='wrap'>
												{REACTION_CONFIG.map(reaction => {
													const active = reactionStates[entry.position] === reaction.type;
													return (
														<ReactionButton
															key={reaction.type}
															emoji={reaction.emoji}
															label={reaction.label}
															count={entry.reactions[reaction.type] + (active ? 1 : 0)}
															active={active}
															onClick={() => handleReact(entry.position, reaction.type)}
														/>
													);
												})}
											</Group>
										</Table.Td>
									</Table.Tr>
								))
							)}
						</Table.Tbody>
					</Table>
				</div>

				{entries.length > maxDisplay && (
					<Text size='xs' c='dimmed' ta='center'>
						Showing top {maxDisplay} of {entries.length}
					</Text>
				)}
			</Stack>
		</Card>
	);
};

export default RankingsTable;
