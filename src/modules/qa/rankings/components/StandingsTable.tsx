import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Group,
	Progress,
	Table,
	Text,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconMinus,
} from '@tabler/icons-react';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { formatScore } from '../helpers';
import styles from '../Rankings.module.css';

interface StandingsTableProps {
	program: RankingProgram;
	standings: RankingStanding[];
	/** Highlights the row of the agent viewing their own leaderboard. */
	currentAgentId?: string;
	showTeam?: boolean;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
	program,
	standings,
	currentAgentId,
	showTeam = false,
}) => {
	const { t } = useTranslation('qa.rankings');
	const badges = useTriggerRulesStore((s) => s.badges);

	const rows = standings.map((standing) => {
		const delta = standing.delta;
		const DeltaIcon =
			delta === null || delta === 0
				? IconMinus
				: delta > 0
					? IconArrowUpRight
					: IconArrowDownRight;
		const deltaColor =
			delta === null || delta === 0 ? 'gray' : delta > 0 ? 'green' : 'red';

		return (
			<Table.Tr
				key={standing.agentId}
				className={
					standing.agentId === currentAgentId ? styles.currentRow : undefined
				}
			>
				<Table.Td className={styles.rankCell}>
					{standing.rank === null ? (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					) : (
						<Text size='sm' fw={700}>
							{standing.rank}
						</Text>
					)}
				</Table.Td>
				<Table.Td>
					<Text size='sm' fw={500}>
						{standing.agentName}
					</Text>
					{standing.rank === null && (
						<Text size='xs' c='dimmed'>
							{t('drawer.unranked')}
						</Text>
					)}
				</Table.Td>
				{showTeam && (
					<Table.Td>
						<Text size='sm' c='dimmed'>
							{standing.team}
						</Text>
					</Table.Td>
				)}
				<Table.Td className={styles.scoreCell}>
					<Group gap='xs' wrap='nowrap'>
						<Progress
							value={
								standing.score === null
									? 0
									: Math.min(
											100,
											(standing.score / Math.max(program.targetScore, 1)) * 100
										)
							}
							color={standing.reachedTarget ? 'green' : 'blue'}
							size='sm'
							className={styles.scoreBar}
						/>
						<Text size='sm' fw={600}>
							{formatScore(program, standing.score)}
						</Text>
					</Group>
				</Table.Td>
				<Table.Td align='right'>
					<Text size='sm' c='dimmed'>
						{standing.calls}
					</Text>
				</Table.Td>
				<Table.Td align='right' className={styles.deltaCell}>
					{delta === null ? (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					) : (
						<Group gap={4} justify='flex-end' wrap='nowrap'>
							<Text size='sm'>{delta === 0 ? '0' : Math.abs(delta)}</Text>
							<ThemeIcon size='xs' variant='light' color={deltaColor}>
								<DeltaIcon size={12} />
							</ThemeIcon>
						</Group>
					)}
				</Table.Td>
				<Table.Td>
					<Group gap={4} wrap='wrap'>
						{standing.milestoneIds.map((milestoneId) => {
							const milestone = program.milestones.find(
								(m) => m.id === milestoneId
							);
							const badge = badges.find((b) => b.id === milestone?.badgeId);
							if (!badge) return null;
							return (
								<Tooltip
									key={milestoneId}
									label={`${badge.name} · ${milestone?.label}`}
									withArrow
								>
									<Text size='lg' component='span'>
										{badge.icon}
									</Text>
								</Tooltip>
							);
						})}
					</Group>
				</Table.Td>
			</Table.Tr>
		);
	});

	return (
		<div className={styles.tableSurface}>
			<Table striped highlightOnHover verticalSpacing='sm' miw={720}>
				<Table.Thead>
					<Table.Tr>
						<Table.Th className={styles.rankCell}>
							{t('drawer.columns.rank')}
						</Table.Th>
						<Table.Th>{t('drawer.columns.agent')}</Table.Th>
						{showTeam && <Table.Th>{t('drawer.columns.team')}</Table.Th>}
						<Table.Th className={styles.scoreCell}>
							{t('drawer.columns.score')}
						</Table.Th>
						<Table.Th align='right'>{t('drawer.columns.calls')}</Table.Th>
						<Table.Th align='right' className={styles.deltaCell}>
							{t('drawer.columns.delta')}
						</Table.Th>
						<Table.Th>{t('drawer.columns.milestones')}</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{rows}</Table.Tbody>
			</Table>
		</div>
	);
};

export default StandingsTable;
