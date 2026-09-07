import React, { useState } from 'react';
import {
	Card,
	Table,
	Group,
	Text,
	Badge,
	ActionIcon,
	Stack,
	ThemeIcon,
	Tooltip,
	SimpleGrid,
	Center,
	Avatar,
} from '@mantine/core';
import { IconMedal, IconHeart, IconThumbUp, IconStar, IconFlame, IconTrophy } from '@tabler/icons-react';
import styles from '../Dashboard.module.css';

export interface RankingEntry {
	position: number;
	name: string;
	score: number;
	scoreDetails?: Record<string, number>;
	reactions: {
		like: number;
		helpful: number;
		inspiring: number;
		amazing: number;
		leader: number;
	};
	trend?: 'up' | 'down' | 'stable';
	trendValue?: number;
}

interface RankingsTableProps {
	entries: RankingEntry[];
	title?: string;
	description?: string;
	maxDisplay?: number;
	onReact?: (position: number, reactionType: string) => void;
	currentAgentId?: number;
	compact?: boolean;
}

const ReactionIcon: React.FC<{ type: string; count: number }> = ({ type, count }) => {
	const icons: Record<string, { icon: React.ReactNode; color: string }> = {
		like: { icon: <IconThumbUp size={16} />, color: '#4ECDC4' },
		helpful: { icon: <IconHeart size={16} />, color: '#FF6B6B' },
		inspiring: { icon: <IconStar size={16} />, color: '#FFD93D' },
		amazing: { icon: <IconFlame size={16} />, color: '#FF8C42' },
		leader: { icon: <IconTrophy size={16} />, color: '#FFD700' },
	};

	const config = icons[type];
	if (!config) return null;

	return (
		<Tooltip label={type.charAt(0).toUpperCase() + type.slice(1)}>
			<Group gap={4}>
				<span style={{ color: config.color }}>{config.icon}</span>
				<Text size="xs" fw={500}>
					{count}
				</Text>
			</Group>
		</Tooltip>
	);
};

const MedalIcon: React.FC<{ position: number }> = ({ position }) => {
	const medals: Record<number, { icon: React.ReactNode; color: string }> = {
		1: { icon: <IconTrophy size={20} />, color: '#FFD700' },
		2: { icon: <IconMedal size={20} />, color: '#C0C0C0' },
		3: { icon: <IconMedal size={20} />, color: '#CD7F32' },
	};

	const config = medals[position];
	if (!config) return <Text fw={700}>{position}</Text>;

	return (
		<ThemeIcon size="lg" style={{ backgroundColor: 'transparent' }}>
			<span style={{ color: config.color }}>{config.icon}</span>
		</ThemeIcon>
	);
};

export const RankingsTable: React.FC<RankingsTableProps> = ({
	entries,
	title = 'Team Rankings',
	description = 'Agent performance ranking for current period',
	maxDisplay = 10,
	onReact,
	compact = false,
}) => {
	const [reactionStates, setReactionStates] = useState<Record<number, string | null>>({});

	const displayEntries = entries.slice(0, maxDisplay);

	const handleReact = (position: number, reactionType: string) => {
		const key = position;
		const current = reactionStates[key];
		const newState = current === reactionType ? null : reactionType;
		setReactionStates((prev) => ({ ...prev, [key]: newState }));
		onReact?.(position, reactionType);
	};

	if (compact) {
		return (
			<Card className={styles.metricCard} p="md" radius="md" withBorder>
				<Stack gap="sm">
					<Text fw={600} size="sm">
						{title}
					</Text>
					<Stack gap={8}>
						{displayEntries.map((entry) => (
							<Group key={entry.position} justify="space-between" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}>
								<Group gap="xs">
									<MedalIcon position={entry.position} />
									<Text fw={500} size="sm">
										{entry.name}
									</Text>
								</Group>
								<Text fw={700} size="sm">
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
		<Card className={styles.metricCard} p="lg" radius="md" withBorder>
			<Stack gap="md">
				<div>
					<Text fw={600} size="md">
						{title}
					</Text>
					<Text size="xs" c="dimmed">
						{description}
					</Text>
				</div>

				<div style={{ overflowX: 'auto' }}>
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th style={{ width: 50 }}>Rank</Table.Th>
								<Table.Th>Name</Table.Th>
								<Table.Th style={{ width: 80 }} ta="right">
									Score
								</Table.Th>
								<Table.Th style={{ width: 250 }}>Reactions</Table.Th>
								<Table.Th style={{ width: 150 }} ta="center">
									Actions
								</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{displayEntries.length === 0 ? (
								<Table.Tr>
									<Table.Td colSpan={5}>
										<Center p="lg">
											<Text size="sm" c="dimmed">
												No rankings available
											</Text>
										</Center>
									</Table.Td>
								</Table.Tr>
							) : (
								displayEntries.map((entry) => (
									<Table.Tr key={entry.position} style={{ backgroundColor: entry.position <= 3 ? 'var(--mantine-color-yellow-0)' : undefined }}>
										<Table.Td>
											<MedalIcon position={entry.position} />
										</Table.Td>
										<Table.Td>
											<Group gap="xs">
												<Avatar name={entry.name} size="sm" color="blue" />
												<div>
													<Text fw={500} size="sm">
														{entry.name}
													</Text>
													{entry.trend && (
														<Badge size="xs" variant="light" color={entry.trend === 'up' ? 'green' : entry.trend === 'down' ? 'red' : 'gray'}>
															{entry.trend === 'up' && '↑'} {entry.trend === 'down' && '↓'} {entry.trendValue || 0}
														</Badge>
													)}
												</div>
											</Group>
										</Table.Td>
										<Table.Td ta="right">
											<Text fw={700} size="md">
												{entry.score.toFixed(1)}
											</Text>
										</Table.Td>
										<Table.Td>
											<SimpleGrid cols={5} spacing={4}>
												<ReactionIcon type="like" count={entry.reactions.like} />
												<ReactionIcon type="helpful" count={entry.reactions.helpful} />
												<ReactionIcon type="inspiring" count={entry.reactions.inspiring} />
												<ReactionIcon type="amazing" count={entry.reactions.amazing} />
												<ReactionIcon type="leader" count={entry.reactions.leader} />
											</SimpleGrid>
										</Table.Td>
										<Table.Td ta="center">
											<Group gap={4} justify="center">
												<Tooltip label="Like">
													<ActionIcon
														size="sm"
														variant={reactionStates[entry.position] === 'like' ? 'filled' : 'light'}
														color="#4ECDC4"
														onClick={() => handleReact(entry.position, 'like')}
													>
														<IconThumbUp size={16} />
													</ActionIcon>
												</Tooltip>
												<Tooltip label="Amazing">
													<ActionIcon
														size="sm"
														variant={reactionStates[entry.position] === 'amazing' ? 'filled' : 'light'}
														color="#FF8C42"
														onClick={() => handleReact(entry.position, 'amazing')}
													>
														<IconFlame size={16} />
													</ActionIcon>
												</Tooltip>
											</Group>
										</Table.Td>
									</Table.Tr>
								))
							)}
						</Table.Tbody>
					</Table>
				</div>

				{entries.length > maxDisplay && (
					<Text size="xs" c="dimmed" ta="center">
						Showing top {maxDisplay} of {entries.length}
					</Text>
				)}
			</Stack>
		</Card>
	);
};
