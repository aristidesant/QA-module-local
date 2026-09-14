import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { AppDrawer } from '~/components/AppDrawer';
import SectionCard from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { useRankingsStore } from '~/stores/qa/rankingsStore';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { CALL_EVALUATION_TABS } from '~/views/Campaigns/constants';
import { formatScore, formatTarget, leader } from '../helpers';
import { STATUS_COLOR } from '../constants';
import StandingsTable from './StandingsTable';

interface ProgramDetailDrawerProps {
	program: RankingProgram | null;
	standings: RankingStanding[];
	opened: boolean;
	onClose: () => void;
}

export const ProgramDetailDrawer: React.FC<ProgramDetailDrawerProps> = ({
	program,
	standings,
	opened,
	onClose,
}) => {
	const { t } = useTranslation('qa.rankings');
	const syncMilestones = useRankingsStore((s) => s.syncMilestones);
	const badges = useTriggerRulesStore((s) => s.badges);

	// Opening the drawer is the moment milestones are reconciled with the data.
	useEffect(() => {
		if (opened && program) syncMilestones(program.id);
	}, [opened, program, syncMilestones]);

	if (!program) return null;

	const typeMeta = CALL_EVALUATION_TABS.find(
		(tab) => tab.key === program.evaluationType
	);
	const qualified = standings.filter((s) => s.rank !== null);
	const top = leader(standings);
	const notStarted = qualified.length === 0;

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='xl'
			title={program.name}
			description={program.description}
			headerActions={
				<Group gap='xs'>
					<Badge variant='light' color={typeMeta?.color ?? 'gray'}>
						{t(`types.${program.evaluationType}`)}
					</Badge>
					<Badge variant='light' color={STATUS_COLOR[program.status]}>
						{t(`status.${program.status}`)}
					</Badge>
				</Group>
			}
		>
			<Stack gap='lg'>
				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
					<StatCard title={t('drawer.participants')} value={standings.length} />
					<StatCard title={t('drawer.qualified')} value={qualified.length} />
					<StatCard
						title={t('drawer.reachedTarget')}
						value={standings.filter((s) => s.reachedTarget).length}
						color='green'
					/>
					<StatCard
						title={
							program.status === 'completed'
								? t('drawer.winner')
								: t('drawer.leader')
						}
						value={
							program.status === 'completed'
								? (program.winnerName ?? '—')
								: (top?.agentName ?? '—')
						}
					/>
				</SimpleGrid>

				<SectionCard
					title={t('drawer.standings')}
					description={`${t('editor.target')}: ${formatTarget(program)} · ${dayjs(program.startDate).format('DD MMM')} → ${dayjs(program.endDate).format('DD MMM YYYY')}`}
				>
					{notStarted ? (
						<Text size='sm' c='dimmed'>
							{t('drawer.pending')}
						</Text>
					) : (
						<StandingsTable
							program={program}
							standings={standings}
							showTeam={program.teams.length > 1}
						/>
					)}
				</SectionCard>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard fullHeight title={t('drawer.milestones')}>
						{program.milestones.length === 0 ? (
							<Text size='sm' c='dimmed'>
								{t('editor.noBadge')}
							</Text>
						) : (
							<Stack gap='xs'>
								{program.milestones.map((milestone) => {
									const badge = badges.find((b) => b.id === milestone.badgeId);
									return (
										<Group key={milestone.id} justify='space-between'>
											<Group gap='xs'>
												<Text size='lg'>{badge?.icon ?? '🏅'}</Text>
												<div>
													<Text size='sm' fw={500}>
														{milestone.label || badge?.name}
													</Text>
													<Text size='xs' c='dimmed'>
														{badge?.name}
													</Text>
												</div>
											</Group>
											<Badge size='sm' variant='light'>
												{formatScore(program, milestone.threshold)}
											</Badge>
										</Group>
									);
								})}
							</Stack>
						)}
					</SectionCard>

					<SectionCard fullHeight title={t('drawer.prize')}>
						<Group gap='md' wrap='nowrap' align='flex-start'>
							<Text size='32px'>{program.prize.icon}</Text>
							<div>
								<Text size='sm' fw={600}>
									{program.prize.title}
								</Text>
								<Text size='xs' c='dimmed'>
									{program.prize.description}
								</Text>
								<Badge size='sm' variant='light' mt='xs'>
									{t(`prizeKinds.${program.prize.kind}`)}
								</Badge>
							</div>
						</Group>
					</SectionCard>
				</SimpleGrid>
			</Stack>
		</AppDrawer>
	);
};

export default ProgramDetailDrawer;
