import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconPlus, IconTrophy } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import ContentContainer from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { useRankingsStore, selectPrograms } from '~/stores/qa/rankingsStore';
import {
	computeStandings,
	overlappingDated,
	programsForRole,
	sortPrograms,
	tabOf,
} from '../helpers';
import {
	RANKING_TABS,
	TEAMS,
	rankingEditPath,
	rankingNewPath,
	rankingPath,
	type RankingTab,
} from '../constants';
import RankingTabs from '../components/RankingTabs';
import RankingProgramCard from '../components/RankingProgramCard';
import PastRankingsTable from '../components/PastRankingsTable';

/** Supervisors run rankings for Team 1; the QA Manager for any teams. */
export const ManagerRankingsPage: React.FC = () => {
	const { t } = useTranslation('qa.rankings');
	const location = useLocation();
	const navigate = useNavigate();
	const role = roleFromPath(location.pathname);
	const [params, setParams] = useSearchParams();

	const allPrograms = useRankingsStore(selectPrograms);
	const endProgram = useRankingsStore((s) => s.endProgram);
	const publishProgram = useRankingsStore((s) => s.publishProgram);
	const disableDefault = useRankingsStore((s) => s.disableDefault);
	const duplicateProgram = useRankingsStore((s) => s.duplicateProgram);
	const deleteProgram = useRankingsStore((s) => s.deleteProgram);

	const tabParam = params.get('tab') as RankingTab | null;
	const tab: RankingTab =
		tabParam && RANKING_TABS.includes(tabParam) ? tabParam : 'current';
	const teamParam = params.get('team');
	const team = teamParam && TEAMS.includes(teamParam) ? teamParam : null;

	/** The tab and the team live in the URL, so a refresh or a shared link keeps the view. */
	const setQuery = (key: 'tab' | 'team', value: string | null) =>
		setParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (value && !(key === 'tab' && value === 'current')) {
					next.set(key, value);
				} else {
					next.delete(key);
				}
				return next;
			},
			{ replace: true }
		);

	const programs = useMemo(
		() =>
			programsForRole(allPrograms, role).filter(
				(program) => !team || program.teams.includes(team)
			),
		[allPrograms, role, team]
	);

	const byTab = useMemo(
		() => ({
			current: sortPrograms(programs.filter((p) => tabOf(p) === 'current')),
			upcoming: sortPrograms(programs.filter((p) => tabOf(p) === 'upcoming')),
			past: sortPrograms(programs.filter((p) => tabOf(p) === 'past')),
		}),
		[programs]
	);
	const counts = {
		current: byTab.current.length,
		upcoming: byTab.upcoming.length,
		past: byTab.past.length,
	};

	/** Standings are derived per program so cards and the detail page agree. */
	const standingsOf = useMemo(() => {
		const map = new Map<string, ReturnType<typeof computeStandings>>();
		programs.forEach((program) =>
			map.set(program.id, computeStandings(program, TEAM_CALLS))
		);
		return map;
	}, [programs]);

	/** After a change, follow the ranking to the tab where it now lives. */
	const followTo = (programId: string) => {
		const moved = useRankingsStore
			.getState()
			.programs.find((p) => p.id === programId);
		if (moved) setQuery('tab', tabOf(moved));
	};

	/** A dated ranking replaces the one it overlaps for the same team, so the manager confirms first. */
	const publish = (program: RankingProgram) => {
		const replaced = program.isDefault
			? null
			: overlappingDated(allPrograms, program);
		const run = () => {
			publishProgram(program.id);
			notifySuccess(t('editor.launched'));
			followTo(program.id);
		};
		if (!replaced) {
			run();
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
				confirm: t('card.publish'),
				cancel: t('editor.cancel'),
			},
			onConfirm: run,
		});
	};

	const duplicate = (program: RankingProgram) => {
		const copy = duplicateProgram(program.id);
		notifySuccess(t('editor.duplicated'));
		followTo(copy.id);
	};

	const view = (program: RankingProgram) =>
		navigate(rankingPath(role, program.id), {
			state: { from: location.search },
		});

	const empty = (key: RankingTab) => (
		<EmptyState
			icon={<IconTrophy size={32} />}
			message={t(`empty.${key}`)}
			action={
				key === 'upcoming' ? (
					<Button onClick={() => navigate(rankingNewPath(role))}>
						{t('page.new')}
					</Button>
				) : undefined
			}
		/>
	);

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

				<RankingTabs
					role={role}
					tab={tab}
					onTabChange={(next) => setQuery('tab', next)}
					counts={counts}
					team={team}
					onTeamChange={(next) => setQuery('team', next)}
				/>

				{tab === 'past' ? (
					<PastRankingsTable
						role={role}
						programs={byTab.past}
						onView={view}
						onReuse={duplicate}
					/>
				) : byTab[tab].length === 0 ? (
					empty(tab)
				) : (
					<SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing='lg'>
						{byTab[tab].map((program) => (
							<RankingProgramCard
								key={program.id}
								program={program}
								standings={standingsOf.get(program.id) ?? []}
								onView={() => view(program)}
								onEdit={() => navigate(rankingEditPath(role, program.id))}
								onDuplicate={() => duplicate(program)}
								onPublish={() => publish(program)}
								onDisableDefault={() => {
									disableDefault(program.id);
									notifySuccess(t('editor.deactivated'));
								}}
								onEnd={() => {
									endProgram(program.id);
									notifySuccess(t('editor.ended'));
									followTo(program.id);
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
