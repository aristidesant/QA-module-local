import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Table, Text, ThemeIcon, Tooltip } from '@mantine/core';
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconMinus,
} from '@tabler/icons-react';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import LeaderboardReactions from '~/modules/qa/agent/rankings/components/LeaderboardReactions';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { formatScore, isComposite } from '../helpers';
import ScoreBreakdown from './ScoreBreakdown';
import WinnerBadge from './WinnerBadge';
import type { StandingsPeriod } from '../constants';
import styles from '../Rankings.module.css';

/** Who can see the reactions column and whether they can add one. */
export type ReactionsMode = 'off' | 'readonly' | 'interactive';

interface StandingsTableProps {
	program: RankingProgram;
	standings: RankingStanding[];
	/** Highlights the row of the agent viewing their own leaderboard. */
	currentAgentId?: string;
	showTeam?: boolean;
	onRowClick?: (standing: RankingStanding) => void;
	reactions?: ReactionsMode;
	/** Rank, agent and scorecard only, for narrow placements such as a dashboard card. */
	dense?: boolean;
	/** Window the standings were ranked over; names the movement column. */
	period?: StandingsPeriod;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
	program,
	standings,
	currentAgentId,
	showTeam = false,
	onRowClick,
	reactions = 'off',
	dense = false,
	period = 'all',
}) => {
	const { t } = useTranslation('qa.rankings');
	const badges = useTriggerRulesStore((s) => s.badges);
	const completed = program.status === 'completed';
	const showReactions = reactions !== 'off' && !dense;

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
		const rowClass = [
			standing.agentId === currentAgentId ? styles.currentRow : '',
			onRowClick ? styles.clickableRow : '',
		]
			.filter(Boolean)
			.join(' ');

		return (
			<Table.Tr
				key={standing.agentId}
				className={rowClass || undefined}
				onClick={onRowClick ? () => onRowClick(standing) : undefined}
			>
				<Table.Td className={styles.rankCell}>
					{standing.rank === null ? (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					) : (
						<Group gap={4} wrap='nowrap'>
							<Text size='sm' fw={700}>
								{standing.rank}
							</Text>
							<WinnerBadge isWinner={completed && standing.rank === 1} />
						</Group>
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
						{isComposite(program) && standing.score !== null ? (
							<Tooltip
								label={<ScoreBreakdown program={program} standing={standing} />}
								withArrow
								multiline
								w={260}
							>
								<Text size='sm' fw={600} className={styles.helpCursor}>
									{formatScore(program, standing.score)}
								</Text>
							</Tooltip>
						) : (
							<Text size='sm' fw={600}>
								{formatScore(program, standing.score)}
							</Text>
						)}
					</Group>
				</Table.Td>
				{!dense && (
					<Table.Td align='right'>
						<Text size='sm' c='dimmed'>
							{standing.calls}
						</Text>
					</Table.Td>
				)}
				{!dense && (
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
				)}
				{!dense && (
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
				)}
				{showReactions && (
					<Table.Td>
						<LeaderboardReactions
							programId={program.id}
							agentId={standing.agentId}
							agentName={standing.agentName}
							readOnly={reactions === 'readonly'}
						/>
					</Table.Td>
				)}
			</Table.Tr>
		);
	});

	return (
		<div className={styles.tableSurface}>
			<Table
				striped
				highlightOnHover
				verticalSpacing='sm'
				miw={dense ? undefined : 720}
			>
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
						{!dense && (
							<Table.Th align='right'>{t('drawer.columns.calls')}</Table.Th>
						)}
						{!dense && (
							<Table.Th align='right' className={styles.deltaCell}>
								{period === 'all'
									? t('drawer.columns.delta')
									: t('standings.deltaWindow', { days: period })}
							</Table.Th>
						)}
						{!dense && <Table.Th>{t('drawer.columns.milestones')}</Table.Th>}
						{showReactions && (
							<Table.Th>{t('drawer.columns.reactions')}</Table.Th>
						)}
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{rows}</Table.Tbody>
			</Table>
		</div>
	);
};

export default StandingsTable;
