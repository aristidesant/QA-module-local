import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import {
	ActionIcon,
	Button,
	Group,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconChartBar,
	IconPlus,
	IconSearch,
	IconUserOff,
	IconUsers,
	IconUsersGroup,
	IconX,
} from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import StatCard from '~/components/StatCard';
import {
	selectProfiles,
	selectSupervisors,
	useTeamStore,
} from '~/stores/qa/teamStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { UNASSIGNED_SUPERVISOR, UNASSIGNED_SUPERVISOR_ID } from '../constants';
import type { RosterAgent } from '../types';
import { EditSupervisorModal } from '../TeamDetailPage/EditSupervisorModal';
import type { MoveTarget } from './components/AgentCard';
import { NewTeamDrawer } from './components/NewTeamDrawer';
import { RenameTeamModal } from './components/RenameTeamModal';
import { TeamColumn } from './components/TeamColumn';
import styles from './TeamConfigPage.module.css';

/**
 * Team configuration for the Operation Manager: create teams with their supervisor,
 * rename or dissolve them, and move agents between teams and the Unassigned pool
 * by dragging (or from each card's menu).
 */
export default function TeamConfigPage() {
	const { t } = useTranslation('qa.team');
	const supervisors = useTeamStore(selectSupervisors);
	const profiles = useTeamStore(selectProfiles);
	const addMembers = useTeamStore((s) => s.addMembers);
	const removeMember = useTeamStore((s) => s.removeMember);
	const dissolveTeam = useTeamStore((s) => s.dissolveTeam);

	const [search, setSearch] = useState('');
	const [newTeamOpened, setNewTeamOpened] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [renamingId, setRenamingId] = useState<string | null>(null);

	const supervisorList = useMemo(
		() => Object.values(supervisors),
		[supervisors]
	);
	const agents = useMemo(
		() =>
			Object.values(profiles)
				.map((p) => p.agent)
				.sort((a, b) => a.name.localeCompare(b.name)),
		[profiles]
	);

	/** Every agent by team (including the Unassigned pool), the total and the search-filtered view. */
	const { totals, visible } = useMemo(() => {
		const query = search.trim().toLowerCase();
		const totals: Record<string, number> = {};
		const visible: Record<string, RosterAgent[]> = {};
		for (const agent of agents) {
			totals[agent.supervisorId] = (totals[agent.supervisorId] ?? 0) + 1;
			const matches =
				!query ||
				agent.name.toLowerCase().includes(query) ||
				agent.id.toLowerCase().includes(query);
			if (matches) {
				visible[agent.supervisorId] = [
					...(visible[agent.supervisorId] ?? []),
					agent,
				];
			}
		}
		return { totals, visible };
	}, [agents, search]);

	const unassignedCount = totals[UNASSIGNED_SUPERVISOR_ID] ?? 0;
	const assignedCount = agents.length - unassignedCount;
	const teamCount = supervisorList.length;

	const targets: MoveTarget[] = useMemo(
		() => [
			{ id: UNASSIGNED_SUPERVISOR_ID, label: t('teamConfig.board.unassigned') },
			...supervisorList.map((s) => ({ id: s.id, label: s.team })),
		],
		[supervisorList, t]
	);

	const moveAgent = (agentId: string, targetId: string) => {
		const agent = profiles[agentId]?.agent;
		if (!agent) return;
		if (targetId === UNASSIGNED_SUPERVISOR_ID) removeMember(agentId);
		else addMembers([agentId], targetId);
		const teamLabel =
			targets.find((target) => target.id === targetId)?.label ?? '';
		notifySuccess(
			t('teamConfig.toast.moved', { name: agent.name, team: teamLabel })
		);
	};

	const handleDragEnd = ({ draggableId, source, destination }: DropResult) => {
		if (!destination || destination.droppableId === source.droppableId) return;
		moveAgent(
			draggableId.replace('agent:', ''),
			destination.droppableId.replace('team:', '')
		);
	};

	const confirmDissolve = (supervisorId: string) => {
		const supervisor = supervisors[supervisorId];
		if (!supervisor) return;
		const count = totals[supervisorId] ?? 0;
		modals.openConfirmModal({
			title: t('teamConfig.dissolve.title', { team: supervisor.team }),
			children: (
				<Text size='sm'>{t('teamConfig.dissolve.body', { count })}</Text>
			),
			labels: {
				confirm: t('teamConfig.dissolve.confirm'),
				cancel: t('modals.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => {
				dissolveTeam(supervisorId);
				notifySuccess(
					t('teamConfig.toast.dissolved', { team: supervisor.team })
				);
			},
		});
	};

	const editing = editingId ? supervisors[editingId] : undefined;
	const renaming = renamingId ? (supervisors[renamingId] ?? null) : null;

	return (
		<ContentContainer
			contentWidth='full'
			title={t('teamConfig.title')}
			description={t('teamConfig.description')}
			titleRight={
				<Button
					size='sm'
					leftSection={<IconPlus size={16} />}
					onClick={() => setNewTeamOpened(true)}
				>
					{t('teamConfig.newTeam')}
				</Button>
			}
		>
			<Stack gap='md'>
				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
					<StatCard
						variant='compact'
						title={t('teamConfig.kpis.teams')}
						value={teamCount}
						icon={<IconUsersGroup size={18} />}
					/>
					<StatCard
						variant='compact'
						title={t('teamConfig.kpis.agents')}
						value={assignedCount}
						icon={<IconUsers size={18} />}
					/>
					<StatCard
						variant='compact'
						title={t('teamConfig.kpis.unassigned')}
						value={unassignedCount}
						color={unassignedCount > 0 ? 'amber' : undefined}
						icon={<IconUserOff size={18} />}
					/>
					<StatCard
						variant='compact'
						title={t('teamConfig.kpis.avgSize')}
						value={
							teamCount === 0 ? '—' : (assignedCount / teamCount).toFixed(1)
						}
						icon={<IconChartBar size={18} />}
					/>
				</SimpleGrid>

				<Group justify='flex-end'>
					<TextInput
						size='sm'
						w={260}
						placeholder={t('teamConfig.search')}
						aria-label={t('teamConfig.search')}
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(event) => setSearch(event.currentTarget.value)}
						rightSection={
							search && (
								<ActionIcon
									size='sm'
									color='gray'
									variant='transparent'
									aria-label={t('teamConfig.clearSearch')}
									onClick={() => setSearch('')}
								>
									<IconX size={14} />
								</ActionIcon>
							)
						}
					/>
				</Group>

				{teamCount === 0 && unassignedCount === 0 ? (
					<EmptyState
						icon={<IconUsersGroup size={40} />}
						message={t('teamConfig.empty.title')}
						description={t('teamConfig.empty.description')}
						action={
							<Button
								size='sm'
								leftSection={<IconPlus size={16} />}
								onClick={() => setNewTeamOpened(true)}
							>
								{t('teamConfig.newTeam')}
							</Button>
						}
					/>
				) : (
					<DragDropContext onDragEnd={handleDragEnd}>
						<div className={styles.board}>
							<TeamColumn
								supervisor={UNASSIGNED_SUPERVISOR}
								variant='unassigned'
								agents={visible[UNASSIGNED_SUPERVISOR_ID] ?? []}
								memberCount={unassignedCount}
								targets={targets}
								onMove={moveAgent}
							/>
							{supervisorList.map((supervisor) => (
								<TeamColumn
									key={supervisor.id}
									supervisor={supervisor}
									agents={visible[supervisor.id] ?? []}
									memberCount={totals[supervisor.id] ?? 0}
									targets={targets}
									onMove={moveAgent}
									onEditSupervisor={() => setEditingId(supervisor.id)}
									onRename={() => setRenamingId(supervisor.id)}
									onDissolve={() => confirmDissolve(supervisor.id)}
								/>
							))}
						</div>
					</DragDropContext>
				)}
			</Stack>

			<NewTeamDrawer
				opened={newTeamOpened}
				onClose={() => setNewTeamOpened(false)}
			/>
			{editing && (
				<EditSupervisorModal
					opened
					onClose={() => setEditingId(null)}
					supervisor={editing}
				/>
			)}
			<RenameTeamModal
				supervisor={renaming}
				onClose={() => setRenamingId(null)}
			/>
		</ContentContainer>
	);
}
