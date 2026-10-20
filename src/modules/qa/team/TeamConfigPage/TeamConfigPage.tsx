import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SimpleGrid, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconChartBar,
	IconPlus,
	IconUserOff,
	IconUsers,
	IconUsersGroup,
} from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable/BaseTable';
import { ContentContainer } from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import StatCard from '~/components/StatCard';
import {
	selectProfiles,
	selectSupervisors,
	useTeamStore,
} from '~/stores/qa/teamStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { UNASSIGNED_SUPERVISOR, UNASSIGNED_SUPERVISOR_ID } from '../constants';
import type { AgentStatus, RosterAgent } from '../types';
import { AddMembersDrawer } from '../TeamDetailPage/AddMembersDrawer';
import { EditSupervisorModal } from '../TeamDetailPage/EditSupervisorModal';
import { EditTeamModal } from './components/EditTeamModal';
import {
	DEFAULT_MEMBER_FILTERS,
	MembersToolbar,
	type MemberFilters,
} from './components/MembersToolbar';
import type { MoveTarget } from './components/MoveToMenu';
import { NewTeamDrawer } from './components/NewTeamDrawer';
import { SelectionBar } from './components/SelectionBar';
import { TeamHeader } from './components/TeamHeader';
import { TeamRail } from './components/TeamRail';
import { useMemberColumns } from './components/useMemberColumns';
import styles from './TeamConfigPage.module.css';

/**
 * Team configuration for the Operation Manager: a teams rail on the left and, for the
 * selected team, its header and a filterable members table. Agents move between teams
 * from each row's menu or in bulk from the selection bar.
 */
export default function TeamConfigPage() {
	const { t } = useTranslation('qa.team');
	const supervisors = useTeamStore(selectSupervisors);
	const profiles = useTeamStore(selectProfiles);
	const addMembers = useTeamStore((s) => s.addMembers);
	const removeMember = useTeamStore((s) => s.removeMember);
	const dissolveTeam = useTeamStore((s) => s.dissolveTeam);
	const setAgentStatus = useTeamStore((s) => s.setAgentStatus);
	const setSupervisorStatus = useTeamStore((s) => s.setSupervisorStatus);

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
	const totals = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const agent of agents) {
			counts[agent.supervisorId] = (counts[agent.supervisorId] ?? 0) + 1;
		}
		return counts;
	}, [agents]);

	const [selectedTeamId, setSelectedTeamId] = useState<string>(
		supervisorList[0]?.id ?? UNASSIGNED_SUPERVISOR_ID
	);
	const [filters, setFilters] = useState<MemberFilters>(DEFAULT_MEMBER_FILTERS);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [newTeamOpened, setNewTeamOpened] = useState(false);
	const [addAgentsOpened, setAddAgentsOpened] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

	// A dissolved team's agents land in Unassigned, so follow them there.
	useEffect(() => {
		if (
			selectedTeamId !== UNASSIGNED_SUPERVISOR_ID &&
			!supervisors[selectedTeamId]
		) {
			setSelectedTeamId(UNASSIGNED_SUPERVISOR_ID);
		}
	}, [supervisors, selectedTeamId]);

	const isUnassignedSelected = selectedTeamId === UNASSIGNED_SUPERVISOR_ID;
	const selectedTeam = isUnassignedSelected
		? UNASSIGNED_SUPERVISOR
		: supervisors[selectedTeamId];

	const unassignedCount = totals[UNASSIGNED_SUPERVISOR_ID] ?? 0;
	const assignedCount = agents.length - unassignedCount;
	const teamCount = supervisorList.length;

	const selectTeam = (id: string) => {
		setSelectedTeamId(id);
		setSelectedIds([]);
		setFilters(DEFAULT_MEMBER_FILTERS);
	};

	const members = useMemo(
		() => agents.filter((a) => a.supervisorId === selectedTeamId),
		[agents, selectedTeamId]
	);
	const visibleMembers = useMemo(() => {
		const query = filters.search.trim().toLowerCase();
		return members.filter(
			(a) =>
				(!query ||
					a.name.toLowerCase().includes(query) ||
					a.id.toLowerCase().includes(query) ||
					a.email.toLowerCase().includes(query)) &&
				(filters.status === 'all' || a.status === filters.status)
		);
	}, [members, filters]);

	const targets: MoveTarget[] = useMemo(
		() => [
			{ id: UNASSIGNED_SUPERVISOR_ID, label: t('teamConfig.rail.unassigned') },
			...supervisorList.map((s) => ({ id: s.id, label: s.team })),
		],
		[supervisorList, t]
	);

	const moveAgents = (agentIds: string[], targetId: string) => {
		if (agentIds.length === 0) return;
		if (targetId === UNASSIGNED_SUPERVISOR_ID) agentIds.forEach(removeMember);
		else addMembers(agentIds, targetId);
		const team = targets.find((target) => target.id === targetId)?.label ?? '';
		const name = profiles[agentIds[0]]?.agent.name ?? '';
		notifySuccess(
			agentIds.length === 1
				? t('teamConfig.toast.moved', { name, team })
				: t('teamConfig.toast.movedMany', { count: agentIds.length, team })
		);
		setSelectedIds([]);
	};

	const changeAgentStatus = (agentId: string, status: AgentStatus) => {
		setAgentStatus(agentId, status);
		notifySuccess(
			t('teamConfig.toast.statusChanged', {
				name: profiles[agentId]?.agent.name ?? '',
				status: t(`status.${status}`),
			})
		);
	};

	const changeSupervisorStatus = (
		supervisorId: string,
		status: AgentStatus
	) => {
		setSupervisorStatus(supervisorId, status);
		notifySuccess(
			t('teamConfig.toast.statusChanged', {
				name: supervisors[supervisorId]?.name ?? '',
				status: t(`status.${status}`),
			})
		);
	};

	const columns = useMemberColumns(
		t,
		targets,
		selectedTeamId,
		(agentId, targetId) => moveAgents([agentId], targetId),
		changeAgentStatus
	);

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
	const editingTeam = editingTeamId
		? (supervisors[editingTeamId] ?? null)
		: null;

	const emptyMessage =
		members.length === 0
			? t(
					isUnassignedSelected
						? 'teamConfig.members.emptyUnassigned'
						: 'teamConfig.members.empty'
				)
			: t('teamConfig.members.emptyFiltered');

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
					<div className={styles.layout}>
						<TeamRail
							supervisors={supervisorList}
							totals={totals}
							agents={agents}
							selectedId={selectedTeamId}
							onSelect={selectTeam}
						/>
						<Stack gap='md' className={styles.detail}>
							{selectedTeam && (
								<TeamHeader
									supervisor={selectedTeam}
									variant={isUnassignedSelected ? 'unassigned' : 'team'}
									onEditSupervisor={() => setEditingId(selectedTeamId)}
									onSupervisorStatusChange={(status) =>
										changeSupervisorStatus(selectedTeamId, status)
									}
									onEditTeam={() => setEditingTeamId(selectedTeamId)}
									onDissolve={() => confirmDissolve(selectedTeamId)}
								/>
							)}
							<SectionCard
								title={t('teamConfig.members.title')}
								headerActions={
									!isUnassignedSelected && (
										<Button
											size='xs'
											variant='default'
											leftSection={<IconPlus size={14} />}
											onClick={() => setAddAgentsOpened(true)}
										>
											{t('teamConfig.members.addAgents')}
										</Button>
									)
								}
							>
								<Stack gap='sm'>
									<MembersToolbar
										value={filters}
										onChange={setFilters}
										shown={visibleMembers.length}
										total={members.length}
									/>
									<SelectionBar
										count={selectedIds.length}
										targets={targets}
										currentTargetId={selectedTeamId}
										onMove={(targetId) => moveAgents(selectedIds, targetId)}
										onClear={() => setSelectedIds([])}
									/>
									<BaseTable<RosterAgent>
										data={visibleMembers}
										columns={columns}
										getRowId={(agent) => agent.id}
										enableRowSelection
										selectedRowIds={selectedIds}
										onSelectedRowIdsChange={setSelectedIds}
										enablePagination
										showPaginationControls
										pageSize={25}
										density='compact'
										emptyMessage={emptyMessage}
										getRowClassName={() => styles.memberRow}
									/>
								</Stack>
							</SectionCard>
						</Stack>
					</div>
				)}
			</Stack>

			<NewTeamDrawer
				opened={newTeamOpened}
				onClose={() => setNewTeamOpened(false)}
				onCreated={(supervisor) => selectTeam(supervisor.id)}
			/>
			{!isUnassignedSelected && selectedTeam && (
				<AddMembersDrawer
					opened={addAgentsOpened}
					onClose={() => setAddAgentsOpened(false)}
					supervisorId={selectedTeamId}
					teamName={selectedTeam.team}
				/>
			)}
			{editing && (
				<EditSupervisorModal
					opened
					onClose={() => setEditingId(null)}
					supervisor={editing}
				/>
			)}
			<EditTeamModal
				supervisor={editingTeam}
				onClose={() => setEditingTeamId(null)}
			/>
		</ContentContainer>
	);
}
