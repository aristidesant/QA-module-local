import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Table,
	Text,
	ThemeIcon,
	Title,
} from '@mantine/core';
import { AreaChart, BarChart } from '@mantine/charts';
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconMinus,
} from '@tabler/icons-react';
import type { SegmentMetricId, SegmentRow } from '~/modules/qa/analytics/types';
import {
	comparison,
	formatMetric,
	isImprovement,
} from '~/modules/qa/analytics/helpers';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
import type { ReportSectionData } from '../../buildReportData';
import KpiTiles from './KpiTiles';
import styles from '../../Reports.module.css';

const MAX_CHART_BARS = 8;

interface ReportSectionProps {
	section: ReportSectionData;
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

	const higherIsBetter = METRIC_BY_ID[metricId]?.higherIsBetter ?? true;
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

/** One block of the document, rendered the way the recipient will see it. */
export const ReportSection: React.FC<ReportSectionProps> = ({
	section,
	compare,
}) => {
	const { t } = useTranslation('qa.reports');
	const { t: tMetrics } = useTranslation('qa.teamAnalytics');

	const metricLabel = (metricId: string) =>
		tMetrics(`metrics.${metricId}`, { defaultValue: metricId });

	const empty = (
		<Text size='sm' c='dimmed'>
			{t('preview.noData')}
		</Text>
	);

	const segmentTable = (
		rows: SegmentRow[],
		metricIds: SegmentMetricId[],
		primary: SegmentMetricId
	) =>
		rows.length === 0 ? (
			empty
		) : (
			<div className={styles.tableScroll}>
				<Table striped withTableBorder verticalSpacing='xs' miw={640}>
					<Table.Thead>
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
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{rows.map((row) => (
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
						))}
					</Table.Tbody>
				</Table>
			</div>
		);

	const body = () => {
		switch (section.key) {
			case 'overview':
				return (
					<Stack gap='md'>
						<KpiTiles
							kpis={section.kpis}
							previous={section.previous}
							compare={compare}
						/>
						{section.series.length > 0 && (
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
						)}
					</Stack>
				);

			case 'qa':
			case 'compliance':
			case 'sentiment':
			case 'business': {
				const bars = section.rows.slice(0, MAX_CHART_BARS).map((row) => ({
					segment: row.label,
					value: row.metrics[section.primary] ?? 0,
				}));
				return (
					<Stack gap='md'>
						{bars.length > 0 && (
							<BarChart
								h={200}
								data={bars}
								dataKey='segment'
								series={[
									{
										name: 'value',
										label: metricLabel(section.primary),
										color: 'blue.6',
									},
								]}
							/>
						)}
						{segmentTable(section.rows, section.metricIds, section.primary)}
					</Stack>
				);
			}

			case 'campaigns':
			case 'agents':
				return segmentTable(section.rows, section.metricIds, section.primary);

			case 'coaching':
				return (
					<Stack gap='md'>
						<SimpleGrid cols={{ base: 3 }} spacing='sm'>
							<Tile
								label={t('preview.tiles.sessions')}
								value={section.sessions}
							/>
							<Tile
								label={t('preview.tiles.completed')}
								value={section.completed}
							/>
							<Tile
								label={t('preview.tiles.overdue')}
								value={section.overdue}
							/>
						</SimpleGrid>
						{section.rows.length === 0 ? (
							empty
						) : (
							<div className={styles.tableScroll}>
								<Table striped withTableBorder verticalSpacing='xs'>
									<Table.Thead>
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
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{section.rows.map((row) => (
											<Table.Tr key={row.agentName}>
												<Table.Td>{row.agentName}</Table.Td>
												<Table.Td className={styles.numeric}>
													{row.sessions}
												</Table.Td>
												<Table.Td className={styles.numeric}>
													{row.assignments}
												</Table.Td>
												<Table.Td className={styles.numeric}>
													{row.completed}
												</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</div>
						)}
					</Stack>
				);

			case 'disputes':
				return (
					<Stack gap='md'>
						<SimpleGrid cols={{ base: 2, sm: 4 }} spacing='sm'>
							<Tile label={t('preview.tiles.open')} value={section.open} />
							<Tile
								label={t('preview.tiles.accepted')}
								value={section.accepted}
							/>
							<Tile
								label={t('preview.tiles.rejected')}
								value={section.rejected}
							/>
							<Tile
								label={t('preview.tiles.acceptanceRate')}
								value={
									section.acceptanceRate === null
										? '—'
										: `${section.acceptanceRate}%`
								}
							/>
						</SimpleGrid>
						{section.rows.length === 0 ? (
							empty
						) : (
							<div className={styles.tableScroll}>
								<Table striped withTableBorder verticalSpacing='xs' miw={560}>
									<Table.Thead>
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
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{section.rows.map((dispute) => (
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
										))}
									</Table.Tbody>
								</Table>
							</div>
						)}
					</Stack>
				);

			case 'burnout':
				return section.rows.length === 0 ? (
					empty
				) : (
					<div className={styles.tableScroll}>
						<Table striped withTableBorder verticalSpacing='xs'>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('preview.columns.agent')}</Table.Th>
									<Table.Th>{t('preview.columns.level')}</Table.Th>
									<Table.Th className={styles.numeric}>
										{t('preview.columns.risk')}
									</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{section.rows.map((row) => (
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
										<Table.Td className={styles.numeric}>
											{row.percentage}%
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</div>
				);

			case 'rankings':
				return section.rows.length === 0 ? (
					empty
				) : (
					<div className={styles.tableScroll}>
						<Table striped withTableBorder verticalSpacing='xs' miw={560}>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('preview.columns.program')}</Table.Th>
									<Table.Th>{t('preview.columns.status')}</Table.Th>
									<Table.Th>{t('preview.columns.periodCol')}</Table.Th>
									<Table.Th>{t('preview.columns.leader')}</Table.Th>
									<Table.Th>{t('preview.columns.winner')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{section.rows.map((row) => (
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
								))}
							</Table.Tbody>
						</Table>
					</div>
				);
		}
	};

	return (
		<Stack gap='sm' className={styles.section}>
			<Title order={4}>{t(`sections.items.${section.key}.label`)}</Title>
			{body()}
		</Stack>
	);
};

export default ReportSection;
