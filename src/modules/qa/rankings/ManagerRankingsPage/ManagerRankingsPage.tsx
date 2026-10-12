import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconPlus, IconTrophy } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import ContentContainer from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import type {
	RankingProgram,
	RankingStatus,
} from '~/models/qa/rankingPrograms';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { useRankingsStore, selectPrograms } from '~/stores/qa/rankingsStore';
import {
	applyRankingFilters,
	computeStandings,
	matchesRankingFacets,
	participantCount,
	programsForRole,
	programsSharingTeams,
	sortPrograms,
} from '../helpers';
import {
	RANKING_STATUS_ORDER,
	rankingEditPath,
	rankingNewPath,
	rankingPath,
} from '../constants';
import {
	DEFAULT_RANKING_FILTERS,
	useRankingFilters,
} from '../hooks/useRankingFilters';
import RankingFilters from '../components/RankingFilters';
import RankingProgramCard from '../components/RankingProgramCard';

/** Supervisors run rankings for Team 1; the QA Manager for any teams. */
export const ManagerRankingsPage: React.FC = () => {
	const { t } = useTranslation('qa.rankings');
	const location = useLocation();
	const navigate = useNavigate();
	const role = roleFromPath(location.pathname);

	const allPrograms = useRankingsStore(selectPrograms);
	const endProgram = useRankingsStore((s) => s.endProgram);
	const activateProgram = useRankingsStore((s) => s.activateProgram);
	const deactivateProgram = useRankingsStore((s) => s.deactivateProgram);
	const setDefaultProgram = useRankingsStore((s) => s.setDefaultProgram);
	const duplicateProgram = useRankingsStore((s) => s.duplicateProgram);
	const deleteProgram = useRankingsStore((s) => s.deleteProgram);

	const { filters, setFilters } = useRankingFilters();

	const programs = useMemo(
		() => programsForRole(allPrograms, role),
		[allPrograms, role]
	);

	// Chip counts reflect every filter except status, so they say what each chip would show.
	const faceted = useMemo(
		() => programs.filter((p) => matchesRankingFacets(p, filters)),
		[programs, filters]
	);
	const counts = useMemo(
		() =>
			Object.fromEntries(
				RANKING_STATUS_ORDER.map((status) => [
					status,
					faceted.filter((p) => p.status === status).length,
				])
			) as Record<RankingStatus, number>,
		[faceted]
	);
	const visible = useMemo(
		() => sortPrograms(applyRankingFilters(programs, filters)),
		[programs, filters]
	);
	const liveAgents = participantCount(
		programs.filter((p) => p.status === 'active')
	);

	/** Standings are derived per program so cards and the drawer agree. */
	const standingsOf = useMemo(() => {
		const map = new Map<string, ReturnType<typeof computeStandings>>();
		programs.forEach((program) =>
			map.set(program.id, computeStandings(program, TEAM_CALLS))
		);
		return map;
	}, [programs]);

	/** After a status change, make sure the card stays visible. */
	const showStatus = (status: RankingStatus) => {
		if (!filters.status.includes(status)) {
			setFilters({ ...filters, status: [...filters.status, status] });
		}
	};

	/** Turning a ranking on replaces the one live for the same team, so the manager confirms first. */
	const toggleActive = (program: RankingProgram, active: boolean) => {
		if (!active) {
			deactivateProgram(program.id);
			notifySuccess(t('editor.deactivated'));
			return;
		}
		const replaced = programsSharingTeams(
			allPrograms,
			program.teams,
			program.id
		).find((p) => p.status === 'active');
		const activate = () => {
			activateProgram(program.id);
			notifySuccess(t('editor.launched'));
			showStatus('active');
		};
		if (!replaced) {
			activate();
			return;
		}
		modals.openConfirmModal({
			title: t('card.activateConfirm.title'),
			children: (
				<Text size='sm'>
					{t('card.activateConfirm.body', {
						name: program.name,
						replaced: replaced.name,
						teams: replaced.teams.join(', '),
					})}
				</Text>
			),
			labels: {
				confirm: t('card.activateConfirm.confirm'),
				cancel: t('editor.cancel'),
			},
			onConfirm: activate,
		});
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text size='xs' fw={500} c='dimmed' tt='uppercase'>
							{t(`page.eyebrow.${role}`)}
						</Text>
						<Title order={1}>{t('page.title')}</Title>
						<Text c='dimmed' mt='xs'>
							{t('page.description')}
						</Text>
					</div>
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => navigate(rankingNewPath(role))}
					>
						{t('page.new')}
					</Button>
				</Group>

				<Group justify='space-between' align='center' wrap='wrap' gap='sm'>
					<RankingFilters
						role={role}
						value={filters}
						onChange={setFilters}
						counts={counts}
					/>
					<Text size='sm' c='dimmed'>
						{t('filters.summary', {
							count: visible.length,
							agents: liveAgents,
						})}
					</Text>
				</Group>

				{visible.length === 0 ? (
					<EmptyState
						icon={<IconTrophy size={32} />}
						message={t(programs.length === 0 ? 'empty.none' : 'empty.noMatch')}
						action={
							programs.length === 0 ? (
								<Button onClick={() => navigate(rankingNewPath(role))}>
									{t('page.new')}
								</Button>
							) : (
								<Button
									variant='default'
									onClick={() => setFilters(DEFAULT_RANKING_FILTERS)}
								>
									{t('filters.clear')}
								</Button>
							)
						}
					/>
				) : (
					<SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing='lg'>
						{visible.map((program) => (
							<RankingProgramCard
								key={program.id}
								program={program}
								standings={standingsOf.get(program.id) ?? []}
								onView={() =>
									navigate(rankingPath(role, program.id), {
										state: { from: location.search },
									})
								}
								onEdit={() => navigate(rankingEditPath(role, program.id))}
								onDuplicate={() => {
									duplicateProgram(program.id);
									notifySuccess(t('editor.duplicated'));
									showStatus('draft');
								}}
								onToggleActive={(active) => toggleActive(program, active)}
								onSetDefault={() => {
									setDefaultProgram(program.id);
									notifySuccess(t('editor.defaultSet'));
								}}
								onEnd={() => {
									endProgram(program.id);
									notifySuccess(t('editor.ended'));
									showStatus('completed');
								}}
								onDelete={() => deleteProgram(program.id)}
							/>
						))}
					</SimpleGrid>
				)}
			</Stack>
		</ContentContainer>
	);
};

export default ManagerRankingsPage;
