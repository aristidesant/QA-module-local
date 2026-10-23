import { Badge, Group, Text } from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingSessionRecord } from '~/models/qa';
import { AreaBadge } from '~/modules/qa/lms/components/Badges';
import { ImpactBadge } from '../components/ImpactBadge';
import { SESSION_STATUS_COLOR } from '../constants';
import type { SessionImpactRow } from '../postCoaching';

const helper = createColumnHelper<CoachingSessionRecord>();

interface SessionHistoryTableProps {
	sessions: CoachingSessionRecord[];
	impacts: SessionImpactRow[];
	onOpen: (session: CoachingSessionRecord) => void;
}

/** Every coach-led session that already happened (or was missed), newest first. */
export function SessionHistoryTable({
	sessions,
	impacts,
	onOpen,
}: SessionHistoryTableProps) {
	const { t } = useTranslation('qa.lms');

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
						<AreaBadge
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
					<ImpactBadge verdict={row.verdict} />
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				);
			},
		}) as BaseTableColumnDef<CoachingSessionRecord>,
	];

	return (
		<SectionCard title={t('agent.coaching.history.title')} icon={IconHistory}>
			<BaseTable<CoachingSessionRecord>
				data={sessions}
				columns={columns}
				getRowId={(r) => r.id}
				density='compact'
				enablePagination
				pageSize={8}
				showPaginationControls
				emptyMessage={t('agent.coaching.empty')}
				onRowClick={onOpen}
			/>
		</SectionCard>
	);
}

export default SessionHistoryTable;
