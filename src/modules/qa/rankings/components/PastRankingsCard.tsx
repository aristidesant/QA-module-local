import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Table, Text } from '@mantine/core';
import dayjs from 'dayjs';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { CALL_EVALUATION_TABS } from '~/views/Campaigns/constants';
import styles from '../Rankings.module.css';

interface PastRankingsCardProps {
	programs: RankingProgram[];
}

export const PastRankingsCard: React.FC<PastRankingsCardProps> = ({
	programs,
}) => {
	const { t } = useTranslation('qa.rankings');

	return (
		<SectionCard title={t('agent.past.title')}>
			{programs.length === 0 ? (
				<EmptyState message={t('agent.past.empty')} />
			) : (
				<div className={styles.tableSurface}>
					<Table striped highlightOnHover verticalSpacing='sm' miw={640}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>{t('agent.past.columns.name')}</Table.Th>
								<Table.Th>{t('agent.past.columns.period')}</Table.Th>
								<Table.Th>{t('agent.past.columns.type')}</Table.Th>
								<Table.Th>{t('agent.past.columns.winner')}</Table.Th>
								<Table.Th>{t('agent.past.columns.prize')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{programs.map((program) => {
								const meta = CALL_EVALUATION_TABS.find(
									(tab) => tab.key === program.evaluationType
								);
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
												{dayjs(program.endDate).format('DD MMM YYYY')}
											</Text>
										</Table.Td>
										<Table.Td>
											<Badge
												size='sm'
												variant='light'
												color={meta?.color ?? 'gray'}
											>
												{t(`types.${program.evaluationType}`)}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Text size='sm'>{program.winnerName ?? '—'}</Text>
										</Table.Td>
										<Table.Td>
											<Text size='sm' c='dimmed'>
												{program.prize.icon} {program.prize.title}
											</Text>
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
