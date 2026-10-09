import { useMemo, useState } from 'react';
import {
	Badge,
	Button,
	Group,
	Popover,
	Select,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { createColumnHelper } from '@tanstack/react-table';
import {
	IconAdjustments,
	IconCalendarEvent,
	IconCheck,
	IconClock,
	IconSearch,
	IconUsersGroup,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
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
import { TODAY } from '~/modules/qa/analytics/constants';
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

/** Proposals live in the weekly batch until confirmed, so the history never lists them. */
const HISTORY_STATUSES = SESSION_STATUSES.filter(
	(s: CoachingSessionStatus) => s !== 'PROPOSED'
);

interface SessionsTabProps {
	sessions: CoachingSessionRecord[];
	agentTeam: Record<string, string>;
	agentSupervisor: Record<string, string>;
	role: TeamRole;
	onOpen: (sessionId: string) => void;
}

export function SessionsTab({
	sessions,
	agentTeam,
	agentSupervisor,
	role,
	onOpen,
}: SessionsTabProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const isNarrow = useMediaQuery('(max-width: 48em)');
	const [view, setView] = useState<SessionsView>('batch');
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<string | null>(null);
	const [type, setType] = useState<string | null>(null);
	const [modality, setModality] = useState<string | null>(null);
	const [coach, setCoach] = useState<string | null>(null);
	const [team, setTeam] = useState<string | null>(null);
	const [range, setRange] = useState<[string | null, string | null]>([
		null,
		null,
	]);

	const clearMoreFilters = () => {
		setModality(null);
		setCoach(null);
		setTeam(null);
	};

	/** History filters only make sense in the history view, so leaving it clears them. */
	const changeView = (next: SessionsView) => {
		setView(next);
		if (next === 'batch') {
			setSearch('');
			setStatus(null);
			setType(null);
			setRange([null, null]);
			clearMoreFilters();
		}
	};

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		return sessions.filter((s) => {
			if (s.status === 'PROPOSED') return false;
			if (
				query &&
				!s.agentName.toLowerCase().includes(query) &&
				!s.topic.toLowerCase().includes(query)
			)
				return false;
			if (status && s.status !== status) return false;
			if (type && s.type !== type) return false;
			if (modality && s.modality !== modality) return false;
			const day = s.date.slice(0, 10);
			if (range[0] && day < range[0]) return false;
			if (range[1] && day > range[1]) return false;
			if (coach && s.coachRole !== coach) return false;
			if (team && agentSupervisor[s.agentId] !== team) return false;
			return true;
		});
	}, [
		sessions,
		search,
		status,
		type,
		modality,
		range,
		coach,
		team,
		agentSupervisor,
	]);

	// Every session that is not a proposal, newest first. Upcoming ones are here too.
	const history = useMemo(
		() => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
		[filtered]
	);

	// The calendar shows every confirmed session of the scope; proposals stay in the weekly batch.
	const calendarSessions = useMemo(
		() => sessions.filter((s) => s.status !== 'PROPOSED'),
		[sessions]
	);

	// Upcoming meetings of the current week; AI messages are not meetings, so they are not counted.
	const thisWeekCount = useMemo(() => {
		const from = dayjs(TODAY).startOf('week').format('YYYY-MM-DD');
		const to = dayjs(TODAY).endOf('week').format('YYYY-MM-DD');
		return calendarSessions.filter((s) => {
			const day = s.date.slice(0, 10);
			return (
				s.status === 'SCHEDULED' &&
				s.type !== 'AI_MESSAGE' &&
				day >= from &&
				day <= to
			);
		}).length;
	}, [calendarSessions]);

	const activeMoreFilters = [modality, coach, team].filter(Boolean).length;

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
			cell: (info) => {
				const { area, subItem } = info.row.original;
				return (
					<Stack gap={0}>
						<Text size='sm'>{info.getValue()}</Text>
						{area && (
							<Text size='xs' c='dimmed'>
								{t(LMS_AREA_META[area].labelKey, { ns: 'qa.lms' })}
								{subItem
									? ` · ${t(`subItems.${subItem}`, { ns: 'qa.lms' })}`
									: ''}
							</Text>
						)}
					</Stack>
				);
			},
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		...(role === 'qa-manager'
			? [
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
				]
			: []),
		helper.accessor('status', {
			header: t('sessions.columns.status'),
			cell: (info) => {
				const badge = sessionStatusBadge(info.getValue());
				const { followUpDate } = info.row.original;
				return (
					<Stack gap={2} align='flex-start'>
						<Badge size='xs' variant={badge.variant} color={badge.color}>
							{t(`sessions.status.${info.getValue()}`)}
						</Badge>
						{followUpDate && (
							<Text size='xs' c='dimmed'>
								{t('sessions.columns.followUp')}{' '}
								{dayjs(followUpDate).format('D MMM')}
							</Text>
						)}
					</Stack>
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
	];

	return (
		<Stack gap='md'>
			<Group justify='space-between' align='center' wrap='wrap' gap='sm'>
				<AppSegmentedControl
					size='sm'
					value={view}
					onChange={(v) => changeView(v as SessionsView)}
					data={[
						{ label: t('sessions.filters.batch'), value: 'batch' },
						{ label: t('sessions.filters.history'), value: 'history' },
					]}
				/>
				<Button
					variant='default'
					size='sm'
					leftSection={<IconCalendarEvent size={16} />}
					onClick={() => setCalendarOpen(true)}
				>
					{t('sessions.calendar.open', { count: thisWeekCount })}
				</Button>
			</Group>

			{view === 'batch' ? (
				<WeeklyBatchPanel
					role={role}
					sessions={sessions}
					agentTeam={agentTeam}
					onOpen={onOpen}
				/>
			) : (
				<SectionCard title={t('sessions.history.title')}>
					<Stack gap='md'>
						<Group gap='sm' wrap='wrap'>
							<TextInput
								size='sm'
								w={240}
								aria-label={t('sessions.filters.search')}
								placeholder={t('sessions.filters.search')}
								leftSection={<IconSearch size={16} />}
								value={search}
								onChange={(e) => setSearch(e.currentTarget.value)}
							/>
							<DatePickerInput
								type='range'
								size='sm'
								placeholder={t('sessions.filters.dateRange')}
								value={range}
								onChange={(value) =>
									setRange(value as [string | null, string | null])
								}
								clearable
								w={250}
							/>
							<Select
								size='sm'
								placeholder={t('sessions.filters.status')}
								data={HISTORY_STATUSES.map((s: CoachingSessionStatus) => ({
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
							<Popover position='bottom-start' shadow='md' withArrow>
								<Popover.Target>
									<Button
										variant='default'
										size='sm'
										leftSection={<IconAdjustments size={16} />}
									>
										{t('sessions.filters.more')}
										{activeMoreFilters > 0 ? ` (${activeMoreFilters})` : ''}
									</Button>
								</Popover.Target>
								<Popover.Dropdown>
									<Stack gap='sm' w={220}>
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
											comboboxProps={{ withinPortal: false }}
										/>
										<Select
											size='sm'
											placeholder={t('sessions.filters.coach')}
											data={[
												{
													value: 'SUPERVISOR',
													label: t('rules.editor.coach.SUPERVISOR'),
												},
												{
													value: 'QA_MANAGER',
													label: t('rules.editor.coach.QA_MANAGER'),
												},
											]}
											value={coach}
											onChange={setCoach}
											clearable
											comboboxProps={{ withinPortal: false }}
										/>
										{role === 'qa-manager' && (
											<Select
												size='sm'
												placeholder={t('sessions.filters.team')}
												data={TEAM_SUPERVISORS.map((s) => ({
													value: s.id,
													label: s.team,
												}))}
												value={team}
												onChange={setTeam}
												clearable
												comboboxProps={{ withinPortal: false }}
											/>
										)}
										{activeMoreFilters > 0 && (
											<Button
												size='compact-sm'
												variant='subtle'
												onClick={clearMoreFilters}
											>
												{t('sessions.filters.clear')}
											</Button>
										)}
									</Stack>
								</Popover.Dropdown>
							</Popover>
						</Group>

						<BaseTable<CoachingSessionRecord>
							data={history}
							columns={columns}
							getRowId={(r) => r.id}
							density='compact'
							enablePagination
							pageSize={12}
							showPaginationControls
							emptyMessage={t('sessions.empty')}
							onRowClick={(r) => onOpen(r.id)}
						/>
					</Stack>
				</SectionCard>
			)}

			<AppDrawer
				opened={calendarOpen}
				onClose={() => setCalendarOpen(false)}
				size={isNarrow ? '100%' : '75%'}
				title={t('sessions.calendar.title')}
				description={t('sessions.calendar.description')}
				icon={<IconCalendarEvent size={18} />}
			>
				<SessionsCalendar
					sessions={calendarSessions}
					onOpen={(id) => {
						setCalendarOpen(false);
						onOpen(id);
					}}
				/>
			</AppDrawer>
		</Stack>
	);
}
