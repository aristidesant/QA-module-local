import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Button, Progress, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconPlus, IconSchool } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import BaseTable from '~/components/BaseTable/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { AgentProfile, CoachingSession, DimensionKey, LmsAssignment } from '../../types';
import { DIMENSION_META } from '../../constants';
import { formatDate, formatDateTime } from '../../helpers';

const SESSION_STATUS_COLOR: Record<CoachingSession['status'], string> = { scheduled: 'blue', completed: 'green', missed: 'red' };
const LMS_STATUS_COLOR: Record<LmsAssignment['status'], string> = { 'not-started': 'gray', 'in-progress': 'blue', completed: 'green', overdue: 'red' };

const coachHelper = createColumnHelper<CoachingSession>();
const lmsHelper = createColumnHelper<LmsAssignment>();

interface CoachingLmsTabProps {
	profile: AgentProfile;
	onScheduleCoaching: () => void;
	onAssignLms: () => void;
}

export function CoachingLmsTab({ profile, onScheduleCoaching, onAssignLms }: CoachingLmsTabProps) {
	const { t } = useTranslation('qa.team');
	const { coaching, lms } = profile;

	const completed = coaching.filter((c) => c.status === 'completed').length;
	const missed = coaching.filter((c) => c.status === 'missed').length;
	const attendance = completed + missed > 0 ? Math.round((completed / (completed + missed)) * 100) : 100;
	const lmsCompleted = lms.filter((l) => l.status === 'completed').length;
	const lmsCompletion = lms.length > 0 ? Math.round((lmsCompleted / lms.length) * 100) : 100;
	const overdue = lms.filter((l) => l.status === 'overdue').length;
	const mandatoryPending = lms.filter((l) => l.mandatory && l.status !== 'completed').length;

	const coachColumns: BaseTableColumnDef<CoachingSession>[] = [
		coachHelper.accessor('date', { header: t('coaching.columns.date'), cell: (info) => <Text size='sm'>{formatDateTime(info.getValue())}</Text> }) as BaseTableColumnDef<CoachingSession>,
		coachHelper.accessor('topic', { header: t('coaching.columns.topic') }) as BaseTableColumnDef<CoachingSession>,
		coachHelper.accessor('coachName', {
			header: t('coaching.columns.coach'),
			cell: (info) => (
				<>
					<Text size='sm'>{info.getValue()}</Text>
					<Badge size='xs' variant='outline'>{info.row.original.coachRole}</Badge>
				</>
			),
		}) as BaseTableColumnDef<CoachingSession>,
		coachHelper.accessor('linkedDimension', {
			header: t('coaching.columns.dimension'),
			cell: (info) => {
				const key = info.getValue() as DimensionKey | undefined;
				return key ? <Badge color={DIMENSION_META[key].color} size='sm'>{t(DIMENSION_META[key].labelKey)}</Badge> : null;
			},
		}) as BaseTableColumnDef<CoachingSession>,
		coachHelper.accessor('status', {
			header: t('coaching.columns.status'),
			cell: (info) => <Badge color={SESSION_STATUS_COLOR[info.getValue()]}>{t(`coaching.status.${info.getValue()}`)}</Badge>,
		}) as BaseTableColumnDef<CoachingSession>,
		coachHelper.display({
			id: 'outcome',
			header: t('coaching.columns.outcome'),
			cell: (info) => <Text size='xs' c='dimmed'>{info.row.original.outcome ?? info.row.original.followUpDate ?? '—'}</Text>,
		}) as BaseTableColumnDef<CoachingSession>,
	];

	const lmsColumns: BaseTableColumnDef<LmsAssignment>[] = [
		lmsHelper.accessor('title', {
			header: t('coaching.lmsColumns.title'),
			cell: (info) => (
				<>
					<Text size='sm'>{info.getValue()}</Text>
					{info.row.original.mandatory && <Badge size='xs' color='red' variant='light'>{t('coaching.mandatory')}</Badge>}
				</>
			),
		}) as BaseTableColumnDef<LmsAssignment>,
		lmsHelper.accessor('type', { header: t('coaching.lmsColumns.type'), cell: (info) => <Badge variant='outline'>{info.getValue()}</Badge> }) as BaseTableColumnDef<LmsAssignment>,
		lmsHelper.accessor('assignedAt', { header: t('coaching.lmsColumns.assigned'), cell: (info) => <Text size='sm'>{formatDate(info.getValue())}</Text> }) as BaseTableColumnDef<LmsAssignment>,
		lmsHelper.accessor('dueDate', {
			header: t('coaching.lmsColumns.due'),
			cell: (info) => <Text size='sm' c={info.row.original.status === 'overdue' ? 'red' : undefined}>{formatDate(info.getValue())}</Text>,
		}) as BaseTableColumnDef<LmsAssignment>,
		lmsHelper.accessor('progress', {
			header: t('coaching.lmsColumns.progress'),
			cell: (info) => <Progress value={info.getValue()} size='sm' w={120} />,
		}) as BaseTableColumnDef<LmsAssignment>,
		lmsHelper.accessor('status', {
			header: t('coaching.lmsColumns.status'),
			cell: (info) => <Badge color={LMS_STATUS_COLOR[info.getValue()]}>{t(`coaching.lmsStatus.${info.getValue()}`)}</Badge>,
		}) as BaseTableColumnDef<LmsAssignment>,
	];

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				<StatCard title={t('coaching.summary.attendance')} value={`${attendance}%`} />
				<StatCard title={t('coaching.summary.lmsCompletion')} value={`${lmsCompletion}%`} />
				<StatCard title={t('coaching.summary.overdue')} value={overdue} color={overdue > 0 ? 'red' : undefined} />
				<StatCard title={t('coaching.summary.mandatoryPending')} value={mandatoryPending} color={mandatoryPending > 0 ? 'orange' : undefined} />
			</SimpleGrid>

			<SectionCard
				title={t('coaching.sessions')}
				description={t('coaching.sessionsDescription')}
				icon={IconSchool}
				headerActions={(
					<Button size='xs' variant='light' leftSection={<IconPlus size={14} />} onClick={onScheduleCoaching}>
						{t('header.actions.scheduleCoaching')}
					</Button>
				)}
			>
				<BaseTable<CoachingSession>
					data={coaching}
					columns={coachColumns}
					getRowId={(r) => r.id}
					initialSort={[{ id: 'date', desc: true }]}
					density='compact'
					emptyMessage={t('coaching.noSessions')}
				/>
			</SectionCard>

			<SectionCard
				title={t('coaching.lms')}
				description={t('coaching.lmsDescription')}
				headerActions={(
					<Button size='xs' variant='light' leftSection={<IconPlus size={14} />} onClick={onAssignLms}>
						{t('header.actions.assignLms')}
					</Button>
				)}
			>
				<BaseTable<LmsAssignment>
					data={lms}
					columns={lmsColumns}
					getRowId={(r) => r.id}
					density='compact'
					emptyMessage={t('coaching.noLms')}
				/>
			</SectionCard>
		</Stack>
	);
}
