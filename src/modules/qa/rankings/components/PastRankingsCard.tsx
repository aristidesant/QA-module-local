import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Table, Text } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';
import dayjs from 'dayjs';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { PRIZE_ICON } from '../constants';
import { computeStandings, formatScore } from '../helpers';
import MetricChips from './MetricChips';
import styles from '../Rankings.module.css';

interface PastRankingsCardProps {
	programs: RankingProgram[];
	/** Whose row is highlighted in the "Your rank" column. */
	agentId: string;
}

export const PastRankingsCard: React.FC<PastRankingsCardProps> = ({
	programs,
	agentId,
}) => {
	const { t } = useTranslation('qa.rankings');

	const myStandings = useMemo(
		() =>
			new Map(
				programs.map((program) => [
					program.id,
					computeStandings(program, TEAM_CALLS).find(
						(standing) => standing.agentId === agentId
					),
				])
			),
		[programs, agentId]
	);

	return (
		<SectionCard title={t('agent.past.title')}>
			{programs.length === 0 ? (
				<EmptyState message={t('agent.past.empty')} />
			) : (
				<div className={styles.tableSurface}>
					<Table striped highlightOnHover verticalSpacing='sm' miw={720}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>{t('agent.past.columns.name')}</Table.Th>
								<Table.Th>{t('agent.past.columns.period')}</Table.Th>
								<Table.Th>{t('agent.past.columns.metrics')}</Table.Th>
								<Table.Th>{t('agent.past.columns.myRank')}</Table.Th>
								<Table.Th>{t('agent.past.columns.winner')}</Table.Th>
								<Table.Th>{t('agent.past.columns.prize')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{programs.map((program) => {
								const mine = myStandings.get(program.id);
								const wasWinner = program.winnerId === agentId;
								return (
									<Table.Tr key={program.id}>
										<Table.Td>
											<Text size='sm' fw={500}>
												{program.name}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size='sm' c='dimmed'>
												{dayjs(program.startDate).format('DD MMM')} →{' '}
												{program.endDate
													? dayjs(program.endDate).format('DD MMM YYYY')
													: '—'}
											</Text>
										</Table.Td>
										<Table.Td>
											<MetricChips program={program} size='xs' />
										</Table.Td>
										<Table.Td>
											{mine?.rank ? (
												<Group gap={4} wrap='nowrap'>
													{wasWinner && <IconTrophy size={14} />}
													<Text size='sm' fw={wasWinner ? 700 : 500}>
														{t('agent.past.myRankValue', {
															rank: mine.rank,
															score: formatScore(program, mine.score ?? 0),
														})}
													</Text>
												</Group>
											) : (
												<Text size='sm' c='dimmed'>
													{t('agent.past.unranked')}
												</Text>
											)}
										</Table.Td>
										<Table.Td>
											<Text size='sm'>{program.winnerName ?? '—'}</Text>
										</Table.Td>
										<Table.Td>
											<Group gap={6} wrap='nowrap'>
												{React.createElement(PRIZE_ICON[program.prize.kind], {
													size: 14,
												})}
												<Text size='sm' c='dimmed'>
													{program.prize.title}
												</Text>
											</Group>
										</Table.Td>
									</Table.Tr>
								);
							})}
						</Table.Tbody>
					</Table>
				</div>
			)}
		</SectionCard>
	);
};

export default PastRankingsCard;
