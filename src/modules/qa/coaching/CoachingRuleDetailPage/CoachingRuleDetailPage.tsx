import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
	Anchor,
	Badge,
	Breadcrumbs,
	Button,
	Group,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconPencil } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import ConditionSummaryList from '~/modules/qa/triggers/components/ConditionSummaryList';
import { evaluateRulePreview } from '~/modules/qa/triggers/helpers';
import { TRIGGER_AGENTS } from '~/modules/qa/triggers/mockData';
import type { LmsContent } from '~/models/qa';
import {
	AreaBadge,
	AssignmentStatusBadge,
	FormatBadge,
	ImpactBadge,
} from '~/modules/qa/lms/components/Badges';
import {
	managerScopeAgents,
	toAssignmentRows,
	type AssignmentRow,
} from '~/modules/qa/lms/helpers';
import { roleFromPath } from '~/modules/qa/team/helpers';
import {
	useLmsStore,
	selectAssignments,
	selectContent,
	selectPaths,
} from '~/stores/qa/lmsStore';
import { useCoachingStore, selectRules } from '~/stores/qa/coachingStore';
import { coachingBasePath, coachingRuleEditPath } from '../constants';

const helper = createColumnHelper<AssignmentRow>();

/** Read-only detail of one coaching rule on its own page (route `rules/:ruleId`). */
export default function CoachingRuleDetailPage() {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const location = useLocation();
	const navigate = useNavigate();
	const { ruleId } = useParams<{ ruleId: string }>();

	const role = roleFromPath(location.pathname);
	const rules = useCoachingStore(selectRules);
	const content = useLmsStore(selectContent);
	const paths = useLmsStore(selectPaths);
	const assignments = useLmsStore(selectAssignments);

	const rule = rules.find((r) => r.id === ruleId) ?? null;

	const contentById = useMemo(
		() =>
			Object.fromEntries(content.map((c) => [c.id, c])) as Record<
				string,
				LmsContent
			>,
		[content]
	);
	const rows = useMemo(
		() => toAssignmentRows(assignments, contentById, managerScopeAgents(role)),
		[assignments, contentById, role]
	);
	const ruleRows = useMemo(
		() => (rule ? rows.filter((r) => r.ruleId === rule.id).slice(0, 10) : []),
		[rows, rule]
	);
	const preview = useMemo(
		() =>
			rule
				? evaluateRulePreview(
						{
							type: 'METRIC_ALERT',
							conditions: rule.conditions,
							conditionLogic: rule.conditionLogic,
							scope: rule.scope,
						},
						TRIGGER_AGENTS
					)
				: null,
		[rule]
	);

	const backToRules = () => navigate(`${coachingBasePath(role)}?tab=rules`);
	const pathTitle = (id: string | null) =>
		paths.find((p) => p.id === id)?.title ?? '—';

	if (!rule) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('rules.page.notFound')} />
			</ContentContainer>
		);
	}

	const matching = preview?.matching ?? [];

	const columns: BaseTableColumnDef<AssignmentRow>[] = [
		helper.accessor('agentName', {
			header: t('rules.detail.columns.agent'),
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.accessor('contentTitle', {
			header: t('rules.detail.columns.material'),
			cell: (info) => (
				<Group gap='xs' wrap='nowrap'>
					<Text size='sm'>{info.getValue()}</Text>
					<FormatBadge format={info.row.original.format} size='xs' />
				</Group>
			),
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.accessor('assignedAt', {
			header: t('rules.detail.columns.assigned'),
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.display({
			id: 'status',
			header: t('rules.detail.columns.status'),
			cell: (info) => (
				<AssignmentStatusBadge assignment={info.row.original} size='xs' />
			),
		}) as BaseTableColumnDef<AssignmentRow>,
		helper.display({
			id: 'impact',
			header: t('rules.detail.columns.impact'),
			cell: (info) => (
				<ImpactBadge impact={info.row.original.impact} size='xs' />
			),
		}) as BaseTableColumnDef<AssignmentRow>,
	];

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' maw={960} mx='auto' px='md'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={() => navigate(coachingBasePath(role))}>
						{t('title')}
					</Anchor>
					<Anchor size='sm' onClick={backToRules}>
						{t('tabs.rules')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{rule.name}
					</Text>
				</Breadcrumbs>

				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<Stack gap={4} flex={1}>
						<Title order={1}>{rule.name}</Title>
						{rule.description && (
							<Text c='dimmed' size='sm'>
								{rule.description}
							</Text>
						)}
						<Group gap='xs'>
							<AreaBadge area={rule.area} size='xs' />
							<Badge size='xs' variant='light'>
								{t(`rules.status.${rule.status}`)}
							</Badge>
						</Group>
					</Stack>
					<Button
						size='sm'
						variant='default'
						leftSection={<IconPencil size={14} />}
						onClick={() => navigate(coachingRuleEditPath(role, rule.id))}
					>
						{t('rules.detail.edit')}
					</Button>
				</Group>

				<SectionCard title={t('rules.detail.condition')} padding='md'>
					<ConditionSummaryList
						conditions={rule.conditions}
						logic={rule.conditionLogic}
					/>
				</SectionCard>

				<SectionCard title={t('rules.detail.action')} padding='md'>
					<Stack gap='xs'>
						<Text size='sm'>
							{rule.action.kind === 'ASSIGN_CONTENT'
								? t('rules.actionSummary.content', {
										count: rule.action.contentIds.length,
										days: rule.action.dueInDays,
									})
								: t('rules.actionSummary.path', {
										path: pathTitle(rule.action.pathId),
										days: rule.action.dueInDays,
									})}
						</Text>
						{rule.action.kind === 'ASSIGN_CONTENT' && (
							<Stack gap={4}>
								{rule.action.contentIds.map((id) => (
									<Group key={id} gap='xs' wrap='nowrap'>
										<Text size='xs'>{contentById[id]?.title ?? id}</Text>
										{contentById[id] && (
											<FormatBadge format={contentById[id].format} size='xs' />
										)}
									</Group>
								))}
							</Stack>
						)}
						<Group gap='xs'>
							{rule.action.mandatory && (
								<Badge size='xs' color='red' variant='light'>
									{t('rules.editor.fields.mandatory')}
								</Badge>
							)}
							{rule.action.requireAcceptance && (
								<Badge size='xs' color='yellow' variant='light'>
									{t('rules.editor.fields.requireAcceptance')}
								</Badge>
							)}
							{rule.action.scheduleSession && (
								<Badge size='xs' color='blue' variant='light'>
									{rule.action.sessionTopic}
								</Badge>
							)}
						</Group>
					</Stack>
				</SectionCard>

				<SectionCard title={t('rules.detail.followUp')} padding='md'>
					<Text size='sm' c='dimmed'>
						{t('rules.detail.followUpSummary', {
							window: rule.followUp.windowDays,
							checkpoints: rule.followUp.checkpointDays.join(', '),
							threshold: rule.followUp.successThreshold,
						})}
					</Text>
				</SectionCard>

				<SectionCard title={t('rules.detail.stats')} padding='md'>
					<SimpleGrid cols={{ base: 2, md: 4 }} spacing='sm'>
						<StatCard
							title={t('rules.detail.fired30')}
							value={rule.stats.triggeredLast30Days}
							variant='compact'
						/>
						<StatCard
							title={t('rules.detail.agents')}
							value={rule.stats.agentsAffected}
							variant='compact'
						/>
						<StatCard
							title={t('rules.detail.improvedRate')}
							value={
								rule.stats.improvedRate === null
									? '—'
									: `${rule.stats.improvedRate}%`
							}
							variant='compact'
						/>
						<StatCard
							title={t('rules.detail.lastFired')}
							value={
								rule.stats.lastTriggeredAt
									? rule.stats.lastTriggeredAt.slice(0, 10)
									: '—'
							}
							variant='compact'
						/>
					</SimpleGrid>
				</SectionCard>

				<SectionCard title={t('rules.detail.matchingNow')} padding='md'>
					{matching.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('rules.detail.noMatches')}
						</Text>
					) : (
						<Group gap={4}>
							{matching.map((a) => (
								<Badge key={a.agentId} variant='light'>
									{a.agentName} · {a.team}
								</Badge>
							))}
						</Group>
					)}
				</SectionCard>

				<SectionCard title={t('rules.detail.recentAssignments')} padding='md'>
					<BaseTable<AssignmentRow>
						data={ruleRows}
						columns={columns}
						getRowId={(r) => r.id}
						density='compact'
						emptyMessage={t('rules.detail.noMatches')}
					/>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
}
