import { useMemo, useState } from 'react';
import { Badge, Group, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconHistory } from '@tabler/icons-react';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingSessionRecord } from '~/models/qa';
import { TODAY } from '~/modules/qa/analytics/constants';
import { AreaMark } from '~/modules/qa/lms/components/AreaMark';
import { ImpactBadge } from '../components/ImpactBadge';
import { SESSION_STATUS_COLOR } from '../constants';
import {
	summarizeSessionImpacts,
	type SessionImpactRow,
} from '../postCoaching';

const helper = createColumnHelper<CoachingSessionRecord>();

type DateRange = [string | null, string | null];

interface SessionHistoryTableProps {
	sessions: CoachingSessionRecord[];
	impacts: SessionImpactRow[];
	onOpen: (session: CoachingSessionRecord) => void;
}

/** Every coach-led session that already happened (or was missed), newest first, filterable by period. */
export function SessionHistoryTable({
	sessions,
	impacts,
	onOpen,
}: SessionHistoryTableProps) {
	const { t } = useTranslation('qa.lms');
	const [range, setRange] = useState<DateRange>([null, null]);

	const summary = summarizeSessionImpacts(impacts)[0];
	const impactSummary =
		summary.measured === 0
			? t('agent.coaching.history.impactSummaryNone')
			: t('agent.coaching.history.impactSummary', {
					improved: summary.improved,
					measured: summary.measured,
				});

	const filtered = useMemo(() => {
		const [from, to] = range;
		return sessions.filter((s) => {
			const day = s.date.slice(0, 10);
			if (from && day < from) return false;
			if (to && day > to) return false;
			return true;
		});
	}, [sessions, range]);

	const columns: BaseTableColumnDef<CoachingSessionRecord>[] = [
		helper.accessor('date', {
			header: t('agent.coaching.history.columns.date'),
			cell: (info) => (
				<Text size='sm'>{dayjs(info.getValue()).format('D MMM YYYY')}</Text>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('topic', {
			header: t('agent.coaching.history.columns.topic'),
			cell: (info) => (
				<Group gap='xs' wrap='nowrap'>
					<Text size='sm' fw={500}>
						{info.getValue()}
					</Text>
					{info.row.original.area && (
						<AreaMark
							area={info.row.original.area}
							subItem={info.row.original.subItem}
							size='xs'
						/>
					)}
				</Group>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('type', {
			header: t('agent.coaching.history.columns.type'),
			cell: (info) => (
				<Text size='sm'>{t(`agent.coaching.type.${info.getValue()}`)}</Text>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('coachName', {
			header: t('agent.coaching.history.columns.coach'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('status', {
			header: t('agent.coaching.history.columns.status'),
			cell: (info) => (
				<Badge
					size='xs'
					variant='light'
					color={SESSION_STATUS_COLOR[info.getValue()]}
				>
					{t(`agent.coaching.status.${info.getValue().toLowerCase()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('outcome', {
			header: t('agent.coaching.history.columns.outcome'),
			cell: (info) => (
				<Text size='sm' c='dimmed' lineClamp={1}>
					{info.getValue() || '—'}
				</Text>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.display({
			id: 'impact',
			header: t('agent.coaching.history.columns.impact'),
			cell: (info) => {
				const row = impacts.find((r) => r.sessionId === info.row.original.id);
				return row ? (
					<Group gap='xs' wrap='nowrap'>
						{row.before !== null && row.after !== null && (
							<Text size='xs' c='dimmed'>
								{row.before} → {row.after}
							</Text>
						)}
						<ImpactBadge verdict={row.verdict} />
					</Group>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				);
			},
		}) as BaseTableColumnDef<CoachingSessionRecord>,
	];

	return (
		<SectionCard
			title={t('agent.coaching.history.title')}
			icon={IconHistory}
			description={impactSummary}
			headerActions={
				<DatePickerInput
					type='range'
					size='sm'
					aria-label={t('agent.coaching.history.period')}
					placeholder={t('agent.coaching.history.periodPlaceholder')}
					value={range}
					onChange={(value) => setRange(value as DateRange)}
					defaultDate={TODAY}
					valueFormat='D MMM YYYY'
					clearable
					w={260}
				/>
			}
		>
			<BaseTable<CoachingSessionRecord>
				data={filtered}
				columns={columns}
				getRowId={(r) => r.id}
				density='compact'
				enablePagination
				pageSize={8}
				showPaginationControls
				emptyMessage={
					sessions.length === 0
						? t('agent.coaching.empty')
						: t('agent.coaching.history.noMatches')
				}
				onRowClick={onOpen}
			/>
		</SectionCard>
	);
}

export default SessionHistoryTable;
