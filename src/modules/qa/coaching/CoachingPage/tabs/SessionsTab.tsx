import { useMemo, useState } from 'react';
import {
	Badge,
	Button,
	Group,
	Select,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import {
	IconCheck,
	IconClock,
	IconPlus,
	IconUsersGroup,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import type {
	CoachingSessionRecord,
	CoachingSessionStatus,
	CoachingSessionType,
} from '~/models/qa';
import { AreaBadge } from '~/modules/qa/lms/components/Badges';
import { daysUntil } from '~/modules/qa/lms/helpers';
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import {
	SESSION_MODALITIES,
	SESSION_STATUSES,
	SESSION_STATUS_COLOR,
	SESSION_TYPES,
} from '../../constants';

const helper = createColumnHelper<CoachingSessionRecord>();

interface SessionsTabProps {
	sessions: CoachingSessionRecord[];
	agentTeam: Record<string, string>;
	agentSupervisor: Record<string, string>;
	role: TeamRole;
	onOpen: (sessionId: string) => void;
	onCreate: () => void;
}

export function SessionsTab({
	sessions,
	agentTeam,
	agentSupervisor,
	role,
	onOpen,
	onCreate,
}: SessionsTabProps) {
	const { t } = useTranslation('qa.coaching');
	const [view, setView] = useState<'upcoming' | 'past'>('upcoming');
	const [status, setStatus] = useState<string | null>(null);
	const [type, setType] = useState<string | null>(null);
	const [modality, setModality] = useState<string | null>(null);
	const [coach, setCoach] = useState<string | null>(null);
	const [team, setTeam] = useState<string | null>(null);

	const filtered = useMemo(
		() =>
			sessions.filter((s) => {
				if (status && s.status !== status) return false;
				if (type && s.type !== type) return false;
				if (coach && s.coachRole !== coach) return false;
				if (team && agentSupervisor[s.agentId] !== team) return false;
				return true;
			}),
		[sessions, status, type, modality, coach, team, agentSupervisor]
	);

	const upcoming = useMemo(
		() =>
			filtered
				.filter((s) => s.status === 'SCHEDULED')
				.sort((a, b) => a.date.localeCompare(b.date)),
		[filtered]
	);
	const thisWeek = upcoming.filter((s) => daysUntil(s.date) <= 7);
	const later = upcoming.filter((s) => daysUntil(s.date) > 7);
	const past = useMemo(
		() =>
			filtered
				.filter((s) => s.status !== 'SCHEDULED')
				.sort((a, b) => b.date.localeCompare(a.date)),
		[filtered]
	);

	const columns: BaseTableColumnDef<CoachingSessionRecord>[] = [
		helper.accessor('date', {
			header: t('sessions.columns.date'),
			cell: (info) => (
				<Text size='sm'>
					{dayjs(info.getValue()).format('D MMM YYYY HH:mm')}
				</Text>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('agentName', {
			header: t('sessions.columns.agent'),
			cell: (info) => (
				<Group gap={6} wrap='nowrap'>
					{info.row.original.type === 'GROUP' && (
						<ThemeIcon size='xs' variant='light' color='grape' radius='xl'>
							<IconUsersGroup size={10} />
						</ThemeIcon>
					)}
					<Stack gap={0}>
						<Text size='sm'>{info.getValue()}</Text>
						<Text size='xs' c='dimmed'>
							{agentTeam[info.row.original.agentId] ?? ''}
						</Text>
					</Stack>
				</Group>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('type', {
			header: t('sessions.columns.type'),
			cell: (info) => (
				<Group gap={4} wrap='nowrap'>
					<Badge size='xs' variant='outline'>
						{t(`sessions.types.${info.getValue()}`)}
					</Badge>
					{info.row.original.modality && (
						<Badge size='xs' variant='light' color='gray'>
							{t(`sessions.modality.${info.row.original.modality}`)}
						</Badge>
					)}
				</Group>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('topic', {
			header: t('sessions.columns.topic'),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.display({
			id: 'area',
			header: t('sessions.columns.area'),
			cell: (info) =>
				info.row.original.area ? (
					<AreaBadge
						area={info.row.original.area}
						subItem={info.row.original.subItem}
						size='xs'
					/>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('coachName', {
			header: t('sessions.columns.coach'),
			cell: (info) => (
				<Stack gap={0}>
					<Text size='sm'>{info.getValue()}</Text>
					<Text size='xs' c='dimmed'>
						{info.row.original.coachRole}
					</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('status', {
			header: t('sessions.columns.status'),
			cell: (info) => (
				<Badge
					size='xs'
					color={SESSION_STATUS_COLOR[info.getValue()]}
					variant='light'
				>
					{t(`sessions.status.${info.getValue()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.display({
			id: 'commitment',
			header: t('sessions.columns.commitment'),
			cell: (info) => {
				const s = info.row.original;
				if (s.status !== 'COMPLETED') {
					return (
						<Text size='sm' c='dimmed'>
							{t('sessions.commitment.none')}
						</Text>
					);
				}
				return s.agentCommitment.acknowledged ? (
					<Badge
						size='xs'
						color='green'
						variant='light'
						leftSection={<IconCheck size={10} />}
					>
						{t('sessions.commitment.acknowledged')}
					</Badge>
				) : (
					<Badge
						size='xs'
						color='gray'
						variant='light'
						leftSection={<IconClock size={10} />}
					>
						{t('sessions.commitment.pending')}
					</Badge>
				);
			},
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('followUpDate', {
			header: t('sessions.columns.followUp'),
			cell: (info) => <Text size='sm'>{info.getValue() ?? '—'}</Text>,
		}) as BaseTableColumnDef<CoachingSessionRecord>,
	];

	const filters = (
		<Group gap='sm' wrap='wrap'>
			<AppSegmentedControl
				size='sm'
				value={view}
				onChange={(v) => setView(v as 'upcoming' | 'past')}
				data={[
					{ label: t('sessions.filters.upcoming'), value: 'upcoming' },
					{ label: t('sessions.filters.past'), value: 'past' },
				]}
			/>
			<Select
				size='sm'
				placeholder={t('sessions.filters.status')}
				data={SESSION_STATUSES.map((s: CoachingSessionStatus) => ({
					value: s,
					label: t(`sessions.status.${s}`),
				}))}
				value={status}
				onChange={setStatus}
				clearable
				w={150}
			/>
			<Select
				size='sm'
				placeholder={t('sessions.filters.type')}
				data={[...SESSION_TYPES, 'AI_MESSAGE' as const].map(
					(s: CoachingSessionType) => ({
						value: s,
						label: t(`sessions.types.${s}`),
					})
				)}
				value={type}
				onChange={setType}
				clearable
				w={150}
			/>
			<Select
				size='sm'
				placeholder={t('sessions.filters.modality')}
				data={SESSION_MODALITIES.map((m) => ({
					value: m,
					label: t(`sessions.modality.${m}`),
				}))}
				value={modality}
				onChange={setModality}
				clearable
				w={150}
			/>
			<Select
				size='sm'
				placeholder={t('sessions.filters.coach')}
				data={[
					{ value: 'SUPERVISOR', label: t('rules.editor.coach.SUPERVISOR') },
					{ value: 'QA_MANAGER', label: t('rules.editor.coach.QA_MANAGER') },
				]}
				value={coach}
				onChange={setCoach}
				clearable
				w={150}
			/>
			{role === 'qa-manager' && (
				<Select
					size='sm'
					placeholder={t('sessions.filters.team')}
					data={TEAM_SUPERVISORS.map((s) => ({ value: s.id, label: s.team }))}
					value={team}
					onChange={setTeam}
					clearable
					w={140}
				/>
			)}
		</Group>
	);

	return (
		<Stack gap='md'>
			<SectionCard
				title={t('sessions.title')}
				description={t('sessions.description')}
				headerActions={
					<Button
						size='sm'
						leftSection={<IconPlus size={16} />}
						onClick={onCreate}
					>
						{t('newSession')}
					</Button>
				}
			>
				{filters}
			</SectionCard>

			{view === 'upcoming' ? (
				<>
					<SectionCard title={t('sessions.thisWeek')}>
						<BaseTable<CoachingSessionRecord>
							data={thisWeek}
							columns={columns}
							getRowId={(r) => r.id}
							density='compact'
							emptyMessage={t('sessions.empty')}
							onRowClick={(r) => onOpen(r.id)}
						/>
					</SectionCard>
					<SectionCard title={t('sessions.later')}>
						<BaseTable<CoachingSessionRecord>
							data={later}
							columns={columns}
							getRowId={(r) => r.id}
							density='compact'
							emptyMessage={t('sessions.empty')}
							onRowClick={(r) => onOpen(r.id)}
						/>
					</SectionCard>
				</>
			) : (
				<SectionCard title={t('sessions.past')}>
					<BaseTable<CoachingSessionRecord>
						data={past}
						columns={columns}
						getRowId={(r) => r.id}
						density='compact'
						enablePagination
						pageSize={12}
						showPaginationControls
						emptyMessage={t('sessions.empty')}
						onRowClick={(r) => onOpen(r.id)}
					/>
				</SectionCard>
			)}
		</Stack>
	);
}
