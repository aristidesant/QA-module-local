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
import { DatePickerInput } from '@mantine/dates';
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
import { LMS_AREA_META } from '~/modules/qa/lms/constants';
import { WeeklyBatchPanel } from '../../components/WeeklyBatchPanel';
import { SessionsCalendar } from './SessionsCalendar';
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import {
	SESSION_MODALITIES,
	SESSION_STATUSES,
	sessionStatusBadge,
	SESSION_TYPES,
} from '../../constants';

const helper = createColumnHelper<CoachingSessionRecord>();

type SessionsView = 'batch' | 'history';

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
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const [view, setView] = useState<SessionsView>('batch');
	const [status, setStatus] = useState<string | null>(null);
	const [type, setType] = useState<string | null>(null);
	const [modality, setModality] = useState<string | null>(null);
	const [coach, setCoach] = useState<string | null>(null);
	const [team, setTeam] = useState<string | null>(null);
	const [agent, setAgent] = useState<string | null>(null);
	const [topic, setTopic] = useState<string | null>(null);
	const [range, setRange] = useState<[string | null, string | null]>([
		null,
		null,
	]);

	// One option per agent with their own sessions (group sessions belong to a learning group).
	const agentOptions = useMemo(() => {
		const byId = new Map<string, string>();
		for (const s of sessions)
			if (s.type !== 'GROUP') byId.set(s.agentId, s.agentName);
		return [...byId.entries()]
			.map(([value, label]) => ({ value, label }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [sessions]);

	const topicOptions = useMemo(
		() => [...new Set(sessions.map((s) => s.topic))].sort(),
		[sessions]
	);

	const filtered = useMemo(
		() =>
			sessions.filter((s) => {
				if (status && s.status !== status) return false;
				if (type && s.type !== type) return false;
				if (modality && s.modality !== modality) return false;
				if (agent && (s.type === 'GROUP' || s.agentId !== agent)) return false;
				if (topic && s.topic !== topic) return false;
				const day = s.date.slice(0, 10);
				if (range[0] && day < range[0]) return false;
				if (range[1] && day > range[1]) return false;
				if (coach && s.coachRole !== coach) return false;
				if (team && agentSupervisor[s.agentId] !== team) return false;
				return true;
			}),
		[
			sessions,
			status,
			type,
			modality,
			agent,
			topic,
			range,
			coach,
			team,
			agentSupervisor,
		]
	);

	// Proposed sessions live in the weekly batch view until the supervisor schedules them.
	const visible = useMemo(
		() => filtered.filter((s) => s.status !== 'PROPOSED'),
		[filtered]
	);

	// The calendar shows every confirmed session of the scope; proposals stay in the weekly batch.
	const calendarSessions = useMemo(
		() => sessions.filter((s) => s.status !== 'PROPOSED'),
		[sessions]
	);

	const past = useMemo(
		() =>
			visible
				.filter((s) => s.status !== 'SCHEDULED')
				.sort((a, b) => b.date.localeCompare(a.date)),
		[visible]
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
						<ThemeIcon size='xs' variant='light' color='gray' radius='xl'>
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
				<Stack gap={0}>
					<Text size='sm'>{t(`sessions.types.${info.getValue()}`)}</Text>
					{info.row.original.modality && (
						<Text size='xs' c='dimmed'>
							{t(`sessions.modality.${info.row.original.modality}`)}
						</Text>
					)}
				</Stack>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('topic', {
			header: t('sessions.columns.topic'),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.display({
			id: 'area',
			header: t('sessions.columns.area'),
			cell: (info) => {
				const { area, subItem } = info.row.original;
				return area ? (
					<Stack gap={0}>
						<Text size='sm'>
							{t(LMS_AREA_META[area].labelKey, { ns: 'qa.lms' })}
						</Text>
						{subItem && (
							<Text size='xs' c='dimmed'>
								{t(`subItems.${subItem}`, { ns: 'qa.lms' })}
							</Text>
						)}
					</Stack>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				);
			},
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
			cell: (info) => {
				const badge = sessionStatusBadge(info.getValue());
				return (
					<Badge size='xs' variant={badge.variant} color={badge.color}>
						{t(`sessions.status.${info.getValue()}`)}
					</Badge>
				);
			},
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
					<Group gap={4} wrap='nowrap'>
						<IconCheck size={12} />
						<Text size='sm'>{t('sessions.commitment.acknowledged')}</Text>
					</Group>
				) : (
					<Group gap={4} wrap='nowrap' c='dimmed'>
						<IconClock size={12} />
						<Text size='sm'>{t('sessions.commitment.pending')}</Text>
					</Group>
				);
			},
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('followUpDate', {
			header: t('sessions.columns.followUp'),
			cell: (info) => <Text size='sm'>{info.getValue() ?? '—'}</Text>,
		}) as BaseTableColumnDef<CoachingSessionRecord>,
	];

	const segmented = (
		<AppSegmentedControl
			size='sm'
			value={view}
			onChange={(v) => setView(v as SessionsView)}
			data={[
				{ label: t('sessions.filters.batch'), value: 'batch' },
				{ label: t('sessions.filters.history'), value: 'history' },
			]}
		/>
	);

	const filters = (
		<Group gap='sm' wrap='wrap'>
			{segmented}
			<Select
				size='sm'
				placeholder={t('sessions.filters.agent')}
				data={agentOptions}
				value={agent}
				onChange={setAgent}
				clearable
				searchable
				w={200}
			/>
			<Select
				size='sm'
				placeholder={t('sessions.filters.topic')}
				data={topicOptions}
				value={topic}
				onChange={setTopic}
				clearable
				searchable
				w={200}
			/>
			<DatePickerInput
				type='range'
				size='sm'
				placeholder={t('sessions.filters.dateRange')}
				value={range}
				onChange={(value) => setRange(value as [string | null, string | null])}
				clearable
				w={250}
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
				{view === 'batch' ? segmented : filters}
			</SectionCard>

			{view === 'batch' ? (
				<>
					<WeeklyBatchPanel
						role={role}
						sessions={sessions}
						agentTeam={agentTeam}
						onOpen={onOpen}
					/>
					<SectionCard
						title={t('sessions.calendar.title')}
						description={t('sessions.calendar.description')}
					>
						<SessionsCalendar sessions={calendarSessions} onOpen={onOpen} />
					</SectionCard>
				</>
			) : (
				<SectionCard
					title={t('sessions.history.title')}
					description={t('sessions.history.description')}
				>
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
