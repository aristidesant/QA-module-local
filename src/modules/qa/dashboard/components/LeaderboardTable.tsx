import React from 'react';
import { Table, Group, Badge, Text, ThemeIcon } from '@mantine/core';
import { IconMedal, IconTrophy } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';

interface LeaderboardEntry {
	rank: number;
	name: string;
	score: number;
	change?: 'up' | 'down' | 'stable';
	changeValue?: number;
	reactions?: number;
}

interface LeaderboardTableProps {
	entries: LeaderboardEntry[];
	metric?: string;
	title?: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
	entries,
	metric = 'QA Score',
	title = 'Team Rankings',
}) => {
	return (
		<SectionCard title={title} description={`Ranked by ${metric}`}>
			<Table striped highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th style={{ width: 50 }}>Rank</Table.Th>
						<Table.Th>Agent</Table.Th>
						<Table.Th style={{ textAlign: 'right' }}>{metric}</Table.Th>
						<Table.Th style={{ textAlign: 'right' }}>Change</Table.Th>
						<Table.Th style={{ textAlign: 'right' }}>Reactions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{entries.map(entry => (
						<Table.Tr key={entry.rank}>
							<Table.Td>
								<Group gap='xs' justify='center'>
									{entry.rank <= 3 && (
										<ThemeIcon
											color={
												entry.rank === 1
													? 'yellow'
													: entry.rank === 2
														? 'gray'
														: 'orange'
											}
											variant='light'
											size='sm'
										>
											<IconTrophy size={14} />
										</ThemeIcon>
									)}
									<Text fw={600}>{entry.rank}</Text>
								</Group>
							</Table.Td>
							<Table.Td>
								<Group>
									<ThemeIcon
										color='blue'
										variant='light'
										radius='md'
										size='md'
									>
										{entry.name.charAt(0)}
									</ThemeIcon>
									<Text size='sm'>{entry.name}</Text>
								</Group>
							</Table.Td>
							<Table.Td align='right'>
								<Badge color='blue' variant='light'>
									{entry.score}%
								</Badge>
							</Table.Td>
							<Table.Td align='right'>
								<Badge
									color={
										entry.change === 'up'
											? 'green'
											: entry.change === 'down'
												? 'red'
												: 'gray'
									}
									variant='dot'
									size='sm'
								>
									{entry.change === 'up'
										? `↑ ${entry.changeValue}`
										: entry.change === 'down'
											? `↓ ${entry.changeValue}`
											: '→'}
								</Badge>
							</Table.Td>
							<Table.Td align='right'>
								<Group justify='flex-end'>
									<IconMedal size={16} />
									<Text size='sm'>{entry.reactions || 0}</Text>
								</Group>
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</SectionCard>
	);
};
