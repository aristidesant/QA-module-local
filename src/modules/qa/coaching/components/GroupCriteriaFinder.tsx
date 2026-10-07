import { useState } from 'react';
import {
	Badge,
	Button,
	Group,
	NumberInput,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { EvaluationArea, TriggerMetricId } from '~/models/qa';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { VIEW_METRICS } from '~/modules/qa/analytics/constants';
import {
	burnoutLevelsByAgent,
	formatMetric,
	runFinderQuery,
} from '~/modules/qa/analytics/helpers';
import type {
	FinderOperator,
	FinderResultRow,
	SegmentMetricId,
} from '~/modules/qa/analytics/types';
import { teamCallsInWindow } from '~/modules/qa/calls/agentMetrics';
import { managerScopeAgents } from '~/modules/qa/lms/helpers';
import {
	EVALUATION_AREAS,
	METRIC_BY_ID,
} from '~/modules/qa/triggers/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';

const AREA_METRICS: Record<EvaluationArea, SegmentMetricId[]> = {
	QUALITY_ASSURANCE: VIEW_METRICS.qa,
	SENTIMENT_EMOTION: VIEW_METRICS.sentiment,
	COMPLIANCE: VIEW_METRICS.compliance,
	BUSINESS_INSIGHTS: VIEW_METRICS.business,
};

const PERIODS = [7, 14, 30, 90] as const;
type Period = (typeof PERIODS)[number];
type Condition = Extract<FinderOperator, 'BELOW' | 'ABOVE'>;

/** Weak results are low for scores and high for error counts and negative shares. */
const defaultOperator = (metricId: TriggerMetricId): Condition =>
	METRIC_BY_ID[metricId].higherIsBetter ? 'BELOW' : 'ABOVE';

const helper = createColumnHelper<FinderResultRow>();

interface GroupCriteriaFinderProps {
	role: TeamRole;
	/** Members already picked: matches that are in are shown but not added again. */
	selectedAgentIds: string[];
	onAdd: (agentIds: string[]) => void;
}

/** Finds the agents of the manager's scope whose result on a metric is weak over a period. */
export function GroupCriteriaFinder({
	role,
	selectedAgentIds,
	onAdd,
}: GroupCriteriaFinderProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.triggers']);
	const triggerRules = useTriggerRulesStore(selectTriggerRules);

	const [area, setArea] = useState<EvaluationArea>('QUALITY_ASSURANCE');
	const [metricId, setMetricId] = useState<TriggerMetricId>(
		AREA_METRICS.QUALITY_ASSURANCE[0]
	);
	const [operator, setOperator] = useState<Condition>(
		defaultOperator(AREA_METRICS.QUALITY_ASSURANCE[0])
	);
	const [value, setValue] = useState<number>(
		METRIC_BY_ID[AREA_METRICS.QUALITY_ASSURANCE[0]].defaultThreshold
	);
	const [days, setDays] = useState<Period>(30);
	const [results, setResults] = useState<FinderResultRow[] | null>(null);

	const chooseMetric = (next: TriggerMetricId) => {
		setMetricId(next);
		setOperator(defaultOperator(next));
		setValue(METRIC_BY_ID[next].defaultThreshold);
		setResults(null);
	};

	const chooseArea = (next: EvaluationArea) => {
		setArea(next);
		chooseMetric(AREA_METRICS[next][0]);
	};

	const apply = () => {
		const calls = teamCallsInWindow(role, days);
		const previous = teamCallsInWindow(role, days, null, days);
		setResults(
			runFinderQuery(
				calls,
				previous,
				managerScopeAgents(role),
				{ metricId, operator, value, value2: null, minCalls: 1 },
				burnoutLevelsByAgent(triggerRules)
			)
		);
	};

	const toAdd = (results ?? []).filter(
		(r) => !selectedAgentIds.includes(r.agentId)
	);

	const addMatches = () => {
		onAdd(toAdd.map((r) => r.agentId));
		notifySuccess(t('cohorts.create.criteria.added', { count: toAdd.length }));
	};

	const columns: BaseTableColumnDef<FinderResultRow>[] = [
		helper.accessor('agentName', {
			header: t('cohorts.create.criteria.columns.agent'),
			cell: (info) => (
				<Stack gap={0}>
					<Text size='sm'>{info.getValue()}</Text>
					<Text size='xs' c='dimmed'>
						{info.row.original.team}
					</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<FinderResultRow>,
		helper.accessor('value', {
			header: t('cohorts.create.criteria.columns.value'),
			cell: (info) => (
				<Text size='sm' fw={600}>
					{formatMetric(metricId, info.getValue())}
				</Text>
			),
		}) as BaseTableColumnDef<FinderResultRow>,
		helper.accessor('callsEvaluated', {
			header: t('cohorts.create.criteria.columns.calls'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<FinderResultRow>,
		helper.display({
			id: 'status',
			header: t('cohorts.create.criteria.columns.status'),
			cell: (info) =>
				selectedAgentIds.includes(info.row.original.agentId) ? (
					<Badge size='xs' variant='light' color='gray'>
						{t('cohorts.create.criteria.alreadyIn')}
					</Badge>
				) : (
					<Badge size='xs' variant='light'>
						{t('cohorts.create.criteria.willAdd')}
					</Badge>
				),
		}) as BaseTableColumnDef<FinderResultRow>,
	];

	const metric = METRIC_BY_ID[metricId];

	return (
		<Stack gap='sm'>
			<Group align='flex-end' gap='sm' wrap='wrap'>
				<Select
					size='sm'
					label={t('cohorts.create.criteria.area')}
					data={EVALUATION_AREAS.map((a) => ({
						value: a,
						label: t(`areas.${a}`, { ns: 'qa.triggers' }),
					}))}
					value={area}
					onChange={(v) => v && chooseArea(v as EvaluationArea)}
					allowDeselect={false}
					w={190}
				/>
				<Select
					size='sm'
					label={t('cohorts.create.criteria.metric')}
					data={AREA_METRICS[area].map((id) => ({
						value: id,
						label: t(`metrics.${id}`, { ns: 'qa.triggers' }),
					}))}
					value={metricId}
					onChange={(v) => v && chooseMetric(v as TriggerMetricId)}
					allowDeselect={false}
					comboboxProps={{ width: 'max-content', position: 'bottom-start' }}
					w={220}
				/>
				<Select
					size='sm'
					label={t('cohorts.create.criteria.operator')}
					data={[
						{ value: 'BELOW', label: t('cohorts.create.criteria.below') },
						{ value: 'ABOVE', label: t('cohorts.create.criteria.above') },
					]}
					value={operator}
					onChange={(v) => {
						if (v) {
							setOperator(v as Condition);
							setResults(null);
						}
					}}
					allowDeselect={false}
					w={150}
				/>
				<NumberInput
					size='sm'
					label={t('cohorts.create.criteria.value')}
					value={value}
					onChange={(v) => {
						setValue(Number(v) || 0);
						setResults(null);
					}}
					min={metric.min}
					max={metric.max}
					step={metric.step}
					decimalScale={1}
					w={110}
				/>
				<Select
					size='sm'
					label={t('cohorts.create.criteria.period')}
					data={PERIODS.map((p) => ({
						value: String(p),
						label: t('cohorts.create.criteria.days', { count: p }),
					}))}
					value={String(days)}
					onChange={(v) => {
						if (v) {
							setDays(Number(v) as Period);
							setResults(null);
						}
					}}
					allowDeselect={false}
					w={150}
				/>
				<Button size='sm' onClick={apply}>
					{t('cohorts.create.criteria.apply')}
				</Button>
			</Group>

			{results !== null && (
				<Stack gap='xs'>
					<Group justify='space-between'>
						<Text size='sm' fw={500}>
							{t('cohorts.create.criteria.summary', { count: results.length })}
						</Text>
						<Button
							size='xs'
							variant='light'
							disabled={toAdd.length === 0}
							onClick={addMatches}
						>
							{t('cohorts.create.criteria.addMatches')}
						</Button>
					</Group>
					<BaseTable<FinderResultRow>
						data={results}
						columns={columns}
						getRowId={(r) => r.agentId}
						density='compact'
						emptyMessage={t('cohorts.create.criteria.noMatches')}
					/>
				</Stack>
			)}
		</Stack>
	);
}
