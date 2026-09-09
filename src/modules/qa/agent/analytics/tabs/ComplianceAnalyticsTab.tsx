import React, { useMemo, useState } from 'react';
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
	Card,
	ThemeIcon,
	Button,
	SimpleGrid,
	Collapse,
} from '@mantine/core';
import {
	AreaChart,
	LineChart,
	Area,
	Line,
	Tooltip,
	Legend,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
} from 'recharts';
import SectionCard from '~/components/SectionCard';
import {
	IconShield,
	IconAlertCircle,
	IconTrendingUp,
} from '@tabler/icons-react';
import type {
	AggregatedMetrics,
	CallMetric,
} from '~/modules/qa/dashboard/mockData';
import styles from './ComplianceAnalyticsTab.module.css';

export interface ComplianceAnalyticsTabProps {
	calls: CallMetric[];
	aggregated: AggregatedMetrics[];
}

interface SummaryCardProps {
	title: string;
	value: string | number;
	icon?: React.ReactNode;
	badge?: string;
	badgeColor?: string;
}

const ComplianceSummaryCard: React.FC<SummaryCardProps> = ({
	title,
	value,
	icon,
	badge,
	badgeColor,
}) => {
	return (
		<Paper p='lg' radius='md' withBorder className={styles.summaryCard}>
			<Stack gap='xs'>
				<Group justify='space-between' align='flex-start'>
					<Text size='sm' fw={600} c='dimmed' tt='uppercase'>
						{title}
					</Text>
					{badge && (
						<Badge size='sm' variant='light' color={badgeColor || 'blue'}>
							{badge}
						</Badge>
					)}
				</Group>
				<Group align='center' gap='xs'>
					{icon && (
						<ThemeIcon variant='light' size='lg'>
							{icon}
						</ThemeIcon>
					)}
					<Text size='xl' fw={700}>
						{value}
					</Text>
				</Group>
			</Stack>
		</Paper>
	);
};

type ComplianceAreaKey = 'security' | 'regulatory' | 'legal';

interface ComplianceItemConfig {
	key: string;
	label: string;
}

interface ComplianceAreaConfig {
	displayName: string;
	items: ComplianceItemConfig[];
}

const COMPLIANCE_AREA_CONFIG: Record<ComplianceAreaKey, ComplianceAreaConfig> =
	{
		security: {
			displayName: 'Security',
			items: [
				{ key: 'dataProtection', label: 'Data Protection' },
				{ key: 'disclosureCompliance', label: 'Disclosure Compliance' },
			],
		},
		regulatory: {
			displayName: 'Regulatory',
			items: [
				{ key: 'cobranzaRegulada', label: 'Billing Process' },
				{ key: 'transparenciaConsentimiento', label: 'Transparency' },
			],
		},
		legal: {
			displayName: 'Legal',
			items: [
				{ key: 'amenazasTradicionales', label: 'Threats' },
				{ key: 'rrss', label: 'Social Media' },
				{ key: 'superintendenciaBancos', label: 'Banking Superintendence' },
				{ key: 'noLlamarList', label: 'Do-Not-Call' },
			],
		},
	};

const COMPLIANCE_AREA_KEYS: ComplianceAreaKey[] = [
	'security',
	'regulatory',
	'legal',
];

const ComplianceAnalyticsTab: React.FC<ComplianceAnalyticsTabProps> = ({
	calls,
	aggregated,
}) => {
	const theme = useMantineTheme();
	const [chartView, setChartView] = useState<'stacked' | 'separate'>('stacked');
	const [expandedArea, setExpandedArea] = useState<ComplianceAreaKey | null>(
		null
	);

	const areaColors: Record<ComplianceAreaKey, string> = {
		security: theme.colors.blue[6],
		regulatory: theme.colors.orange[6],
		legal: theme.colors.red[6],
	};

	// Compute sub-item scores by averaging each item's score across all calls in range
	const itemScores = useMemo(() => {
		const result = {
			security: {} as Record<string, number>,
			regulatory: {} as Record<string, number>,
			legal: {} as Record<string, number>,
		};

		if (calls.length === 0) return result;

		COMPLIANCE_AREA_KEYS.forEach((area) => {
			COMPLIANCE_AREA_CONFIG[area].items.forEach(({ key }) => {
				const sum = calls.reduce(
					(acc, call) => acc + (call.complianceByArea[area].items[key] ?? 0),
					0
				);
				result[area][key] = Math.round(sum / calls.length);
			});
		});

		return result;
	}, [calls]);

	// Calculate summary metrics
	const summary = useMemo(() => {
		if (aggregated.length === 0) {
			return {
				avgSecurityCompliance: 0,
				avgRegulatoryCompliance: 0,
				avgLegalCompliance: 0,
			};
		}

		const avgSecurityCompliance =
			aggregated.reduce((sum, m) => sum + m.avgSecurityCompliance, 0) /
			aggregated.length;
		const avgRegulatoryCompliance =
			aggregated.reduce((sum, m) => sum + m.avgRegulatoryCompliance, 0) /
			aggregated.length;
		const avgLegalCompliance =
			aggregated.reduce((sum, m) => sum + m.avgLegalCompliance, 0) /
			aggregated.length;

		return {
			avgSecurityCompliance: Math.round(avgSecurityCompliance),
			avgRegulatoryCompliance: Math.round(avgRegulatoryCompliance),
			avgLegalCompliance: Math.round(avgLegalCompliance),
		};
	}, [aggregated]);

	// Prepare trend chart data
	const trendData = useMemo(() => {
		return aggregated.map((metric) => ({
			date: new Date(metric.timestamp).toLocaleDateString('en-US', {
				month: 'short',
				day: '2-digit',
			}),
			Security: metric.avgSecurityCompliance,
			Regulatory: metric.avgRegulatoryCompliance,
			Legal: metric.avgLegalCompliance,
			timestamp: metric.timestamp,
		}));
	}, [aggregated]);

	// Prepare violations table data
	const violationsData = useMemo(() => {
		const violations: Array<{
			id: string;
			date: string;
			area: string;
			issue: string;
			severity: 'critical' | 'warning' | 'info';
		}> = [];

		aggregated.forEach((metric, index) => {
			const date = new Date(metric.timestamp).toLocaleDateString('en-US', {
				month: 'short',
				day: '2-digit',
				year: '2-digit',
			});

			// Add security violations
			if (metric.avgSecurityCompliance < 80) {
				violations.push({
					id: `sec-${index}`,
					date,
					area: 'Security',
					issue: 'Data Protection: Low compliance detected',
					severity: metric.avgSecurityCompliance < 70 ? 'critical' : 'warning',
				});
			}

			// Add regulatory violations
			if (metric.avgRegulatoryCompliance < 80) {
				violations.push({
					id: `reg-${index}`,
					date,
					area: 'Regulatory',
					issue: 'Regulatory Process: Non-compliance detected',
					severity:
						metric.avgRegulatoryCompliance < 70 ? 'critical' : 'warning',
				});
			}

			// Add legal violations
			if (metric.avgLegalCompliance < 80) {
				violations.push({
					id: `leg-${index}`,
					date,
					area: 'Legal',
					issue: 'Legal Compliance: Non-compliance detected',
					severity: metric.avgLegalCompliance < 70 ? 'critical' : 'warning',
				});
			}
		});

		// Return top 10 most recent violations
		return violations.slice(-10).reverse();
	}, [aggregated]);

	const getComplianceColor = (value: number) => {
		if (value >= 90) return 'green';
		if (value >= 80) return 'lime';
		if (value >= 70) return 'yellow';
		if (value >= 60) return 'orange';
		return 'red';
	};

	const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
		switch (severity) {
			case 'critical':
				return 'red';
			case 'warning':
				return 'orange';
			case 'info':
				return 'blue';
			default:
				return 'gray';
		}
	};

	return (
		<Stack gap='lg'>
			{/* Summary Cards Row */}
			<SectionCard
				title='Compliance Summary'
				description='Overall compliance metrics by area'
				icon={IconShield}
			>
				<Grid gap='md'>
					<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
						<ComplianceSummaryCard
							title='Security Score'
							value={`${summary.avgSecurityCompliance}%`}
							badge='Area Total'
							badgeColor={getComplianceColor(summary.avgSecurityCompliance)}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
						<ComplianceSummaryCard
							title='Regulatory Score'
							value={`${summary.avgRegulatoryCompliance}%`}
							badge='Area Total'
							badgeColor={getComplianceColor(summary.avgRegulatoryCompliance)}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
						<ComplianceSummaryCard
							title='Legal Score'
							value={`${summary.avgLegalCompliance}%`}
							badge='Area Total'
							badgeColor={getComplianceColor(summary.avgLegalCompliance)}
						/>
					</Grid.Col>
				</Grid>
			</SectionCard>

			{/* Compliance Trend Chart with Toggle */}
			{trendData.length > 0 && (
				<SectionCard
					title='Compliance Trend'
					description='Compliance scores over time across all areas'
					icon={IconTrendingUp}
				>
					<Stack gap='md'>
						<Group justify='flex-end'>
							<Button
								variant={chartView === 'stacked' ? 'filled' : 'light'}
								size='sm'
								onClick={() => setChartView('stacked')}
							>
								Stacked Area
							</Button>
							<Button
								variant={chartView === 'separate' ? 'filled' : 'light'}
								size='sm'
								onClick={() => setChartView('separate')}
							>
								Multi-Line
							</Button>
						</Group>

						<div className={styles.chartContainer}>
							<ResponsiveContainer width='100%' height={300}>
								{chartView === 'stacked' ? (
									<AreaChart
										data={trendData}
										margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
									>
										<CartesianGrid
											strokeDasharray='3 3'
											stroke='var(--mantine-color-gray-2)'
										/>
										<XAxis
											dataKey='date'
											stroke='var(--mantine-color-gray-6)'
										/>
										<YAxis
											domain={[0, 100]}
											stroke='var(--mantine-color-gray-6)'
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: 'var(--mantine-color-gray-0)',
												border: '1px solid var(--mantine-color-gray-3)',
												borderRadius: 'var(--mantine-radius-md)',
											}}
											formatter={(value) => `${(value as number).toFixed(1)}%`}
										/>
										<Legend />
										<Area
											type='monotone'
											dataKey='Security'
											stackId='1'
											stroke={theme.colors.blue[6]}
											fill={theme.colors.blue[6]}
											fillOpacity={0.7}
										/>
										<Area
											type='monotone'
											dataKey='Regulatory'
											stackId='1'
											stroke={theme.colors.orange[6]}
											fill={theme.colors.orange[6]}
											fillOpacity={0.7}
										/>
										<Area
											type='monotone'
											dataKey='Legal'
											stackId='1'
											stroke={theme.colors.red[6]}
											fill={theme.colors.red[6]}
											fillOpacity={0.7}
										/>
									</AreaChart>
								) : (
									<LineChart
										data={trendData}
										margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
									>
										<CartesianGrid
											strokeDasharray='3 3'
											stroke='var(--mantine-color-gray-2)'
										/>
										<XAxis
											dataKey='date'
											stroke='var(--mantine-color-gray-6)'
										/>
										<YAxis
											domain={[0, 100]}
											stroke='var(--mantine-color-gray-6)'
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: 'var(--mantine-color-gray-0)',
												border: '1px solid var(--mantine-color-gray-3)',
												borderRadius: 'var(--mantine-radius-md)',
											}}
											formatter={(value) => `${(value as number).toFixed(1)}%`}
										/>
										<Legend />
										<Line
											type='monotone'
											dataKey='Security'
											stroke={theme.colors.blue[6]}
											dot={false}
											strokeWidth={2}
										/>
										<Line
											type='monotone'
											dataKey='Regulatory'
											stroke={theme.colors.orange[6]}
											dot={false}
											strokeWidth={2}
										/>
										<Line
											type='monotone'
											dataKey='Legal'
											stroke={theme.colors.red[6]}
											dot={false}
											strokeWidth={2}
										/>
									</LineChart>
								)}
							</ResponsiveContainer>
						</div>
					</Stack>
				</SectionCard>
			)}

			{/* Compliance Breakdown Section - Collapsible Cards */}
			<SectionCard
				title='Compliance Details'
				description='Detailed breakdown by compliance area'
			>
				<SimpleGrid cols={{ base: 1, md: 3 }} spacing='md'>
					{COMPLIANCE_AREA_KEYS.map((area) => {
						const config = COMPLIANCE_AREA_CONFIG[area];
						const areaScore = summary[
							`avg${config.displayName}Compliance` as keyof typeof summary
						] as number;

						return (
							<div key={area}>
								<Card
									p='lg'
									radius='md'
									withBorder
									className={styles.areaCard}
									// inline-style-allow: border accent color is data-driven per compliance area and has no static class equivalent
									style={{ borderLeft: `4px solid ${areaColors[area]}` }}
									onClick={() =>
										setExpandedArea(expandedArea === area ? null : area)
									}
								>
									<Stack gap='md'>
										<Group justify='space-between' align='center'>
											<Text fw={600} size='lg'>
												{config.displayName}
											</Text>
											<Badge color={getComplianceColor(areaScore)} size='lg'>
												{areaScore}%
											</Badge>
										</Group>

										{/* Collapsed view - show hint text */}
										{expandedArea !== area && (
											<Text size='sm' c='dimmed'>
												Click to expand details
											</Text>
										)}

										{/* Expanded view - show detailed breakdown */}
										<Collapse expanded={expandedArea === area}>
											<Stack gap='sm'>
												{config.items.map(({ key: itemKey, label }) => {
													const itemScore = itemScores[area][itemKey] ?? 0;
													return (
														<div key={itemKey}>
															<Group justify='space-between' mb='xs'>
																<Text size='sm'>{label}</Text>
																<Badge
																	size='sm'
																	variant='light'
																	color={getComplianceColor(itemScore)}
																>
																	{itemScore}%
																</Badge>
															</Group>
															<div className={styles.scoreTrack}>
																<div
																	className={styles.scoreFill}
																	// inline-style-allow: fill width/color are computed per item score and area, no static class equivalent
																	style={{
																		width: `${itemScore}%`,
																		backgroundColor: areaColors[area],
																	}}
																/>
															</div>
														</div>
													);
												})}
											</Stack>
										</Collapse>
									</Stack>
								</Card>
							</div>
						);
					})}
				</SimpleGrid>
			</SectionCard>

			{/* Compliance Issues Table */}
			{violationsData.length > 0 && (
				<SectionCard
					title='Compliance Issues'
					description='Top 10 most recent violations'
				>
					<div className={styles.tableContainer}>
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Date</Table.Th>
									<Table.Th>Area</Table.Th>
									<Table.Th>Issue</Table.Th>
									<Table.Th align='center'>Severity</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{violationsData.map((row) => (
									<Table.Tr key={row.id}>
										<Table.Td>{row.date}</Table.Td>
										<Table.Td>
											<Badge size='sm' variant='light'>
												{row.area}
											</Badge>
										</Table.Td>
										<Table.Td>{row.issue}</Table.Td>
										<Table.Td align='center'>
											<Badge
												size='sm'
												variant='dot'
												color={getSeverityColor(row.severity)}
											>
												{row.severity.charAt(0).toUpperCase() +
													row.severity.slice(1)}
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
				<SectionCard
					title='No Data'
					description='No analytics data available for selected period'
				>
					<Center py='xl'>
						<Stack gap='xs' align='center'>
							<IconAlertCircle size={32} opacity={0.5} />
							<Text c='dimmed'>
								No compliance data found for the selected date range.
							</Text>
							<Text size='sm' c='dimmed'>
								Try adjusting your date range or granularity settings.
							</Text>
						</Stack>
					</Center>
				</SectionCard>
			)}
		</Stack>
	);
};

export default ComplianceAnalyticsTab;
