import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
	Anchor,
	Badge,
	Breadcrumbs,
	Button,
	Grid,
	Group,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconEdit, IconStar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { useRankingsStore, selectPrograms } from '~/stores/qa/rankingsStore';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import MetricChips from '../components/MetricChips';
import StandingsTable from '../components/StandingsTable';
import {
	STATUS_COLOR,
	rankingEditPath,
	rankingPath,
	rankingsBasePath,
} from '../constants';
import {
	computeStandings,
	formatScore,
	formatTarget,
	isPermanent,
	leader,
	programsForRole,
} from '../helpers';

/** One ranking on its own page (route `rankings/:programId`): who is where, the milestones and the prize. */
export default function RankingDetailPage() {
	const { t } = useTranslation('qa.rankings');
	const location = useLocation();
	const navigate = useNavigate();
	const { programId } = useParams<{ programId: string }>();

	const role = roleFromPath(location.pathname);
	const programs = useRankingsStore(selectPrograms);
	const syncMilestones = useRankingsStore((s) => s.syncMilestones);
	const badges = useTriggerRulesStore((s) => s.badges);

	const program =
		programsForRole(programs, role).find((p) => p.id === programId) ?? null;

	// Opening a ranking is the moment its milestones are reconciled with the data.
	useEffect(() => {
		if (programId) syncMilestones(programId);
	}, [programId, syncMilestones]);

	const standings = useMemo(
		() => (program ? computeStandings(program, TEAM_CALLS) : []),
		[program]
	);

	// The list passes its filters along so going back keeps the view the manager had.
	const from = (location.state as { from?: string } | null)?.from ?? '';
	const backToRankings = () => navigate(`${rankingsBasePath(role)}${from}`);

	if (!program) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('page.notFound')} />
			</ContentContainer>
		);
	}

	const qualified = standings.filter((s) => s.rank !== null);
	const top = leader(standings);
	const completed = program.status === 'completed';

	// The editor brings the manager back here, with the list's filters still remembered.
	const editRanking = () =>
		navigate(rankingEditPath(role, program.id), {
			state: { returnTo: rankingPath(role, program.id), from },
		});

	return (
		<ContentContainer
			contentWidth='full'
			showBackButton
			onBackClick={backToRankings}
		>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={backToRankings}>
						{t('page.title')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{program.name}
					</Text>
				</Breadcrumbs>

				<Group justify='space-between' align='flex-start' wrap='wrap'>
					<Stack gap={6}>
						<Title order={1}>{program.name}</Title>
						{program.description && (
							<Text size='sm' c='dimmed'>
								{program.description}
							</Text>
						)}
						<Group gap='xs' mt={4}>
							<Badge variant='light' color={STATUS_COLOR[program.status]}>
								{t(`status.${program.status}`)}
							</Badge>
							{program.isDefault && (
								<Badge
									variant='outline'
									color='gray'
									leftSection={<IconStar size={12} />}
								>
									{t('card.default')}
								</Badge>
							)}
							<MetricChips program={program} size='md' />
						</Group>
					</Stack>
					<Button
						variant='default'
						leftSection={<IconEdit size={16} />}
						onClick={editRanking}
					>
						{t('card.edit')}
					</Button>
				</Group>

				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
					<StatCard title={t('drawer.participants')} value={standings.length} />
					<StatCard title={t('drawer.qualified')} value={qualified.length} />
					<StatCard
						title={t('drawer.reachedTarget')}
						value={standings.filter((s) => s.reachedTarget).length}
						color='green'
					/>
					<StatCard
						title={completed ? t('drawer.winner') : t('drawer.leader')}
						value={
							completed ? (program.winnerName ?? '—') : (top?.agentName ?? '—')
						}
					/>
				</SimpleGrid>

				<Grid gap='md'>
					<Grid.Col span={{ base: 12, md: 8 }}>
						<SectionCard
							title={t('drawer.standings')}
							description={`${t('editor.target')}: ${formatTarget(program)} · ${
								isPermanent(program)
									? `${t('card.since', { date: dayjs(program.startDate).format('DD MMM YYYY') })} · ${t('card.noEndDate')}`
									: `${dayjs(program.startDate).format('DD MMM')} → ${dayjs(program.endDate).format('DD MMM YYYY')}`
							}`}
						>
							{qualified.length === 0 ? (
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
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 4 }}>
						<Stack gap='md'>
							<SectionCard title={t('drawer.prize')}>
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

							<SectionCard title={t('drawer.milestones')}>
								{program.milestones.length === 0 ? (
									<Text size='sm' c='dimmed'>
										{t('editor.noBadge')}
									</Text>
								) : (
									<Stack gap='xs'>
										{program.milestones.map((milestone) => {
											const badge = badges.find(
												(b) => b.id === milestone.badgeId
											);
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
						</Stack>
					</Grid.Col>
				</Grid>
			</Stack>
		</ContentContainer>
	);
}
