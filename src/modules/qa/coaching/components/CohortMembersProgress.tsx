import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Anchor, Button, Progress, Stack, Text } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { CoachingCohort, LmsAssignment } from '~/models/qa';
import { ImpactBadge } from '~/modules/qa/lms/components/Badges';
import { isOverdue, pathProgress } from '~/modules/qa/lms/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { selectRules, useCoachingStore } from '~/stores/qa/coachingStore';
import {
	selectAssignments,
	selectEnrollments,
	selectPaths,
	useLmsStore,
} from '~/stores/qa/lmsStore';
import { coachingRulePath, coachingSessionNewPath } from '../constants';

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

interface CohortMembersProgressProps {
	cohort: CoachingCohort;
	role: TeamRole;
}

/** How a saved learning group is doing: each member's progress, plus the rules linked to it. Shown when editing. */
export function CohortMembersProgress({
	cohort,
	role,
}: CohortMembersProgressProps) {
	const { t } = useTranslation('qa.coaching');
	const navigate = useNavigate();
	const paths = useLmsStore(selectPaths);
	const enrollments = useLmsStore(selectEnrollments);
	const assignments = useLmsStore(selectAssignments);
	const rules = useCoachingStore(selectRules);

	const path = paths.find((p) => p.id === cohort.pathId);

	const rows = useMemo<MemberRow[]>(
		() =>
			cohort.agentIds.flatMap((agentId) => {
				const agent = TEAM_AGENTS.find((a) => a.id === agentId);
				if (!agent) return [];
				const enrollment = enrollments.find(
					(e) => e.agentId === agentId && e.pathId === cohort.pathId
				);
				const progress = path
					? pathProgress(path, enrollment)
					: { done: 0, total: 0, percent: 0 };
				const mine = assignments.filter((a) => a.agentId === agentId);
				const measured = mine
					.filter((a) => a.impact)
					.sort((a, b) =>
						(b.completedAt ?? '').localeCompare(a.completedAt ?? '')
					)[0];
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
			}),
		[cohort, path, enrollments, assignments]
	);

	const completion = rows.length
		? Math.round(rows.reduce((s, r) => s + r.percent, 0) / rows.length)
		: 0;

	const columns: BaseTableColumnDef<MemberRow>[] = [
		helper.accessor('name', {
			header: t('cohorts.progress.columns.agent'),
		}) as BaseTableColumnDef<MemberRow>,
		helper.accessor('team', {
			header: t('cohorts.progress.columns.team'),
		}) as BaseTableColumnDef<MemberRow>,
		helper.accessor('percent', {
			header: t('cohorts.progress.columns.modules'),
			cell: (info) => (
				<Stack gap={2} w={120}>
					<Text size='xs'>{info.row.original.modules}</Text>
					<Progress
						value={info.getValue()}
						size='xs'
						color='gray'
						aria-label={`${info.row.original.name} ${info.getValue()}%`}
					/>
				</Stack>
			),
		}) as BaseTableColumnDef<MemberRow>,
		helper.accessor('overdue', {
			header: t('cohorts.progress.columns.overdue'),
			cell: (info) => (
				<Text size='sm' c={info.getValue() > 0 ? 'red' : undefined}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<MemberRow>,
		helper.display({
			id: 'impact',
			header: t('cohorts.progress.columns.impact'),
			cell: (info) => (
				<ImpactBadge
					impact={info.row.original.assignment?.impact ?? null}
					size='xs'
				/>
			),
		}) as BaseTableColumnDef<MemberRow>,
	];

	return (
		<>
			<SectionCard
				title={t('cohorts.progress.title')}
				description={t('cohorts.progress.summary', { percent: completion })}
				padding='md'
				headerActions={
					<Button
						variant='default'
						size='sm'
						leftSection={<IconCalendarEvent size={16} />}
						onClick={() =>
							navigate(
								coachingSessionNewPath(role, {
									cohort: cohort.id,
									type: 'GROUP',
								})
							)
						}
					>
						{t('cohorts.progress.scheduleGroup')}
					</Button>
				}
			>
				<BaseTable<MemberRow>
					data={rows}
					columns={columns}
					getRowId={(r) => r.id}
					density='compact'
					emptyMessage={t('cohorts.progress.empty')}
				/>
			</SectionCard>

			{cohort.ruleIds.length > 0 && (
				<SectionCard title={t('cohorts.progress.linkedRules')} padding='md'>
					<Stack gap={4} align='flex-start'>
						{cohort.ruleIds.map((ruleId) => (
							<Anchor
								key={ruleId}
								component='button'
								type='button'
								size='sm'
								onClick={() => navigate(coachingRulePath(role, ruleId))}
							>
								{rules.find((r) => r.id === ruleId)?.name ?? ruleId}
							</Anchor>
						))}
					</Stack>
				</SectionCard>
			)}
		</>
	);
}
