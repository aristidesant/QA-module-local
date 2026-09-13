import { useMemo } from 'react';
import { Badge, Button, Progress, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconRoute } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { LmsContent, LmsLearningPath, LmsPathEnrollment } from '~/models/qa';
import type { RosterAgent } from '~/modules/qa/team/types';
import { LMS_AREA_META } from '../constants';
import { pathProgress } from '../helpers';
import { PathStepper } from './PathStepper';

interface EnrollmentRow extends LmsPathEnrollment {
	agentName: string;
	team: string;
	done: number;
	total: number;
	percent: number;
}

const helper = createColumnHelper<EnrollmentRow>();

interface PathDetailDrawerProps {
	path: LmsLearningPath | null;
	enrollments: LmsPathEnrollment[];
	agents: RosterAgent[];
	contentById: Record<string, LmsContent>;
	opened: boolean;
	onClose: () => void;
	onAssign: () => void;
	onOpenContent: (contentId: string) => void;
}

export function PathDetailDrawer({
	path,
	enrollments,
	agents,
	contentById,
	opened,
	onClose,
	onAssign,
	onOpenContent,
}: PathDetailDrawerProps) {
	const { t } = useTranslation('qa.lms');

	const rows = useMemo<EnrollmentRow[]>(() => {
		if (!path) return [];
		const agentById = Object.fromEntries(agents.map((a) => [a.id, a]));
		return enrollments
			.filter((e) => e.pathId === path.id && agentById[e.agentId])
			.map((e) => {
				const progress = pathProgress(path, e);
				return {
					...e,
					agentName: agentById[e.agentId].name,
					team: agentById[e.agentId].team,
					done: progress.done,
					total: progress.total,
					percent: progress.percent,
				};
			});
	}, [path, enrollments, agents]);

	if (!path) return null;

	const columns: BaseTableColumnDef<EnrollmentRow>[] = [
		helper.accessor('agentName', {
			header: t('manager.paths.detail.columns.agent'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<EnrollmentRow>,
		helper.accessor('team', { header: t('manager.paths.detail.columns.team') }) as BaseTableColumnDef<EnrollmentRow>,
		helper.accessor('percent', {
			header: t('manager.paths.detail.columns.modules'),
			cell: (info) => (
				<Stack gap={2} w={120}>
					<Text size='xs'>
						{info.row.original.done} / {info.row.original.total}
					</Text>
					<Progress value={info.getValue()} size='xs' radius='xl' />
				</Stack>
			),
		}) as BaseTableColumnDef<EnrollmentRow>,
		helper.accessor('enrolledAt', {
			header: t('manager.paths.detail.columns.enrolledAt'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<EnrollmentRow>,
		helper.accessor('dueDate', {
			header: t('manager.paths.detail.columns.due'),
			cell: (info) => <Text size='sm'>{info.getValue() ?? '—'}</Text>,
		}) as BaseTableColumnDef<EnrollmentRow>,
		helper.display({
			id: 'status',
			header: t('manager.paths.detail.columns.status'),
			cell: (info) => {
				const row = info.row.original;
				const key = row.completedAt ? 'completed' : row.done > 0 ? 'inProgress' : 'notStarted';
				const color = row.completedAt ? 'green' : row.done > 0 ? 'blue' : 'gray';
				return (
					<Badge size='xs' color={color} variant='light'>
						{t(`manager.paths.detail.status.${key}`)}
					</Badge>
				);
			},
		}) as BaseTableColumnDef<EnrollmentRow>,
	];

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			title={path.title}
			description={path.description}
			icon={<IconRoute size={18} />}
			iconColor={LMS_AREA_META[path.area].color}
			headerActions={
				<Button size='xs' onClick={onAssign}>
					{t('manager.paths.assignPath')}
				</Button>
			}
		>
			<Stack gap='md'>
				<SectionCard title={t('manager.paths.detail.modules')} padding='md'>
					<PathStepper path={path} contentById={contentById} onOpenModule={onOpenContent} />
				</SectionCard>

				<SectionCard
					title={t('manager.paths.detail.enrolledAgents')}
					description={t('manager.paths.enrolled', { count: rows.length })}
					padding='md'
				>
					<BaseTable<EnrollmentRow>
						data={rows}
						columns={columns}
						getRowId={(r) => r.id}
						density='compact'
						emptyMessage={t('manager.paths.detail.empty')}
					/>
				</SectionCard>
			</Stack>
		</AppDrawer>
	);
}
