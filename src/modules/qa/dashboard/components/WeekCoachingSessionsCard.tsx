import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import SectionCard from '~/components/SectionCard';
import type { CoachingSessionRecord } from '~/models/qa';
import { coachingBasePath } from '~/modules/qa/coaching/constants';
import { TODAY } from '~/modules/qa/analytics/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import { selectSessions, useCoachingStore } from '~/stores/qa/coachingStore';

const helper = createColumnHelper<CoachingSessionRecord>();

const WEEK_DAYS = 7;
const WHEN_FORMAT = 'ddd D MMM · HH:mm';

interface WeekCoachingSessionsCardProps {
	/** Scopes the link to the Sessions tab of the right coaching section. */
	role: TeamRole;
	/** Only the sessions this coach leads are listed. */
	coachId: string;
	/** Rendered in the header before the count, e.g. the data window the card reflects. */
	headerLabel?: React.ReactNode;
}

/** The coaching sessions a supervisor leads over the next 7 days: summary, total and a list by agent. */
export const WeekCoachingSessionsCard: React.FC<
	WeekCoachingSessionsCardProps
> = ({ role, coachId, headerLabel }) => {
	const { t } = useTranslation('qa.dashboard');
	const navigate = useNavigate();
	const sessions = useCoachingStore(selectSessions);

	const rows = useMemo(() => {
		const to = dayjs(TODAY).add(WEEK_DAYS, 'day').format('YYYY-MM-DD');
		return sessions
			.filter((s) => {
				const day = s.date.slice(0, 10);
				return (
					s.status === 'SCHEDULED' &&
					s.coachId === coachId &&
					day >= TODAY &&
					day <= to
				);
			})
			.sort((a, b) => a.date.localeCompare(b.date));
	}, [sessions, coachId]);

	const total = rows.length;
	const agentsCovered = new Set(rows.flatMap((s) => s.agentIds ?? [s.agentId]))
		.size;
	const next = rows[0];

	const openSessions = () => navigate(`${coachingBasePath(role)}?tab=sessions`);

	const columns: BaseTableColumnDef<CoachingSessionRecord>[] = [
		helper.accessor('agentName', {
			header: t('coachingWeek.columns.agent'),
			cell: (info) => (
				<Group gap='xs' wrap='nowrap'>
					<Text size='sm' fw={500}>
						{info.getValue()}
					</Text>
					{info.row.original.type === 'GROUP' && (
						<Badge size='xs' variant='default'>
							{t('coachingWeek.group', {
								count: info.row.original.agentIds?.length ?? 0,
							})}
						</Badge>
					)}
				</Group>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('date', {
			header: t('coachingWeek.columns.date'),
			cell: (info) => (
				<Text size='sm'>{dayjs(info.getValue()).format(WHEN_FORMAT)}</Text>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
	];

	return (
		<SectionCard
			fullHeight
			title={t('coachingWeek.title')}
			description={t('coachingWeek.description')}
			headerActions={
				<Group gap='sm' wrap='nowrap'>
					{headerLabel}
					<Badge variant='default' size='sm'>
						{total}
					</Badge>
				</Group>
			}
		>
			<Stack gap='md'>
				<Stack gap={2}>
					<Text size='sm' fw={500}>
						{t('coachingWeek.summary', { count: total, agents: agentsCovered })}
					</Text>
					{next && (
						<Text size='xs' c='dimmed'>
							{t('coachingWeek.next', {
								name: next.agentName,
								when: dayjs(next.date).format(WHEN_FORMAT),
							})}
						</Text>
					)}
				</Stack>
				<BaseTable<CoachingSessionRecord>
					data={rows}
					columns={columns}
					getRowId={(s) => s.id}
					density='compact'
					emptyMessage={t('coachingWeek.empty')}
					onRowClick={openSessions}
				/>
				<Group justify='flex-end'>
					<Button
						variant='subtle'
						size='xs'
						rightSection={<IconArrowRight size={14} />}
						onClick={openSessions}
					>
						{t('coachingWeek.viewAll')}
					</Button>
				</Group>
			</Stack>
		</SectionCard>
	);
};

export default WeekCoachingSessionsCard;
