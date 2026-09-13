import { useMemo } from 'react';
import { Badge, Button, Group, Progress, RingProgress, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { modals } from '@mantine/modals';
import { IconBook, IconCalendarEvent, IconRoute, IconTrash, IconUsersGroup } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { CoachingCohort, CoachingRule, LmsAssignment, LmsLearningPath, LmsPathEnrollment } from '~/models/qa';
import { ImpactBadge } from '~/modules/qa/lms/components/Badges';
import { isOverdue, pathProgress } from '~/modules/qa/lms/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';

interface MemberRow {
	id: string;
	name: string;
	team: string;
	modules: string;
	percent: number;
	overdue: number;
	assignment: LmsAssignment | null;
}

const helper = createColumnHelper<MemberRow>();

interface CohortDrawerProps {
	cohort: CoachingCohort | null;
	paths: LmsLearningPath[];
	enrollments: LmsPathEnrollment[];
	assignments: LmsAssignment[];
	rules: CoachingRule[];
	opened: boolean;
	onClose: () => void;
	onAssignPath: () => void;
	onAssignMaterial: () => void;
	onScheduleGroup: () => void;
	onDelete: () => void;
	onOpenRule: (ruleId: string) => void;
}

export function CohortDrawer({
	cohort,
	paths,
	enrollments,
	assignments,
	rules,
	opened,
	onClose,
	onAssignPath,
	onAssignMaterial,
	onScheduleGroup,
	onDelete,
	onOpenRule,
}: CohortDrawerProps) {
	const { t } = useTranslation('qa.coaching');

	const path = cohort ? paths.find((p) => p.id === cohort.pathId) : undefined;

	const rows = useMemo<MemberRow[]>(() => {
		if (!cohort) return [];
		return cohort.agentIds.flatMap((agentId) => {
			const agent = TEAM_AGENTS.find((a) => a.id === agentId);
			if (!agent) return [];
			const enrollment = enrollments.find((e) => e.agentId === agentId && e.pathId === cohort.pathId);
			const progress = path ? pathProgress(path, enrollment) : { done: 0, total: 0, percent: 0 };
			const mine = assignments.filter((a) => a.agentId === agentId);
			const measured = mine
				.filter((a) => a.impact)
				.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))[0];
			return [
				{
					id: agentId,
					name: agent.name,
					team: agent.team,
					modules: `${progress.done} / ${progress.total}`,
					percent: progress.percent,
					overdue: mine.filter(isOverdue).length,
					assignment: measured ?? null,
				},
			];
		});
	}, [cohort, path, enrollments, assignments]);

	if (!cohort) return null;

	const completion = rows.length ? Math.round(rows.reduce((s, r) => s + r.percent, 0) / rows.length) : 0;

	const columns: BaseTableColumnDef<MemberRow>[] = [
		helper.accessor('name', { header: t('cohorts.drawer.columns.agent') }) as BaseTableColumnDef<MemberRow>,
		helper.accessor('team', { header: t('cohorts.drawer.columns.team') }) as BaseTableColumnDef<MemberRow>,
		helper.accessor('percent', {
			header: t('cohorts.drawer.columns.modules'),
			cell: (info) => (
				<Stack gap={2} w={120}>
					<Text size='xs'>{info.row.original.modules}</Text>
					<Progress value={info.getValue()} size='xs' radius='xl' />
				</Stack>
			),
		}) as BaseTableColumnDef<MemberRow>,
		helper.accessor('overdue', {
			header: t('cohorts.drawer.columns.overdue'),
			cell: (info) => (
				<Text size='sm' c={info.getValue() > 0 ? 'red' : undefined}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<MemberRow>,
		helper.display({
			id: 'impact',
			header: t('cohorts.drawer.columns.impact'),
			cell: (info) => <ImpactBadge impact={info.row.original.assignment?.impact ?? null} size='xs' />,
		}) as BaseTableColumnDef<MemberRow>,
	];

	const confirmDelete = () =>
		modals.openConfirmModal({
			title: t('cohorts.drawer.delete'),
			children: <Text size='sm'>{cohort.name}</Text>,
			labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
			confirmProps: { color: 'red' },
			onConfirm: onDelete,
		});

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			title={cohort.name}
			description={cohort.description}
			icon={<IconUsersGroup size={18} />}
			iconColor='grape'
			headerActions={
				<Group gap='xs'>
					<Button size='xs' variant='light' leftSection={<IconRoute size={14} />} onClick={onAssignPath}>
						{t('cohorts.drawer.assignPath')}
					</Button>
					<Button size='xs' variant='light' leftSection={<IconBook size={14} />} onClick={onAssignMaterial}>
						{t('cohorts.drawer.assignMaterial')}
					</Button>
					<Button size='xs' variant='light' leftSection={<IconCalendarEvent size={14} />} onClick={onScheduleGroup}>
						{t('cohorts.drawer.scheduleGroup')}
					</Button>
				</Group>
			}
		>
			<Stack gap='md'>
				<Group gap='lg'>
					<RingProgress
						size={90}
						thickness={10}
						roundCaps
						sections={[{ value: completion, color: 'grape' }]}
						label={
							<Text size='sm' ta='center' fw={700}>
								{completion}%
							</Text>
						}
					/>
					<Stack gap={4}>
						<Text size='sm' fw={500}>
							{t('cohorts.members', { count: cohort.agentIds.length })}
						</Text>
						{path && (
							<Badge size='xs' variant='light' color='blue'>
								{path.title}
							</Badge>
						)}
						<Group gap={4}>
							{cohort.tags.map((tag) => (
								<Badge key={tag} size='xs' variant='dot' color='gray'>
									{tag}
								</Badge>
							))}
						</Group>
					</Stack>
				</Group>

				<SectionCard title={t('cohorts.drawer.members')} padding='md'>
					<BaseTable<MemberRow>
						data={rows}
						columns={columns}
						getRowId={(r) => r.id}
						density='compact'
						emptyMessage={t('cohorts.empty')}
					/>
				</SectionCard>

				<SectionCard title={t('cohorts.drawer.linkedRules')} padding='md'>
					{cohort.ruleIds.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('cohorts.drawer.noRules')}
						</Text>
					) : (
						<Stack gap={4}>
							{cohort.ruleIds.map((ruleId) => {
								const rule = rules.find((r) => r.id === ruleId);
								return (
									<Text
										key={ruleId}
										size='sm'
										className={pointerStyles.pointer}
										onClick={() => onOpenRule(ruleId)}
									>
										{rule?.name ?? ruleId}
									</Text>
								);
							})}
						</Stack>
					)}
				</SectionCard>

				<Button variant='subtle' color='red' leftSection={<IconTrash size={16} />} onClick={confirmDelete}>
					{t('cohorts.drawer.delete')}
				</Button>
			</Stack>
		</AppDrawer>
	);
}
