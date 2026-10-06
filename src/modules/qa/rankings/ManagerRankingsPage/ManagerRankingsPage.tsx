import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import {
	Badge,
	Button,
	Group,
	SimpleGrid,
	Stack,
	Tabs,
	Text,
	Title,
} from '@mantine/core';
import {
	IconCheck,
	IconPlayerPause,
	IconPlus,
	IconTrophy,
	IconUsers,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import ContentContainer from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import { StatCard } from '~/components/StatCard';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { useRankingsStore, selectPrograms } from '~/stores/qa/rankingsStore';
import {
	computeStandings,
	participantCount,
	programsForRole,
	programsSharingTeams,
} from '../helpers';
import { RANKING_TABS, type RankingTab } from '../constants';
import RankingProgramCard from '../components/RankingProgramCard';
import ProgramDetailDrawer from '../components/ProgramDetailDrawer';
import RankingEditorDrawer from '../components/RankingEditorDrawer';

/** Supervisors run rankings for Team 1; the QA Manager for any teams. */
export const ManagerRankingsPage: React.FC = () => {
	const { t } = useTranslation('qa.rankings');
	const location = useLocation();
	const role = roleFromPath(location.pathname);

	const allPrograms = useRankingsStore(selectPrograms);
	const endProgram = useRankingsStore((s) => s.endProgram);
	const activateProgram = useRankingsStore((s) => s.activateProgram);
	const deactivateProgram = useRankingsStore((s) => s.deactivateProgram);
	const setDefaultProgram = useRankingsStore((s) => s.setDefaultProgram);
	const duplicateProgram = useRankingsStore((s) => s.duplicateProgram);
	const deleteProgram = useRankingsStore((s) => s.deleteProgram);

	const [tab, setTab] = useState<RankingTab>('active');
	const [detail, setDetail] = useState<RankingProgram | null>(null);
	const [editing, setEditing] = useState<RankingProgram | null>(null);
	const [editorOpen, setEditorOpen] = useState(false);

	const programs = useMemo(
		() => programsForRole(allPrograms, role),
		[allPrograms, role]
	);

	const byTab = useMemo(
		() => ({
			active: programs.filter((p) => p.status === 'active'),
			inactive: programs.filter((p) => p.status === 'inactive'),
			completed: programs.filter((p) => p.status === 'completed'),
			drafts: programs.filter((p) => p.status === 'draft'),
		}),
		[programs]
	);

	/** Standings are derived per program so cards and the drawer agree. */
	const standingsOf = useMemo(() => {
		const map = new Map<string, ReturnType<typeof computeStandings>>();
		programs.forEach((program) =>
			map.set(program.id, computeStandings(program, TEAM_CALLS))
		);
		return map;
	}, [programs]);

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
			setTab('active');
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

	const openEditor = (program: RankingProgram | null) => {
		setEditing(program);
		setEditorOpen(true);
	};

	const visible = byTab[tab];

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
						onClick={() => openEditor(null)}
					>
						{t('page.new')}
					</Button>
				</Group>

				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
					<StatCard
						title={t('kpis.active')}
						value={byTab.active.length}
						icon={<IconTrophy size={20} />}
						color='green'
					/>
					<StatCard
						title={t('kpis.inactive')}
						value={byTab.inactive.length}
						icon={<IconPlayerPause size={20} />}
					/>
					<StatCard
						title={t('kpis.completed')}
						value={byTab.completed.length}
						icon={<IconCheck size={20} />}
					/>
					<StatCard
						title={t('kpis.agents')}
						value={participantCount(byTab.active)}
						icon={<IconUsers size={20} />}
					/>
				</SimpleGrid>

				<Tabs value={tab} onChange={(value) => setTab(value as RankingTab)}>
					<Tabs.List>
						{RANKING_TABS.map((key) => (
							<Tabs.Tab
								key={key}
								value={key}
								rightSection={
									byTab[key].length > 0 ? (
										<Badge size='sm' variant='light' circle>
											{byTab[key].length}
										</Badge>
									) : undefined
								}
							>
								{t(`tabs.${key}`)}
							</Tabs.Tab>
						))}
					</Tabs.List>
				</Tabs>

				{visible.length === 0 ? (
					<EmptyState
						icon={<IconTrophy size={32} />}
						message={t(`empty.${tab}`)}
					/>
				) : (
					<SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing='lg'>
						{visible.map((program) => (
							<RankingProgramCard
								key={program.id}
								program={program}
								standings={standingsOf.get(program.id) ?? []}
								onView={() => setDetail(program)}
								onEdit={() => openEditor(program)}
								onDuplicate={() => {
									duplicateProgram(program.id);
									notifySuccess(t('editor.duplicated'));
									setTab('drafts');
								}}
								onToggleActive={(active) => toggleActive(program, active)}
								onSetDefault={() => {
									setDefaultProgram(program.id);
									notifySuccess(t('editor.defaultSet'));
								}}
								onEnd={() => {
									endProgram(program.id);
									notifySuccess(t('editor.ended'));
									setTab('completed');
								}}
								onDelete={() => deleteProgram(program.id)}
							/>
						))}
					</SimpleGrid>
				)}
			</Stack>

			<ProgramDetailDrawer
				program={detail}
				standings={detail ? (standingsOf.get(detail.id) ?? []) : []}
				opened={detail !== null}
				onClose={() => setDetail(null)}
			/>

			<RankingEditorDrawer
				opened={editorOpen}
				onClose={() => setEditorOpen(false)}
				role={role}
				program={editing}
			/>
		</ContentContainer>
	);
};

export default ManagerRankingsPage;
