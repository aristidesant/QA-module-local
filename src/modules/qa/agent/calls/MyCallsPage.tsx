import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/react-table';
import {
	Badge,
	Button,
	Group,
	SegmentedControl,
	Stack,
	Switch,
	Text,
	TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconX } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer';
import { SectionCard } from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import { AGENT_PERSONA_ID, NOW_ISO } from '~/modules/qa/team/constants';
import { formatDateTime, formatSeconds } from '~/modules/qa/team/helpers';
import { buildAgentCalls } from '~/modules/qa/calls/helpers';
import {
	MY_CALLS_PERIODS,
	type MyCallsPeriod,
} from '~/modules/qa/calls/constants';
import type { AgentCallRow } from '~/modules/qa/calls/types';
import styles from './MyCallsPage.module.css';

const helper = createColumnHelper<AgentCallRow>();

interface FiltersState {
	period: MyCallsPeriod;
	from: Date | null;
	to: Date | null;
	autoFailOnly: boolean;
	scoreMin: number | null;
	scoreMax: number | null;
}

const DEFAULT_FILTERS: FiltersState = {
	period: '30d',
	from: null,
	to: null,
	autoFailOnly: false,
	scoreMin: null,
	scoreMax: null,
};

export default function MyCallsPage() {
	const { t } = useTranslation('qa.calls');
	const navigate = useNavigate();
	const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);

	const rows = useMemo(() => buildAgentCalls(AGENT_PERSONA_ID), []);

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

		if (filters.autoFailOnly) {
			result = result.filter((r) => r.autoFail);
		}

		if (filters.scoreMin !== null) {
			result = result.filter((r) => r.qaScore >= filters.scoreMin!);
		}
		if (filters.scoreMax !== null) {
			result = result.filter((r) => r.qaScore <= filters.scoreMax!);
		}

		return result;
	}, [rows, filters]);

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
			cell: (info) => <Text size='sm'>{formatSeconds(info.getValue())}</Text>,
		}) as BaseTableColumnDef<AgentCallRow>,
		helper.accessor('autoFailCount', {
			header: t('myCalls.columns.autoFails'),
			cell: (info) => {
				const row = info.row.original;
				return row.autoFail ? (
					<Badge color='red' variant='filled'>
						{t('myCalls.autoFailCount', { count: info.getValue() })}
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>
						{t('myCalls.autoFailNone')}
					</Text>
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
							data={MY_CALLS_PERIODS.map((p) => ({
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
						<TextInput
							label={t('myCalls.filters.scoreMin')}
							type='number'
							placeholder='0'
							min={0}
							max={100}
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
							placeholder='100'
							min={0}
							max={100}
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
						<Switch
							label={t('myCalls.filters.autoFailOnly')}
							checked={filters.autoFailOnly}
							onChange={(e) =>
								setFilters((f) => ({
									...f,
									autoFailOnly: e.currentTarget.checked,
								}))
							}
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
						pageSize={15}
						density='compact'
						emptyMessage={t('myCalls.empty')}
						onRowClick={(r) =>
							navigate(`/qa/campaigns/${r.mockCampaignId}/calls/${r.callId}`)
						}
					/>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
}
