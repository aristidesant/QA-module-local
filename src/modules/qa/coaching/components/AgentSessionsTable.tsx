import { useMemo, useState } from 'react';
import { Badge, Button, Group, Select, Stack, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { CoachingSessionRecord } from '~/models/qa';
import type { TeamRole } from '~/modules/qa/team/types';
import { AreaBadge } from '~/modules/qa/lms/components/Badges';
import { SESSION_STATUS_COLOR } from '../constants';

const helper = createColumnHelper<CoachingSessionRecord>();

type DateRange = [string | null, string | null];

interface AgentSessionsTableProps {
	sessions: CoachingSessionRecord[];
	/** The viewer: their own sessions read "You", the other role's read by role. */
	role: TeamRole;
	onOpenSession: (sessionId: string) => void;
}

/** One agent's coaching sessions as a table, filterable by period and by topic covered. */
export function AgentSessionsTable({
	sessions,
	role,
	onOpenSession,
}: AgentSessionsTableProps) {
	const { t } = useTranslation('qa.coaching');
	const [range, setRange] = useState<DateRange>([null, null]);
	const [topic, setTopic] = useState<string | null>(null);

	const topicOptions = useMemo(
		() => [...new Set(sessions.map((s) => s.topic))].sort(),
		[sessions]
	);

	const filtered = useMemo(() => {
		const [from, to] = range;
		return sessions.filter((s) => {
			const day = s.date.slice(0, 10);
			if (from && day < from) return false;
			if (to && day > to) return false;
			if (topic && s.topic !== topic) return false;
			return true;
		});
	}, [sessions, range, topic]);

	const hasFilters = range[0] !== null || range[1] !== null || topic !== null;

	const columns: BaseTableColumnDef<CoachingSessionRecord>[] = [
		helper.accessor('date', {
			header: t('sessions.columns.date'),
			cell: (info) => (
				<Text size='sm'>
					{dayjs(info.getValue()).format('D MMM YYYY HH:mm')}
				</Text>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('topic', {
			header: t('sessions.columns.topic'),
			cell: (info) => (
				<Text size='sm' fw={500}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.display({
			id: 'area',
			header: t('sessions.columns.area'),
			cell: (info) =>
				info.row.original.area ? (
					<AreaBadge area={info.row.original.area} size='xs' />
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
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
		helper.accessor('coachName', {
			header: t('sessions.columns.coach'),
			cell: (info) => {
				const session = info.row.original;
				const isMine =
					session.coachRole ===
					(role === 'qa-manager' ? 'QA_MANAGER' : 'SUPERVISOR');
				return (
					<Stack gap={0}>
						<Text size='sm'>
							{isMine
								? t('sessions.coach.you')
								: t(`rules.editor.coach.${session.coachRole}`)}
						</Text>
						{!isMine && (
							<Text size='xs' c='dimmed'>
								{info.getValue()}
							</Text>
						)}
					</Stack>
				);
			},
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
	];

	return (
		<Stack gap='md'>
			<Group gap='sm' wrap='wrap' align='flex-end'>
				<DatePickerInput
					type='range'
					size='sm'
					label={t('agents.sessionsTable.period')}
					placeholder={t('agents.sessionsTable.periodPlaceholder')}
					value={range}
					onChange={(value) => setRange(value as DateRange)}
					clearable
					w={280}
				/>
				<Select
					size='sm'
					label={t('agents.sessionsTable.topic')}
					placeholder={t('agents.sessionsTable.topicPlaceholder')}
					data={topicOptions}
					value={topic}
					onChange={setTopic}
					clearable
					searchable
					w={260}
				/>
				{hasFilters && (
					<Button
						size='sm'
						variant='subtle'
						onClick={() => {
							setRange([null, null]);
							setTopic(null);
						}}
					>
						{t('agents.filters.clear')}
					</Button>
				)}
			</Group>
			<BaseTable<CoachingSessionRecord>
				data={filtered}
				columns={columns}
				getRowId={(r) => r.id}
				density='compact'
				enablePagination
				pageSize={10}
				showPaginationControls
				emptyMessage={
					sessions.length === 0
						? t('agents.drawer.noSessions')
						: t('agents.sessionsTable.noMatches')
				}
				onRowClick={(r) => onOpenSession(r.id)}
			/>
		</Stack>
	);
}
