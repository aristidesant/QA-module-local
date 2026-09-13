import { useMemo } from 'react';
import { Anchor, Badge, Button, Group, List, Paper, Progress, Rating, SimpleGrid, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { LmsContent, LmsLearningPath } from '~/models/qa';
import { LMS_FORMAT_META } from '../constants';
import type { AssignmentRow } from '../helpers';
import { contentImpactSummary } from '../helpers';
import { AcceptanceBadge, AreaBadge, AssignmentStatusBadge, FormatBadge } from './Badges';

const helper = createColumnHelper<AssignmentRow>();

interface ContentDetailDrawerProps {
	content: LmsContent | null;
	rows: AssignmentRow[];
	paths: LmsLearningPath[];
	/** Coaching rules referencing this content (Plan 3 fills it). */
	linkedRules?: { id: string; name: string }[];
	opened: boolean;
	onClose: () => void;
	onAssign: () => void;
	onPreview: () => void;
	onOpenPath?: (pathId: string) => void;
}

export function ContentDetailDrawer({
	content,
	rows,
	paths,
	linkedRules,
	opened,
	onClose,
	onAssign,
	onPreview,
	onOpenPath,
}: ContentDetailDrawerProps) {
	const { t } = useTranslation(['qa.lms', 'qa.triggers']);

	const contentRows = useMemo(
		() => (content ? rows.filter((r) => r.contentId === content.id).slice(0, 8) : []),
		[rows, content]
	);
	const impact = useMemo(
		() => (content ? contentImpactSummary(rows, content.id) : null),
		[rows, content]
	);
	const inPaths = useMemo(
		() => (content ? paths.filter((p) => p.modules.some((m) => m.contentId === content.id)) : []),
		[paths, content]
	);

	if (!content) return null;

	const formatMeta = LMS_FORMAT_META[content.format];
	const Icon = formatMeta.icon;
	const completionRate = content.stats.assigned
		? Math.round((content.stats.completed / content.stats.assigned) * 100)
		: 0;

	const columns: BaseTableColumnDef<AssignmentRow>[] = [
		helper.accessor('agentName', {
			header: t('manager.contentDetail.columns.agent'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.accessor('team', { header: t('manager.contentDetail.columns.team') }) as BaseTableColumnDef<AssignmentRow>,
		helper.display({
			id: 'status',
			header: t('manager.contentDetail.columns.status'),
			cell: (info) => <AssignmentStatusBadge assignment={info.row.original} size='xs' />,
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.display({
			id: 'acceptance',
			header: t('manager.contentDetail.columns.acceptance'),
			cell: (info) => <AcceptanceBadge acceptance={info.row.original.acceptance} size='xs' />,
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.accessor('dueDate', {
			header: t('manager.contentDetail.columns.due'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<AssignmentRow>,
	];

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			title={content.title}
			description={content.summary}
			icon={<Icon size={18} />}
			iconColor={formatMeta.color}
			headerActions={
				<Group gap='xs'>
					<Button size='xs' variant='light' onClick={onPreview}>
						{t('manager.library.actions.preview')}
					</Button>
					<Button size='xs' onClick={onAssign} disabled={content.status !== 'PUBLISHED'}>
						{t('manager.library.actions.assign')}
					</Button>
				</Group>
			}
		>
			<Stack gap='md'>
				<Group gap='xs'>
					<FormatBadge format={content.format} size='xs' />
					<AreaBadge area={content.area} subItem={content.subItem} size='xs' />
					<Badge size='xs' variant='default'>
						{t(`levels.${content.level}`)}
					</Badge>
					<Text size='xs' c='dimmed'>
						{t('common.minutes', { count: content.durationMin })} · {content.author}
					</Text>
				</Group>

				<SectionCard title={t('manager.contentDetail.stats')} padding='md'>
					<SimpleGrid cols={{ base: 2, md: 4 }} spacing='sm'>
						<StatCard title={t('manager.contentDetail.assigned')} value={content.stats.assigned} variant='compact' />
						<StatCard title={t('manager.contentDetail.completed')} value={content.stats.completed} variant='compact' />
						<StatCard title={t('manager.contentDetail.completionRate')} value={`${completionRate}%`} variant='compact' />
						<StatCard
							title={t('manager.contentDetail.avgScore')}
							value={content.stats.avgScore === null ? '—' : `${content.stats.avgScore}%`}
							variant='compact'
						/>
					</SimpleGrid>
					<Group gap='xs' mt='sm'>
						<Text size='xs' c='dimmed'>
							{t('manager.contentDetail.rating')}
						</Text>
						<Rating readOnly size='xs' fractions={2} value={content.stats.avgRating} />
						<Text size='xs' c='dimmed'>
							{content.stats.avgRating}
						</Text>
					</Group>
				</SectionCard>

				<SectionCard title={t('manager.contentDetail.impact')} padding='md'>
					{impact && impact.measured > 0 ? (
						<Stack gap='sm'>
							{content.impactMetricId && (
								<Text size='xs' c='dimmed'>
									{t('manager.contentDetail.impactHint', {
										metric: t(`metrics.${content.impactMetricId}`, { ns: 'qa.triggers' }),
									})}
								</Text>
							)}
							<Progress.Root size='xl' radius='sm'>
								<Progress.Section value={(impact.improved / impact.measured) * 100} color='green'>
									<Progress.Label>{impact.improved}</Progress.Label>
								</Progress.Section>
								<Progress.Section value={(impact.same / impact.measured) * 100} color='gray'>
									<Progress.Label>{impact.same}</Progress.Label>
								</Progress.Section>
								<Progress.Section value={(impact.declined / impact.measured) * 100} color='red'>
									<Progress.Label>{impact.declined}</Progress.Label>
								</Progress.Section>
							</Progress.Root>
							<Group gap='sm'>
								<Badge size='xs' color='green' variant='light'>
									{impact.improved} {t('manager.contentDetail.improved')}
								</Badge>
								<Badge size='xs' color='gray' variant='light'>
									{impact.same} {t('manager.contentDetail.same')}
								</Badge>
								<Badge size='xs' color='red' variant='light'>
									{impact.declined} {t('manager.contentDetail.declined')}
								</Badge>
							</Group>
						</Stack>
					) : (
						<Text size='sm' c='dimmed'>
							{t('manager.contentDetail.noImpact')}
						</Text>
					)}
				</SectionCard>

				<SectionCard title={t('manager.contentDetail.inPaths')} padding='md'>
					{inPaths.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('manager.contentDetail.noPaths')}
						</Text>
					) : (
						<Stack gap={4}>
							{inPaths.map((p) => (
								<Anchor key={p.id} size='sm' onClick={() => onOpenPath?.(p.id)}>
									{p.title}
								</Anchor>
							))}
						</Stack>
					)}
				</SectionCard>

				<SectionCard title={t('manager.contentDetail.usedInRules')} padding='md'>
					{linkedRules && linkedRules.length > 0 ? (
						<Stack gap={4}>
							{linkedRules.map((r) => (
								<Text key={r.id} size='sm'>
									{r.name}
								</Text>
							))}
						</Stack>
					) : (
						<Text size='sm' c='dimmed'>
							{t('manager.contentDetail.noRules')}
						</Text>
					)}
				</SectionCard>

				<SectionCard title={t('manager.contentDetail.preview')} padding='md'>
					<Stack gap='sm'>
						{content.format === 'VIDEO' && content.chapters && (
							<List size='sm' spacing={4}>
								{content.chapters.map((ch) => (
									<List.Item key={ch.title}>{ch.title}</List.Item>
								))}
							</List>
						)}
						{content.format === 'DOCUMENT' && (
							<Paper withBorder p='sm' radius='sm'>
								<Text size='xs' c='dimmed'>
									{(content.body ?? '').replace(/[#*>`-]/g, '').slice(0, 300)}…
								</Text>
							</Paper>
						)}
						{content.format === 'QUIZ' && content.questions && (
							<List size='sm' spacing={4}>
								{content.questions.map((q) => (
									<List.Item key={q.id}>{q.prompt}</List.Item>
								))}
							</List>
						)}
						{content.format === 'SCENARIO' && content.scenario && (
							<Text size='sm' c='dimmed'>
								{content.scenario.situation}
							</Text>
						)}
					</Stack>
				</SectionCard>

				<SectionCard title={t('manager.contentDetail.recentAgents')} padding='md'>
					<BaseTable<AssignmentRow>
						data={contentRows}
						columns={columns}
						getRowId={(r) => r.id}
						density='compact'
						emptyMessage={t('manager.assignments.empty')}
					/>
				</SectionCard>
			</Stack>
		</AppDrawer>
	);
}
