import React from 'react';
import type { TFunction } from 'i18next';
import {
	Badge,
	Group,
	Paper,
	SimpleGrid,
	Table,
	Text,
	ThemeIcon,
	Title,
} from '@mantine/core';
import { AreaChart, BarChart, LineChart } from '@mantine/charts';
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconMinus,
} from '@tabler/icons-react';
import type { SegmentMetricId, SegmentRow } from '~/modules/qa/analytics/types';
import { MAX_LINE_SERIES } from '~/modules/qa/analytics/constants';
import {
	comparison,
	formatMetric,
	isImprovement,
	metricMeta,
} from '~/modules/qa/analytics/helpers';
import { formatPeriod } from '~/modules/qa/analytics/TeamAnalyticsPage/charts/format';
import type {
	ReportSectionData,
	SectionTable,
	SubsectionBlock,
} from '../../buildReportData';
import { REPORT_LINE_COLORS } from '../../constants';
import KpiTiles from './KpiTiles';
import type { FlowItem, FlowRow } from './pagination';
import styles from '../../Reports.module.css';

/** Horizontal bars per flow block, so a long ranking can break between pages. */
const BARS_PER_BLOCK = 15;
/** Small-multiple panels per row at the Letter content width. */
const PANELS_PER_ROW = 3;
const SERIES_BLUE = 'blue.6';

/** Y domain of a metric so panels and bars of one subsection share a scale. */
const domainOf = (
	metricId: SegmentMetricId
): [number | 'auto', number | 'auto'] => {
	const { unit } = metricMeta(metricId);
	return unit === 'PERCENT'
		? [0, 100]
		: unit === 'SCORE_5'
			? [1, 5]
			: unit === 'NPS'
				? [-100, 100]
				: [0, 'auto'];
};

/** What the section builders need to produce the flow of one section. */
export interface FlowContext {
	t: TFunction<'qa.reports'>;
	tMetrics: TFunction<'qa.teamAnalytics'>;
	/** Render period-over-period columns and arrows. */
	compare: boolean;
}

/** Small tile used by the coaching and disputes summaries. */
const Tile: React.FC<{ label: string; value: React.ReactNode }> = ({
	label,
	value,
}) => (
	<Paper withBorder radius='md' p='sm'>
		<Text size='xs' c='dimmed' tt='uppercase' fw={600} lineClamp={1}>
			{label}
		</Text>
		<Text size='xl' fw={700} mt={4}>
			{value}
		</Text>
	</Paper>
);

/** Arrow and absolute change of a value against the previous period; a dash when either side is missing. */
const ChangeArrow: React.FC<{
	current: number | null;
	previous: number | null;
	metricId: SegmentMetricId;
}> = ({ current, previous, metricId }) => {
	const cmp = comparison(current, previous);
	if (cmp.trend === 'UNAVAILABLE') {
		return (
			<Text size='xs' c='dimmed'>
				—
			</Text>
		);
	}
	const good = isImprovement(cmp, metricMeta(metricId).higherIsBetter);
	const Icon =
		cmp.trend === 'UP'
			? IconArrowUpRight
			: cmp.trend === 'DOWN'
				? IconArrowDownRight
				: IconMinus;
	return (
		<Group gap={4} wrap='nowrap'>
			<ThemeIcon
				size='xs'
				variant='light'
				color={good === null ? 'gray' : good ? 'green' : 'red'}
			>
				<Icon size={12} />
			</ThemeIcon>
			<Text size='xs' c='dimmed'>
				{Math.abs(cmp.absoluteChange ?? 0)}
			</Text>
		</Group>
	);
};

/** Period-over-period arrow for the primary metric of a segment row. */
const ChangeCell: React.FC<{
	row: SegmentRow;
	metricId: SegmentMetricId;
}> = ({ row, metricId }) => {
	const cmp = comparison(
		row.metrics[metricId] ?? null,
		row.previous[metricId] ?? null
	);
	if (cmp.trend === 'UNAVAILABLE') {
		return (
			<Text size='sm' c='dimmed'>
				—
			</Text>
		);
	}

	const higherIsBetter = metricMeta(metricId).higherIsBetter;
	const good = isImprovement(cmp, higherIsBetter);
	const Icon =
		cmp.trend === 'UP'
			? IconArrowUpRight
			: cmp.trend === 'DOWN'
				? IconArrowDownRight
				: IconMinus;

	return (
		<Group gap={4} justify='flex-end' wrap='nowrap'>
			<Text size='sm'>{Math.abs(cmp.absoluteChange ?? 0)}</Text>
			<ThemeIcon
				size='xs'
				variant='light'
				color={good === null ? 'gray' : good ? 'green' : 'red'}
			>
				<Icon size={12} />
			</ThemeIcon>
		</Group>
	);
};

/**
 * One section of the document as flow items: a title that stays with what follows, then its
 * atomic blocks (tiles, charts) and its tables, which the paginator may split between pages.
 */
export function sectionFlowItems(
	section: ReportSectionData,
	ctx: FlowContext
): FlowItem[] {
	const { t, tMetrics, compare } = ctx;
	const label = t(`sections.items.${section.key}.label`);
	const metricLabel = (metricId: string) =>
		tMetrics(`metrics.${metricId}`, { defaultValue: metricId });

	const items: FlowItem[] = [
		{
			kind: 'block',
			id: `${section.key}:title`,
			keepWithNext: true,
			node: (
				<Title order={4} className={styles.sectionTitle}>
					{label}
				</Title>
			),
		},
	];
	const block = (part: string, node: React.ReactNode, keepWithNext = false) =>
		items.push({
			kind: 'block',
			id: `${section.key}:${part}`,
			node,
			...(keepWithNext ? { keepWithNext: true } : {}),
		});
	const table = (part: string, head: React.ReactNode, rows: FlowRow[]) =>
		items.push({
			kind: 'table',
			id: `${section.key}:${part}`,
			title: label,
			head,
			rows,
		});
	const empty = (part = 'empty') =>
		block(
			part,
			<Text size='sm' c='dimmed'>
				{t('preview.noData')}
			</Text>
		);

	const segmentTable = (
		rows: SegmentRow[],
		metricIds: SegmentMetricId[],
		primary: SegmentMetricId,
		part = 'table'
	) => {
		if (rows.length === 0) {
			empty(`${part}:empty`);
			return;
		}
		table(
			part,
			<Table.Tr>
				<Table.Th>{t('preview.columns.segment')}</Table.Th>
				<Table.Th className={styles.numeric}>
					{t('preview.columns.calls')}
				</Table.Th>
				{metricIds.map((metricId) => (
					<Table.Th key={metricId} className={styles.numeric}>
						{metricLabel(metricId)}
					</Table.Th>
				))}
				{compare && (
					<Table.Th className={styles.numeric}>
						{t('preview.columns.change')}
					</Table.Th>
				)}
			</Table.Tr>,
			rows.map((row) => ({
				id: row.key,
				node: (
					<Table.Tr key={row.key}>
						<Table.Td>
							<Text size='sm' fw={500}>
								{row.label}
							</Text>
						</Table.Td>
						<Table.Td className={styles.numeric}>{row.calls}</Table.Td>
						{metricIds.map((metricId) => (
							<Table.Td key={metricId} className={styles.numeric}>
								{formatMetric(metricId, row.metrics[metricId] ?? null)}
							</Table.Td>
						))}
						{compare && (
							<Table.Td className={styles.numeric}>
								<ChangeCell row={row} metricId={primary} />
							</Table.Td>
						)}
					</Table.Tr>
				),
			}))
		);
	};

	/** The chart of one subsection, when its view asks for one. The values table always follows. */
	const segmentChart = (blk: SubsectionBlock, rows: SegmentRow[]) => {
		if (rows.length === 0) return;
		const metric = metricLabel(blk.primary);
		const domain = domainOf(blk.primary);

		if (blk.view === 'bar') {
			// Horizontal, every segment, in chunks so a long ranking can break between pages.
			for (let i = 0; i < rows.length; i += BARS_PER_BLOCK) {
				const chunk = rows.slice(i, i + BARS_PER_BLOCK);
				block(
					`${blk.sub}:chart:${i}`,
					<BarChart
						h={chunk.length * 28 + 32}
						data={chunk.map((row) => ({
							label: row.label,
							value: row.metrics[blk.primary] ?? 0,
						}))}
						dataKey='label'
						orientation='vertical'
						series={[{ name: 'value', label: metric, color: SERIES_BLUE }]}
						withBarValueLabel
						valueFormatter={(value) => formatMetric(blk.primary, value)}
						barProps={{ radius: 4 }}
						gridAxis='x'
						tickLine='none'
						yAxisProps={{ width: 140 }}
						xAxisProps={{ domain }}
					/>
				);
			}
			return;
		}

		const lines = blk.lines;

		// Many segments: one small panel each, three per row, on the same scale.
		if (lines && lines.keys.length > MAX_LINE_SERIES) {
			for (let i = 0; i < lines.keys.length; i += PANELS_PER_ROW) {
				const keys = lines.keys.slice(i, i + PANELS_PER_ROW);
				block(
					`${blk.sub}:multiples:${i}`,
					<div>
						{i === 0 && (
							<Text size='xs' c='dimmed' mb={6}>
								{t('preview.multiplesOf', { metric })}
							</Text>
						)}
						<SimpleGrid cols={PANELS_PER_ROW} spacing='sm'>
							{keys.map((entry) => (
								<Paper key={entry.key} withBorder p='xs' radius='md'>
									<Group justify='space-between' wrap='nowrap' gap='xs'>
										<Text size='xs' fw={600} lineClamp={1}>
											{entry.label}
										</Text>
										<Text size='xs' fw={600}>
											{formatMetric(blk.primary, entry.current)}
										</Text>
									</Group>
									{compare && (
										<ChangeArrow
											current={entry.current}
											previous={entry.previous}
											metricId={blk.primary}
										/>
									)}
									<LineChart
										h={80}
										data={lines.points.map((point) => ({
											period: point.period,
											value:
												typeof point[entry.key] === 'number'
													? (point[entry.key] as number)
													: null,
										}))}
										dataKey='period'
										series={[
											{ name: 'value', label: entry.label, color: SERIES_BLUE },
										]}
										curveType='monotone'
										withDots={false}
										withXAxis={false}
										withYAxis={false}
										withTooltip={false}
										gridAxis='none'
										connectNulls
										yAxisProps={{ domain }}
									/>
								</Paper>
							))}
						</SimpleGrid>
					</div>
				);
			}
			return;
		}

		// Few segments: one line each; ungrouped: current against the previous period.
		const series = lines
			? lines.keys.map((entry, index) => ({
					name: entry.key,
					label: entry.label,
					color: REPORT_LINE_COLORS[index % REPORT_LINE_COLORS.length],
				}))
			: [
					{ name: 'current', label: t('preview.current'), color: SERIES_BLUE },
					...(compare
						? [
								{
									name: 'previous',
									label: t('preview.previous'),
									color: 'gray.5',
								},
							]
						: []),
				];
		const data = lines ? lines.points : (blk.series ?? []);
		if (data.length === 0 || series.length === 0) return;

		block(
			`${blk.sub}:chart`,
			<div>
				<Text size='xs' c='dimmed' mb={6}>
					{lines
						? t('preview.linesOf', { metric, count: series.length })
						: t('preview.trendOf', { metric })}
				</Text>
				<LineChart
					h={200}
					data={data}
					dataKey='period'
					series={series}
					curveType='monotone'
					withDots={false}
					connectNulls
					gridAxis='y'
					tickLine='none'
					withLegend={series.length > 1}
					valueFormatter={(value) => formatMetric(blk.primary, value)}
					yAxisProps={{ domain, width: 48 }}
					xAxisProps={{ tickFormatter: formatPeriod, minTickGap: 24 }}
				/>
			</div>
		);
	};

	/** The charts of the subsections that asked for one, each under its subtitle, then the section's one table. */
	const subsectionBlocks = (
		key: Extract<ReportSectionData, { blocks: SubsectionBlock[] }>['key'],
		blocks: SubsectionBlock[],
		tbl: SectionTable
	) => {
		for (const blk of blocks) {
			block(
				`${blk.sub}:title`,
				<Text fw={600} size='sm'>
					{t(`sections.subsections.${key}.${blk.sub}`)}
				</Text>,
				true
			);
			segmentChart(blk, tbl.rows);
		}
		segmentTable(tbl.rows, tbl.metricIds, tbl.primary);
	};

	switch (section.key) {
		case 'overview':
			block(
				'tiles',
				<KpiTiles
					kpis={section.kpis}
					previous={section.previous}
					compare={compare}
				/>
			);
			if (section.view === 'line' && section.series.length > 0) {
				block(
					'trend',
					<div>
						<Text size='xs' c='dimmed' mb={6}>
							{t('preview.trend')}
						</Text>
						<AreaChart
							h={200}
							data={section.series}
							dataKey='period'
							withDots={false}
							series={[
								{
									name: 'current',
									label: t('preview.current'),
									color: 'blue.6',
								},
								...(compare
									? [
											{
												name: 'previous',
												label: t('preview.previous'),
												color: 'gray.5',
											},
										]
									: []),
							]}
						/>
					</div>
				);
			}
			break;

		case 'qa':
		case 'compliance':
		case 'sentiment':
		case 'business':
		case 'surveys':
		case 'campaigns':
		case 'agents':
			subsectionBlocks(section.key, section.blocks, section.table);
			break;

		case 'coaching':
			block(
				'tiles',
				<SimpleGrid cols={3} spacing='sm'>
					<Tile label={t('preview.tiles.sessions')} value={section.sessions} />
					<Tile
						label={t('preview.tiles.completed')}
						value={section.completed}
					/>
					<Tile label={t('preview.tiles.overdue')} value={section.overdue} />
				</SimpleGrid>
			);
			if (section.rows.length === 0) {
				empty();
				break;
			}
			table(
				'table',
				<Table.Tr>
					<Table.Th>{t('preview.columns.agent')}</Table.Th>
					<Table.Th className={styles.numeric}>
						{t('preview.columns.sessions')}
					</Table.Th>
					<Table.Th className={styles.numeric}>
						{t('preview.columns.assignments')}
					</Table.Th>
					<Table.Th className={styles.numeric}>
						{t('preview.columns.completed')}
					</Table.Th>
				</Table.Tr>,
				section.rows.map((row) => ({
					id: row.agentName,
					node: (
						<Table.Tr key={row.agentName}>
							<Table.Td>{row.agentName}</Table.Td>
							<Table.Td className={styles.numeric}>{row.sessions}</Table.Td>
							<Table.Td className={styles.numeric}>{row.assignments}</Table.Td>
							<Table.Td className={styles.numeric}>{row.completed}</Table.Td>
						</Table.Tr>
					),
				}))
			);
			break;

		case 'disputes':
			block(
				'tiles',
				<SimpleGrid cols={4} spacing='sm'>
					<Tile label={t('preview.tiles.open')} value={section.open} />
					<Tile label={t('preview.tiles.accepted')} value={section.accepted} />
					<Tile label={t('preview.tiles.rejected')} value={section.rejected} />
					<Tile
						label={t('preview.tiles.acceptanceRate')}
						value={
							section.acceptanceRate === null
								? '—'
								: `${section.acceptanceRate}%`
						}
					/>
				</SimpleGrid>
			);
			if (section.rows.length === 0) {
				empty();
				break;
			}
			table(
				'table',
				<Table.Tr>
					<Table.Th>{t('preview.columns.id')}</Table.Th>
					<Table.Th>{t('preview.columns.agent')}</Table.Th>
					<Table.Th>{t('preview.columns.type')}</Table.Th>
					<Table.Th>{t('preview.columns.status')}</Table.Th>
					<Table.Th className={styles.numeric}>
						{t('preview.columns.scoreBefore')}
					</Table.Th>
					<Table.Th className={styles.numeric}>
						{t('preview.columns.scoreAfter')}
					</Table.Th>
				</Table.Tr>,
				section.rows.map((dispute) => ({
					id: dispute.id,
					node: (
						<Table.Tr key={dispute.id}>
							<Table.Td>{dispute.id}</Table.Td>
							<Table.Td>{dispute.agentName}</Table.Td>
							<Table.Td>{dispute.evaluationType}</Table.Td>
							<Table.Td>
								<Badge
									size='sm'
									variant='light'
									tt='none'
									color={
										dispute.status === 'accepted'
											? 'green'
											: dispute.status === 'rejected'
												? 'red'
												: 'blue'
									}
								>
									{dispute.status}
								</Badge>
							</Table.Td>
							<Table.Td className={styles.numeric}>
								{dispute.scoreBefore ?? '—'}
							</Table.Td>
							<Table.Td className={styles.numeric}>
								{dispute.scoreAfter ?? '—'}
							</Table.Td>
						</Table.Tr>
					),
				}))
			);
			break;

		case 'burnout':
			if (section.rows.length === 0) {
				empty();
				break;
			}
			table(
				'table',
				<Table.Tr>
					<Table.Th>{t('preview.columns.agent')}</Table.Th>
					<Table.Th>{t('preview.columns.level')}</Table.Th>
					<Table.Th className={styles.numeric}>
						{t('preview.columns.risk')}
					</Table.Th>
				</Table.Tr>,
				section.rows.map((row) => ({
					id: row.agentName,
					node: (
						<Table.Tr key={row.agentName}>
							<Table.Td>{row.agentName}</Table.Td>
							<Table.Td>
								<Badge
									size='sm'
									variant='light'
									tt='none'
									color={row.level === 'high' ? 'red' : 'orange'}
								>
									{row.level}
								</Badge>
							</Table.Td>
							<Table.Td className={styles.numeric}>{row.percentage}%</Table.Td>
						</Table.Tr>
					),
				}))
			);
			break;

		case 'rankings':
			if (section.rows.length === 0) {
				empty();
				break;
			}
			table(
				'table',
				<Table.Tr>
					<Table.Th>{t('preview.columns.program')}</Table.Th>
					<Table.Th>{t('preview.columns.status')}</Table.Th>
					<Table.Th>{t('preview.columns.periodCol')}</Table.Th>
					<Table.Th>{t('preview.columns.leader')}</Table.Th>
					<Table.Th>{t('preview.columns.winner')}</Table.Th>
				</Table.Tr>,
				section.rows.map((row) => ({
					id: row.name,
					node: (
						<Table.Tr key={row.name}>
							<Table.Td>{row.name}</Table.Td>
							<Table.Td>
								<Badge size='sm' variant='light' tt='none'>
									{row.status}
								</Badge>
							</Table.Td>
							<Table.Td>{row.period}</Table.Td>
							<Table.Td>{row.leader ?? '—'}</Table.Td>
							<Table.Td>{row.winner ?? '—'}</Table.Td>
						</Table.Tr>
					),
				}))
			);
			break;
	}

	return items;
}
