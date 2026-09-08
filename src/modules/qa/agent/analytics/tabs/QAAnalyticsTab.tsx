import React, { useMemo } from 'react';
import {
	Stack,
	Group,
	Text,
	Badge,
	Table,
	Paper,
	Grid,
	Center,
	useMantineTheme,
} from '@mantine/core';
import { LineChart, PieChart, Tooltip, Legend, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import SectionCard from '~/components/SectionCard';
import { IconTrendingUp, IconAlertCircle } from '@tabler/icons-react';
import type { AggregatedMetrics } from '~/modules/qa/dashboard/mockData';
import styles from './QAAnalyticsTab.module.css';

export interface QAAnalyticsTabProps {
	aggregated: AggregatedMetrics[];
}


interface SummaryCardProps {
	title: string;
	value: number;
	severity: 'good' | 'warning' | 'critical';
	icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, severity }) => {
	const getBadgeColor = () => {
		switch (severity) {
			case 'good':
				return 'green';
			case 'warning':
				return 'yellow';
			case 'critical':
				return 'red';
			default:
				return 'blue';
		}
	};

	return (
		<Paper
			p='lg'
			radius='md'
			withBorder
			className={styles.summaryCard}
			data-severity={severity}
		>
			<Stack gap='xs'>
				<Group justify='space-between' align='flex-start'>
					<Text size='sm' fw={600} c='dimmed' tt='uppercase'>
						{title}
					</Text>
					{value === 0 ? (
						<Badge size='sm' variant='light' color='green'>
							Good
						</Badge>
					) : (
						<Badge size='sm' variant='light' color={getBadgeColor()}>
							{severity}
						</Badge>
					)}
				</Group>
				<Text size='xl' fw={700}>
					{value}
				</Text>
			</Stack>
		</Paper>
	);
};

const QAAnalyticsTab: React.FC<QAAnalyticsTabProps> = ({ aggregated }) => {
	const theme = useMantineTheme();

	// Get error colors from theme
	const ERROR_COLORS = {
		ECN: theme.colors.red[6],
		ENC: theme.colors.orange[6],
		ECC: theme.colors.violet[6],
		ECUF: theme.colors.yellow[6],
	};

	// Calculate summary metrics
	const summary = useMemo(() => {
		if (aggregated.length === 0) {
			return {
				ecnCount: 0,
				encCount: 0,
				eccCount: 0,
				ecufCount: 0,
				totalErrors: 0,
			};
		}

		const ecnCount = aggregated.reduce((sum, m) => sum + m.totalErrorsECN, 0);
		const encCount = aggregated.reduce((sum, m) => sum + m.totalErrorsENC, 0);
		const eccCount = aggregated.reduce((sum, m) => sum + m.totalErrorsECC, 0);
		const ecufCount = aggregated.reduce((sum, m) => sum + m.totalErrorsECUF, 0);
		const totalErrors = ecnCount + encCount + eccCount + ecufCount;

		return {
			ecnCount,
			encCount,
			eccCount,
			ecufCount,
			totalErrors,
		};
	}, [aggregated]);

	// Prepare trend chart data
	const trendData = useMemo(() => {
		return aggregated.map((metric) => ({
			date: new Date(metric.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
			ECN: metric.totalErrorsECN,
			ENC: metric.totalErrorsENC,
			ECC: metric.totalErrorsECC,
			ECUF: metric.totalErrorsECUF,
			timestamp: metric.timestamp,
		}));
	}, [aggregated]);

	// Prepare distribution data
	const distributionData = useMemo(() => {
		const total = summary.totalErrors || 1; // Avoid division by zero
		return [
			{ name: 'ECN', value: summary.ecnCount, percentage: ((summary.ecnCount / total) * 100).toFixed(1) },
			{ name: 'ENC', value: summary.encCount, percentage: ((summary.encCount / total) * 100).toFixed(1) },
			{ name: 'ECC', value: summary.eccCount, percentage: ((summary.eccCount / total) * 100).toFixed(1) },
			{ name: 'ECUF', value: summary.ecufCount, percentage: ((summary.ecufCount / total) * 100).toFixed(1) },
		];
	}, [summary]);

	// Prepare breakdown table data (top 10 errors by frequency)
	const breakdownData = useMemo(() => {
		const breakdown: Array<{
			id: string;
			date: string;
			errorType: string;
			callCount: number;
			severity: 'low' | 'medium' | 'high' | 'critical';
		}> = [];

		aggregated.forEach((metric, index) => {
			const date = new Date(metric.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

			if (metric.totalErrorsECN > 0) {
				breakdown.push({
					id: `${index}-ecn`,
					date,
					errorType: 'ECN',
					callCount: metric.totalErrorsECN,
					severity: metric.totalErrorsECN > 2 ? 'critical' : 'high',
				});
			}
			if (metric.totalErrorsENC > 0) {
				breakdown.push({
					id: `${index}-enc`,
					date,
					errorType: 'ENC',
					callCount: metric.totalErrorsENC,
					severity: metric.totalErrorsENC > 2 ? 'high' : 'medium',
				});
			}
			if (metric.totalErrorsECC > 0) {
				breakdown.push({
					id: `${index}-ecc`,
					date,
					errorType: 'ECC',
					callCount: metric.totalErrorsECC,
					severity: metric.totalErrorsECC > 1 ? 'medium' : 'low',
				});
			}
			if (metric.totalErrorsECUF > 0) {
				breakdown.push({
					id: `${index}-ecuf`,
					date,
					errorType: 'ECUF',
					callCount: metric.totalErrorsECUF,
					severity: metric.totalErrorsECUF > 2 ? 'high' : 'medium',
				});
			}
		});

		// Sort by frequency and take top 10
		return breakdown.sort((a, b) => b.callCount - a.callCount).slice(0, 10);
	}, [aggregated]);

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case 'critical':
				return 'red';
			case 'high':
				return 'orange';
			case 'medium':
				return 'yellow';
			case 'low':
				return 'blue';
			default:
				return 'gray';
		}
	};

	return (
		<Stack gap='lg'>
			{/* Summary Cards Row */}
			<SectionCard title='Error Summary' description='High-level overview of all error types' icon={IconAlertCircle}>
				<Grid gap='md'>
					<Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
						<SummaryCard
							title='ECN'
							value={summary.ecnCount}
							severity={summary.ecnCount > 0 ? 'critical' : 'good'}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
						<SummaryCard
							title='ENC'
							value={summary.encCount}
							severity={summary.encCount > 0 ? 'warning' : 'good'}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
						<SummaryCard
							title='ECC'
							value={summary.eccCount}
							severity={summary.eccCount > 0 ? 'warning' : 'good'}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
						<SummaryCard
							title='ECUF'
							value={summary.ecufCount}
							severity={summary.ecufCount > 0 ? 'warning' : 'good'}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
						<SummaryCard
							title='Total Errors'
							value={summary.totalErrors}
							severity={summary.totalErrors > 5 ? 'critical' : summary.totalErrors > 0 ? 'warning' : 'good'}
						/>
					</Grid.Col>
				</Grid>
			</SectionCard>

			{/* Trend Chart */}
			{trendData.length > 0 && (
				<SectionCard title='Error Trends' description='Error rates over time' icon={IconTrendingUp}>
					<div className={styles.chartContainer}>
						<ResponsiveContainer width='100%' height={300}>
							<LineChart
								data={trendData}
								margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray='3 3' stroke='var(--mantine-color-gray-2)' />
								<XAxis dataKey='date' stroke='var(--mantine-color-gray-6)' />
								<YAxis stroke='var(--mantine-color-gray-6)' />
								<Tooltip
									contentStyle={{
										backgroundColor: 'var(--mantine-color-gray-0)',
										border: '1px solid var(--mantine-color-gray-3)',
										borderRadius: 'var(--mantine-radius-md)',
									}}
								/>
								<Legend />
								<Line
									type='monotone'
									dataKey='ECN'
									stroke={ERROR_COLORS.ECN}
									dot={false}
									strokeWidth={2}
								/>
								<Line
									type='monotone'
									dataKey='ENC'
									stroke={ERROR_COLORS.ENC}
									dot={false}
									strokeWidth={2}
								/>
								<Line
									type='monotone'
									dataKey='ECC'
									stroke={ERROR_COLORS.ECC}
									dot={false}
									strokeWidth={2}
								/>
								<Line
									type='monotone'
									dataKey='ECUF'
									stroke={ERROR_COLORS.ECUF}
									dot={false}
									strokeWidth={2}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</SectionCard>
			)}

			{/* Error Distribution Chart */}
			{summary.totalErrors > 0 && (
				<SectionCard title='Error Distribution' description='Percentage breakdown by error type'>
					<div className={styles.chartContainer}>
						<ResponsiveContainer width='100%' height={300}>
							<PieChart>
								<Pie
									data={distributionData}
									cx='50%'
									cy='50%'
									innerRadius={60}
									outerRadius={100}
									paddingAngle={2}
									dataKey='value'
									label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
								>
									<Cell fill={ERROR_COLORS.ECN} />
									<Cell fill={ERROR_COLORS.ENC} />
									<Cell fill={ERROR_COLORS.ECC} />
									<Cell fill={ERROR_COLORS.ECUF} />
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: 'var(--mantine-color-gray-0)',
										border: '1px solid var(--mantine-color-gray-3)',
										borderRadius: 'var(--mantine-radius-md)',
									}}
									formatter={(value) => `${value} errors`}
								/>
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</SectionCard>
			)}

			{/* Error Breakdown Table */}
			{breakdownData.length > 0 && (
				<SectionCard title='Error Breakdown' description='Top 10 errors by frequency'>
					<div className={styles.tableContainer}>
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Date</Table.Th>
									<Table.Th>Error Type</Table.Th>
									<Table.Th align='right'>Count</Table.Th>
									<Table.Th align='right'>Severity</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{breakdownData.map((row) => (
									<Table.Tr key={row.id}>
										<Table.Td>{row.date}</Table.Td>
										<Table.Td>
											<Badge
												size='sm'
												variant='light'
												color={
													row.errorType === 'ECN'
														? 'red'
														: row.errorType === 'ENC'
														? 'orange'
														: row.errorType === 'ECC'
														? 'purple'
														: 'yellow'
												}
											>
												{row.errorType}
											</Badge>
										</Table.Td>
										<Table.Td align='right'>{row.callCount}</Table.Td>
										<Table.Td align='right'>
											<Badge
												size='sm'
												variant='dot'
												color={getSeverityColor(row.severity)}
											>
												{row.severity.charAt(0).toUpperCase() + row.severity.slice(1)}
											</Badge>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</div>
				</SectionCard>
			)}

			{/* Empty State */}
			{aggregated.length === 0 && (
				<SectionCard title='No Data' description='No analytics data available for selected period'>
					<Center py='xl'>
						<Stack gap='xs' align='center'>
							<IconAlertCircle size={32} opacity={0.5} />
							<Text c='dimmed'>No call metrics found for the selected date range.</Text>
							<Text size='sm' c='dimmed'>Try adjusting your date range or granularity settings.</Text>
						</Stack>
					</Center>
				</SectionCard>
			)}
		</Stack>
	);
};

export default QAAnalyticsTab;
