import { useMemo } from 'react';
import { Group, Progress, SimpleGrid, Stack, Text } from '@mantine/core';
import { BarChart, DonutChart } from '@mantine/charts';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import { LMS_AREAS, LMS_AREA_META } from '../../constants';
import type { AssignmentRow } from '../../helpers';
import { isOverdue, today } from '../../helpers';
import { day } from '../../mockData';

interface TeamRow {
	team: string;
	assigned: number;
	completed: number;
	overdue: number;
	rate: number;
}

interface ContentRow {
	contentId: string;
	material: string;
	assigned: number;
	completed: number;
	improved: number;
}

const teamHelper = createColumnHelper<TeamRow>();
const contentHelper = createColumnHelper<ContentRow>();

export function ReportsTab({ rows }: { rows: AssignmentRow[] }) {
	const { t } = useTranslation('qa.lms');

	const recent = useMemo(() => rows.filter((r) => r.assignedAt >= day(today(), -30)), [rows]);

	const teamRows = useMemo<TeamRow[]>(() => {
		const map = new Map<string, TeamRow>();
		for (const r of recent) {
			const entry = map.get(r.team) ?? { team: r.team, assigned: 0, completed: 0, overdue: 0, rate: 0 };
			entry.assigned += 1;
			if (r.status === 'COMPLETED') entry.completed += 1;
			if (isOverdue(r)) entry.overdue += 1;
			map.set(r.team, entry);
		}
		return [...map.values()]
			.map((e) => ({ ...e, rate: e.assigned ? Math.round((e.completed / e.assigned) * 100) : 0 }))
			.sort((a, b) => a.team.localeCompare(b.team));
	}, [recent]);

	const chartData = teamRows.map((e) => ({
		team: e.team,
		completed: e.completed,
		overdue: e.overdue,
		open: Math.max(0, e.assigned - e.completed - e.overdue),
	}));

	const areaData = useMemo(
		() =>
			LMS_AREAS.map((area) => ({
				name: t(LMS_AREA_META[area].labelKey),
				value: recent.filter((r) => r.area === area && r.status === 'COMPLETED').length,
				color: `${LMS_AREA_META[area].color}.6`,
			})).filter((d) => d.value > 0),
		[recent, t]
	);

	const contentRows = useMemo<ContentRow[]>(() => {
		const map = new Map<string, ContentRow>();
		for (const r of recent) {
			const entry =
				map.get(r.contentId) ??
				{ contentId: r.contentId, material: r.contentTitle, assigned: 0, completed: 0, improved: 0 };
			entry.assigned += 1;
			if (r.status === 'COMPLETED') entry.completed += 1;
			if (r.impact?.verdict === 'IMPROVED') entry.improved += 1;
			map.set(r.contentId, entry);
		}
		return [...map.values()].sort((a, b) => b.assigned - a.assigned).slice(0, 8);
	}, [recent]);

	const funnel = useMemo(() => {
		const assigned = recent.length;
		const accepted = recent.filter(
			(r) => r.acceptance.status === 'ACCEPTED' || r.acceptance.status === 'NOT_REQUIRED'
		).length;
		const started = recent.filter((r) => r.startedAt !== null).length;
		const completed = recent.filter((r) => r.status === 'COMPLETED').length;
		const improved = recent.filter((r) => r.impact?.verdict === 'IMPROVED').length;
		return { assigned, accepted, started, completed, improved };
	}, [recent]);

	const teamColumns: BaseTableColumnDef<TeamRow>[] = [
		teamHelper.accessor('team', { header: t('manager.reports.columns.team') }) as BaseTableColumnDef<TeamRow>,
		teamHelper.accessor('assigned', { header: t('manager.reports.columns.assigned') }) as BaseTableColumnDef<TeamRow>,
		teamHelper.accessor('completed', { header: t('manager.reports.columns.completed') }) as BaseTableColumnDef<TeamRow>,
		teamHelper.accessor('overdue', {
			header: t('manager.reports.columns.overdue'),
			cell: (info) => (
				<Text size='sm' c={info.getValue() > 0 ? 'red' : undefined}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<TeamRow>,
		teamHelper.accessor('rate', {
			header: t('manager.reports.columns.rate'),
			cell: (info) => (
				<Group gap='xs' wrap='nowrap' w={140}>
					<Progress value={info.getValue()} size='sm' radius='xl' flex={1} />
					<Text size='xs'>{info.getValue()}%</Text>
				</Group>
			),
		}) as BaseTableColumnDef<TeamRow>,
	];

	const contentColumns: BaseTableColumnDef<ContentRow>[] = [
		contentHelper.accessor('material', { header: t('manager.reports.columns.material') }) as BaseTableColumnDef<ContentRow>,
		contentHelper.accessor('assigned', { header: t('manager.reports.columns.assigned') }) as BaseTableColumnDef<ContentRow>,
		contentHelper.accessor('completed', { header: t('manager.reports.columns.completed') }) as BaseTableColumnDef<ContentRow>,
		contentHelper.accessor('improved', {
			header: t('manager.reports.columns.improved'),
			cell: (info) => (
				<Text size='sm' c={info.getValue() > 0 ? 'green' : undefined}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<ContentRow>,
	];

	if (recent.length === 0) {
		return <EmptyState message={t('manager.reports.empty')} />;
	}

	const funnelRows: { label: string; value: number }[] = [
		{ label: t('manager.reports.funnel.assigned'), value: funnel.assigned },
		{ label: t('manager.reports.funnel.accepted'), value: funnel.accepted },
		{ label: t('manager.reports.funnel.started'), value: funnel.started },
		{ label: t('manager.reports.funnel.completed'), value: funnel.completed },
		{ label: t('manager.reports.funnel.improved'), value: funnel.improved },
	];

	return (
		<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
			<SectionCard
				title={t('manager.reports.byTeam')}
				description={t('manager.reports.period')}
			>
				<Stack gap='md'>
					<BarChart
						h={200}
						data={chartData}
						dataKey='team'
						type='stacked'
						series={[
							{ name: 'completed', label: t('manager.reports.series.completed'), color: 'green.6' },
							{ name: 'open', label: t('manager.reports.series.open'), color: 'blue.5' },
							{ name: 'overdue', label: t('manager.reports.series.overdue'), color: 'red.6' },
						]}
						withLegend
					/>
					<BaseTable<TeamRow>
						data={teamRows}
						columns={teamColumns}
						getRowId={(r) => r.team}
						density='compact'
						emptyMessage={t('manager.reports.empty')}
					/>
				</Stack>
			</SectionCard>

			<SectionCard title={t('manager.reports.byArea')} description={t('manager.reports.period')}>
				<Group justify='center' py='md'>
					<DonutChart data={areaData} size={200} thickness={28} withLabelsLine withTooltip />
				</Group>
			</SectionCard>

			<SectionCard title={t('manager.reports.byContent')} description={t('manager.reports.period')}>
				<BaseTable<ContentRow>
					data={contentRows}
					columns={contentColumns}
					getRowId={(r) => r.contentId}
					density='compact'
					emptyMessage={t('manager.reports.empty')}
				/>
			</SectionCard>

			<SectionCard title={t('manager.reports.acceptance')} description={t('manager.reports.period')}>
				<Stack gap='sm'>
					{funnelRows.map((row) => (
						<Stack key={row.label} gap={4}>
							<Group justify='space-between'>
								<Text size='sm'>{row.label}</Text>
								<Text size='sm' fw={600}>
									{row.value}
								</Text>
							</Group>
							<Progress
								value={funnel.assigned ? (row.value / funnel.assigned) * 100 : 0}
								size='md'
								radius='xl'
							/>
						</Stack>
					))}
				</Stack>
			</SectionCard>
		</SimpleGrid>
	);
}
