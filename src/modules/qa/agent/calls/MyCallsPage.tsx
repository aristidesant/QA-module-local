import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/react-table';
import {
	Badge,
	Button,
	Group,
	MultiSelect,
	SegmentedControl,
	Select,
	Stack,
	Tabs,
	Text,
	TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconGitBranch, IconPhone, IconX } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer';
import { SectionCard } from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import { AGENT_PERSONA_ID, NOW_ISO } from '~/modules/qa/team/constants';
import { formatDateTime, formatSeconds } from '~/modules/qa/team/helpers';
import { buildAgentIssueCalls } from '~/modules/qa/calls/helpers';
import {
	MY_CALLS_EVALUATION_TYPES,
	MY_CALLS_PERIODS,
	MY_CALLS_PRESET_PERIODS,
	type MyCallsPeriod,
} from '~/modules/qa/calls/constants';
import {
	CALL_ISSUES,
	CALL_ISSUE_ASPECTS,
	CALL_ISSUE_BY_KEY,
	parseIssueParam,
	type CallIssueAspect,
	type CallIssueKey,
} from '~/modules/qa/calls/issues';
import type {
	AgentCallRow,
	MyCallsEvaluationType,
} from '~/modules/qa/calls/types';
import { useDisputesStore, selectCases } from '~/stores/qa/disputesStore';
import { casesForRole, openCount } from '~/modules/qa/disputes/cases/helpers';
import { DisputeCasesContent } from '~/modules/qa/disputes/cases/DisputeCasesPage';
import styles from './MyCallsPage.module.css';

const helper = createColumnHelper<AgentCallRow>();
type MyCallsTab = 'calls' | 'disputes';
const MAX_ISSUE_BADGES = 3;

interface FiltersState {
	period: MyCallsPeriod;
	from: Date | null;
	to: Date | null;
	aspect: CallIssueAspect | 'all';
	issues: CallIssueKey[];
	evaluationType: MyCallsEvaluationType;
	scoreMin: number | null;
	scoreMax: number | null;
}

const DEFAULT_FILTERS: FiltersState = {
	period: '30d',
	from: null,
	to: null,
	aspect: 'all',
	issues: [],
	evaluationType: 'qa',
	scoreMin: null,
	scoreMax: null,
};

const isPeriod = (value: string | null): value is MyCallsPeriod =>
	MY_CALLS_PERIODS.some((p) => p.value === value);

export default function MyCallsPage() {
	const { t } = useTranslation('qa.calls');
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);

	// Tab lives in the URL (?tab=calls|disputes) like AgentProfilePage / AgentLmsPage.
	const tab = (searchParams.get('tab') as MyCallsTab | null) ?? 'calls';
	const setTab = (value: string | null) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (value) next.set('tab', value);
				return next;
			},
			{ replace: true }
		);
	};

	// Dashboard drill-down: ?issue=a,b[&period=30d] pre-selects the issue filter.
	const issueParam = searchParams.get('issue');
	const periodParam = searchParams.get('period');
	useEffect(() => {
		const issues = parseIssueParam(issueParam);
		if (issues.length === 0) return;
		setFilters((f) => ({
			...f,
			issues,
			aspect: 'all',
			period: isPeriod(periodParam) ? periodParam : f.period,
			from: null,
			to: null,
		}));
	}, [issueParam, periodParam]);

	const allCases = useDisputesStore(selectCases);
	const openDisputes = useMemo(
		() => openCount(casesForRole(allCases, 'agent')),
		[allCases]
	);

	const rows = useMemo(() => buildAgentIssueCalls(AGENT_PERSONA_ID), []);

	const filteredRows = useMemo(() => {
		let result = rows;

		if (filters.period !== 'all' && !filters.from && !filters.to) {
			const days =
				MY_CALLS_PERIODS.find((p) => p.value === filters.period)?.days ?? null;
			if (days !== null) {
				const since = new Date(NOW_ISO);
				since.setUTCDate(since.getUTCDate() - days);
				result = result.filter((r) => new Date(r.date) >= since);
			}
		}

		if (filters.from) {
			const from = filters.from;
			result = result.filter(
				(r) =>
					new Date(r.date.slice(0, 10)) >=
					new Date(from.toISOString().slice(0, 10))
			);
		}
		if (filters.to) {
			const to = filters.to;
			result = result.filter(
				(r) =>
					new Date(r.date.slice(0, 10)) <=
					new Date(to.toISOString().slice(0, 10))
			);
		}

		if (filters.aspect !== 'all') {
			result = result.filter((r) =>
				r.issues.some((k) => CALL_ISSUE_BY_KEY[k].aspect === filters.aspect)
			);
		}
		if (filters.issues.length > 0) {
			result = result.filter((r) =>
				filters.issues.some((k) => r.issues.includes(k))
			);
		}

		if (filters.scoreMin !== null || filters.scoreMax !== null) {
			const scoreField =
				MY_CALLS_EVALUATION_TYPES.find(
					(type) => type.value === filters.evaluationType
				)?.scoreField ?? 'qaScore';
			if (filters.scoreMin !== null) {
				result = result.filter((r) => r[scoreField] >= filters.scoreMin!);
			}
			if (filters.scoreMax !== null) {
				result = result.filter((r) => r[scoreField] <= filters.scoreMax!);
			}
		}

		return result;
	}, [rows, filters]);

	const activeEvaluationType =
		MY_CALLS_EVALUATION_TYPES.find(
			(type) => type.value === filters.evaluationType
		) ?? MY_CALLS_EVALUATION_TYPES[0];

	/** Issue options grouped by aspect; narrowed to the selected aspect. */
	const issueOptions = CALL_ISSUE_ASPECTS.filter(
		(aspect) => filters.aspect === 'all' || aspect === filters.aspect
	).map((aspect) => ({
		group: t(`issues.aspect.${aspect}`),
		items: CALL_ISSUES.filter((issue) => issue.aspect === aspect).map(
			(issue) => ({
				value: issue.key,
				label: t(`issues.${issue.key}`),
			})
		),
	}));

	const columns: BaseTableColumnDef<AgentCallRow>[] = [
		helper.accessor('date', {
			header: t('myCalls.columns.date'),
			cell: (info) => {
				const row = info.row.original;
				return (
					<Stack gap={0}>
						<Text size='sm' fw={600}>
							{formatDateTime(info.getValue())}
						</Text>
						<Text size='xs' c='dimmed'>
							{row.campaignName}
						</Text>
					</Stack>
				);
			},
		}) as BaseTableColumnDef<AgentCallRow>,
		helper.accessor('durationSeconds', {
			header: t('myCalls.columns.duration'),
			size: 110,
			cell: (info) => <Text size='sm'>{formatSeconds(info.getValue())}</Text>,
		}) as BaseTableColumnDef<AgentCallRow>,
		helper.accessor('issues', {
			header: t('myCalls.columns.issues'),
			enableSorting: false,
			cell: (info) => {
				const row = info.row.original;
				const issues = info.getValue();
				const shown = issues.slice(0, MAX_ISSUE_BADGES);
				return (
					<div className={styles.issueCell}>
						{shown.map((key) => (
							<Badge
								key={key}
								size='sm'
								variant={key === 'auto-fail' ? 'filled' : 'light'}
								color={CALL_ISSUE_BY_KEY[key].color}
							>
								{key === 'auto-fail'
									? t('myCalls.autoFailCount', { count: row.autoFailCount })
									: t(`issues.${key}`)}
							</Badge>
						))}
						{issues.length > MAX_ISSUE_BADGES && (
							<Badge size='sm' variant='outline' color='gray'>
								{t('myCalls.moreIssues', {
									count: issues.length - MAX_ISSUE_BADGES,
								})}
							</Badge>
						)}
					</div>
				);
			},
		}) as BaseTableColumnDef<AgentCallRow>,
	];

	return (
		<ContentContainer
			contentWidth='full'
			title={t('myCalls.title')}
			description={t('myCalls.description')}
		>
			<Tabs value={tab} onChange={setTab} keepMounted={false}>
				<Tabs.List>
					<Tabs.Tab value='calls' leftSection={<IconPhone size={16} />}>
						{t('myCalls.tabs.calls')}
					</Tabs.Tab>
					<Tabs.Tab
						value='disputes'
						leftSection={<IconGitBranch size={16} />}
						rightSection={
							<Badge
								size='xs'
								variant='light'
								color={openDisputes > 0 ? 'orange' : 'gray'}
							>
								{openDisputes}
							</Badge>
						}
					>
						{t('myCalls.tabs.disputes')}
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='calls' pt='md'>
					<Stack gap='lg'>
						<SectionCard>
							<Group
								align='flex-end'
								gap='md'
								wrap='wrap'
								className={styles.filters}
							>
								<SegmentedControl
									value={filters.period}
									onChange={(value) =>
										setFilters((f) => ({
											...f,
											period: value as MyCallsPeriod,
											from: null,
											to: null,
										}))
									}
									data={MY_CALLS_PRESET_PERIODS.map((p) => ({
										value: p.value,
										label: t(p.labelKey),
									}))}
								/>
								<DateInput
									label={t('myCalls.filters.dateFrom')}
									placeholder={t('myCalls.filters.dateFrom')}
									value={filters.from}
									onChange={(value: string | null) => {
										const date = value ? new Date(value) : null;
										setFilters((f) => ({ ...f, from: date, period: 'all' }));
									}}
									clearable
									size='sm'
								/>
								<DateInput
									label={t('myCalls.filters.dateTo')}
									placeholder={t('myCalls.filters.dateTo')}
									value={filters.to}
									onChange={(value: string | null) => {
										const date = value ? new Date(value) : null;
										setFilters((f) => ({ ...f, to: date, period: 'all' }));
									}}
									clearable
									size='sm'
								/>
								<Select
									label={t('myCalls.filters.aspect')}
									value={filters.aspect}
									onChange={(value) => {
										const aspect = (value as CallIssueAspect | 'all') ?? 'all';
										setFilters((f) => ({
											...f,
											aspect,
											// Drop selected issues that no longer belong to the aspect.
											issues:
												aspect === 'all'
													? f.issues
													: f.issues.filter(
															(k) => CALL_ISSUE_BY_KEY[k].aspect === aspect
														),
										}));
									}}
									data={[
										{ value: 'all', label: t('issues.aspect.all') },
										...CALL_ISSUE_ASPECTS.map((a) => ({
											value: a,
											label: t(`issues.aspect.${a}`),
										})),
									]}
									allowDeselect={false}
									size='sm'
									w={190}
								/>
								<MultiSelect
									label={t('myCalls.filters.issues')}
									placeholder={
										filters.issues.length === 0
											? t('myCalls.filters.issuesPlaceholder')
											: undefined
									}
									data={issueOptions}
									value={filters.issues}
									onChange={(value) =>
										setFilters((f) => ({
											...f,
											issues: value as CallIssueKey[],
										}))
									}
									clearable
									searchable
									size='sm'
									w={320}
								/>
								<Select
									label={t('myCalls.filters.evaluationType')}
									value={filters.evaluationType}
									onChange={(value) =>
										setFilters((f) => ({
											...f,
											evaluationType: (value as MyCallsEvaluationType) ?? 'qa',
											// Each aspect scores on a different scale — clear the range
											// rather than carry over values that no longer make sense.
											scoreMin: null,
											scoreMax: null,
										}))
									}
									data={MY_CALLS_EVALUATION_TYPES.map((type) => ({
										value: type.value,
										label: t(type.labelKey),
									}))}
									allowDeselect={false}
									size='sm'
									w={180}
								/>
								<TextInput
									label={t('myCalls.filters.scoreMin')}
									type='number'
									placeholder={String(activeEvaluationType.min)}
									min={activeEvaluationType.min}
									max={activeEvaluationType.max}
									step={activeEvaluationType.step}
									value={filters.scoreMin ?? ''}
									onChange={(e) => {
										const value = e.currentTarget.value;
										setFilters((f) => ({
											...f,
											scoreMin: value ? Number(value) : null,
										}));
									}}
									size='sm'
									w={100}
								/>
								<TextInput
									label={t('myCalls.filters.scoreMax')}
									type='number'
									placeholder={String(activeEvaluationType.max)}
									min={activeEvaluationType.min}
									max={activeEvaluationType.max}
									step={activeEvaluationType.step}
									value={filters.scoreMax ?? ''}
									onChange={(e) => {
										const value = e.currentTarget.value;
										setFilters((f) => ({
											...f,
											scoreMax: value ? Number(value) : null,
										}));
									}}
									size='sm'
									w={100}
								/>
								<Button
									variant='subtle'
									leftSection={<IconX size={14} />}
									onClick={() => setFilters(DEFAULT_FILTERS)}
								>
									{t('myCalls.filters.clear')}
								</Button>
							</Group>
						</SectionCard>

						<SectionCard
							headerActions={
								<Text size='sm' c='dimmed'>
									{t('myCalls.rowsCount', { count: filteredRows.length })}
								</Text>
							}
						>
							<BaseTable<AgentCallRow>
								data={filteredRows}
								columns={columns}
								getRowId={(r) => r.id}
								initialSort={[{ id: 'date', desc: true }]}
								enablePagination
								showPaginationControls
								pageSize={10}
								density='compact'
								emptyMessage={t('myCalls.empty')}
								onRowClick={(r) =>
									navigate(
										`/qa/campaigns/${r.mockCampaignId}/calls/${r.callId}`
									)
								}
							/>
						</SectionCard>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value='disputes' pt='md'>
					<DisputeCasesContent />
				</Tabs.Panel>
			</Tabs>
		</ContentContainer>
	);
}
