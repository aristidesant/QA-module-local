import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
} from '@mantine/core';
import {
	LineChart,
	BarChart,
	Tooltip,
	Legend,
	Line,
	Bar,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
} from 'recharts';
import SectionCard from '~/components/SectionCard';
import { IconTrendingUp, IconAlertCircle, IconMoodSmile } from '@tabler/icons-react';
import type { AggregatedMetrics, CallMetric } from '~/modules/qa/dashboard/mockData';
import styles from './SentimentAnalyticsTab.module.css';

export interface SentimentAnalyticsTabProps {
	calls: CallMetric[];
	aggregated: AggregatedMetrics[];
}

// Emotion configurations with emoji and colors
const EMOTION_CONFIG: Record<
	string,
	{ emoji: string; label: string; color: 'green' | 'red' | 'yellow' | 'blue' | 'orange' | 'violet' }
> = {
	Joy: { emoji: '😄', label: 'Joy', color: 'green' },
	Trust: { emoji: '🤝', label: 'Trust', color: 'blue' },
	Anticipation: { emoji: '🚀', label: 'Anticipation', color: 'violet' },
	Surprise: { emoji: '😲', label: 'Surprise', color: 'yellow' },
	Anger: { emoji: '😠', label: 'Anger', color: 'red' },
	Fear: { emoji: '😰', label: 'Fear', color: 'orange' },
	Sadness: { emoji: '😢', label: 'Sadness', color: 'red' },
	Disgust: { emoji: '😒', label: 'Disgust', color: 'orange' },
};

const EMOTIONS = ['Joy', 'Trust', 'Anticipation', 'Surprise', 'Anger', 'Fear', 'Sadness', 'Disgust'];

// Emotion sentiment mapping for color coding
const emotionSentiment: Record<string, 'positive' | 'negative'> = {
	'Joy': 'positive',
	'Trust': 'positive',
	'Anticipation': 'positive',
	'Surprise': 'positive',
	'Anger': 'negative',
	'Fear': 'negative',
	'Sadness': 'negative',
	'Disgust': 'negative',
};

interface SummaryCardProps {
	title: string;
	value: string | number;
	icon?: React.ReactNode;
	badge?: string;
	badgeColor?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, badge, badgeColor }) => {
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
					{icon && <ThemeIcon variant='light' size='lg'>{icon}</ThemeIcon>}
					<Text size='xl' fw={700}>
						{value}
					</Text>
				</Group>
			</Stack>
		</Paper>
	);
};

const SentimentAnalyticsTab: React.FC<SentimentAnalyticsTabProps> = ({ calls: _calls, aggregated }) => {
	const { t } = useTranslation('qa.agent.analytics');
	const theme = useMantineTheme();

	const emotionLabels: Record<string, string> = {
		Joy: t('sentiment.emotion.joy'),
		Trust: t('sentiment.emotion.trust'),
		Anticipation: t('sentiment.emotion.anticipation'),
		Surprise: t('sentiment.emotion.surprise'),
		Anger: t('sentiment.emotion.anger'),
		Fear: t('sentiment.emotion.fear'),
		Sadness: t('sentiment.emotion.sadness'),
		Disgust: t('sentiment.emotion.disgust'),
	};

	// Calculate summary metrics
	const summary = useMemo(() => {
		if (aggregated.length === 0) {
			return {
				avgAgentSentiment: 0,
				avgCustomerSentiment: 0,
				sentimentDelta: 0,
				predominantEmotion: 'Joy',
				predominantEmotionCount: 0,
			};
		}

		const avgAgentSentiment =
			aggregated.reduce((sum, m) => sum + m.avgAgentSentiment, 0) / aggregated.length;
		const avgCustomerSentiment =
			aggregated.reduce((sum, m) => sum + m.avgCustomerSentiment, 0) / aggregated.length;
		const sentimentDelta = avgCustomerSentiment - avgAgentSentiment;

		// Get emotion frequencies
		const emotionCounts = new Map<string, number>();
		aggregated.forEach((m) => {
			emotionCounts.set(m.predominantEmotion, (emotionCounts.get(m.predominantEmotion) || 0) + 1);
		});

		const predominantEmotion = Array.from(emotionCounts.entries()).sort((a, b) => b[1] - a[1])[0];

		return {
			avgAgentSentiment: Math.round(avgAgentSentiment * 10) / 10,
			avgCustomerSentiment: Math.round(avgCustomerSentiment * 10) / 10,
			sentimentDelta: Math.round(sentimentDelta * 10) / 10,
			predominantEmotion: predominantEmotion[0],
			predominantEmotionCount: predominantEmotion[1],
		};
	}, [aggregated]);

	// Prepare trend chart data
	const trendData = useMemo(() => {
		return aggregated.map((metric) => ({
			date: new Date(metric.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
			agentSentiment: metric.avgAgentSentiment,
			customerSentiment: metric.avgCustomerSentiment,
			timestamp: metric.timestamp,
		}));
	}, [aggregated]);

	// Count emotion frequencies
	const emotionFrequencies = useMemo(() => {
		const frequencies = new Map<string, number>();
		aggregated.forEach((m) => {
			frequencies.set(m.predominantEmotion, (frequencies.get(m.predominantEmotion) || 0) + 1);
		});

		return EMOTIONS.map((emotion) => ({
			name: emotion,
			emoji: EMOTION_CONFIG[emotion]?.emoji || '',
			frequency: frequencies.get(emotion) || 0,
			color: EMOTION_CONFIG[emotion]?.color || 'gray',
		}));
	}, [aggregated]);

	// Prepare bar chart data
	const emotionChartData = useMemo(() => {
		return emotionFrequencies.map((e) => ({
			name: e.emoji,
			label: e.name,
			frequency: e.frequency,
		}));
	}, [emotionFrequencies]);

	// Prepare color-mapped emotion data for bar chart
	const emotionChartDataWithColors = useMemo(() => {
		return emotionChartData.map((emotion) => ({
			...emotion,
			fill: emotionSentiment[emotion.label] === 'positive'
				? theme.colors.green[6]
				: theme.colors.red[6],
		}));
	}, [emotionChartData, theme]);

	// Prepare comparison table data (top 10 by recency)
	const comparisonData = useMemo(() => {
		return aggregated.slice(-10).reverse().map((metric, index) => {
			const date = new Date(metric.timestamp).toLocaleDateString('en-US', {
				month: 'short',
				day: '2-digit',
				year: '2-digit',
			});
			const delta = metric.avgCustomerSentiment - metric.avgAgentSentiment;
			const deltaDirection = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';

			return {
				id: `${index}-${metric.timestamp}`,
				date,
				agentSentiment: metric.avgAgentSentiment.toFixed(1),
				customerSentiment: metric.avgCustomerSentiment.toFixed(1),
				delta: `${deltaDirection} ${Math.abs(delta).toFixed(2)}`,
				emotion: metric.predominantEmotion,
			};
		});
	}, [aggregated]);

	const getSentimentColor = (value: number) => {
		if (value >= 4.5) return 'green';
		if (value >= 4) return 'lime';
		if (value >= 3.5) return 'yellow';
		if (value >= 3) return 'orange';
		return 'red';
	};

	return (
		<Stack gap='lg'>
			{/* Summary Cards Row */}
			<SectionCard
				title={t('sentiment.summary.title')}
				description={t('sentiment.summary.description')}
				icon={IconMoodSmile}
			>
				{aggregated.length > 0 ? (
					<Grid gap='md'>
						<Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
							<SummaryCard
								title={t('sentiment.summary.agentSentiment')}
								value={summary.avgAgentSentiment.toFixed(1)}
								badge={t('sentiment.summary.outOfFive')}
								badgeColor={getSentimentColor(summary.avgAgentSentiment)}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
							<SummaryCard
								title={t('sentiment.summary.customerSentiment')}
								value={summary.avgCustomerSentiment.toFixed(1)}
								badge={t('sentiment.summary.outOfFive')}
								badgeColor={getSentimentColor(summary.avgCustomerSentiment)}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
							<SummaryCard
								title={t('sentiment.summary.delta')}
								value={`${summary.sentimentDelta > 0 ? '↑' : summary.sentimentDelta < 0 ? '↓' : '→'} ${Math.abs(summary.sentimentDelta).toFixed(2)}`}
								badge={summary.sentimentDelta > 0 ? t('sentiment.summary.customerHigher') : t('sentiment.summary.agentHigher')}
								badgeColor={summary.sentimentDelta > 0 ? 'green' : 'orange'}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 3 }}>
							<SummaryCard
								title={t('sentiment.summary.predominantEmotion')}
								value={`${EMOTION_CONFIG[summary.predominantEmotion]?.emoji || ''} ${emotionLabels[summary.predominantEmotion] || summary.predominantEmotion}`}
								badge={`${summary.predominantEmotionCount}x`}
								badgeColor='violet'
							/>
						</Grid.Col>
					</Grid>
				) : null}
			</SectionCard>

			{/* Dual-Line Trend Chart */}
			{trendData.length > 0 && (
				<SectionCard
					title={t('sentiment.trend.title')}
					description={t('sentiment.trend.description')}
					icon={IconTrendingUp}
				>
					<div className={styles.chartContainer}>
						<ResponsiveContainer width='100%' height={300}>
							<LineChart
								data={trendData}
								margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray='3 3' stroke='var(--mantine-color-gray-2)' />
								<XAxis dataKey='date' stroke='var(--mantine-color-gray-6)' />
								<YAxis domain={[0, 5]} stroke='var(--mantine-color-gray-6)' />
								<Tooltip
									contentStyle={{
										backgroundColor: 'var(--mantine-color-gray-0)',
										border: '1px solid var(--mantine-color-gray-3)',
										borderRadius: 'var(--mantine-radius-md)',
									}}
									formatter={(value) => (value as number).toFixed(2)}
								/>
								<Legend />
								<Line
									type='monotone'
									dataKey='agentSentiment'
									stroke={theme.colors.blue[6]}
									dot={false}
									strokeWidth={2}
									name={t('sentiment.trend.agentSentiment')}
								/>
								<Line
									type='monotone'
									dataKey='customerSentiment'
									stroke={theme.colors.green[6]}
									dot={false}
									strokeWidth={2}
									name={t('sentiment.trend.customerSentiment')}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</SectionCard>
			)}

			{/* Emotion Distribution Section */}
			{aggregated.length > 0 ? (
				<Grid gap='md'>
					{/* Part A: Predominant Emotion Card */}
					<Grid.Col span={{ base: 12, md: 6 }}>
						<SectionCard title={t('sentiment.predominantEmotionCard.title')} description={t('sentiment.predominantEmotionCard.description')}>
							<Card
								p='lg'
								radius='md'
								withBorder
								style={{
									borderLeft: `4px solid ${theme.colors.violet[6]}`,
									backgroundColor: 'var(--mantine-color-gray-0)',
								}}
							>
								<Stack gap='md' align='center'>
									<Text fz={48} fw={700}>{EMOTION_CONFIG[summary.predominantEmotion]?.emoji}</Text>
									<div style={{ textAlign: 'center' }}>
										<Text fw={700} size='lg'>
											{emotionLabels[summary.predominantEmotion] || summary.predominantEmotion}
										</Text>
										<Text c='dimmed' size='sm' mt='xs'>
											{t('sentiment.predominantEmotionCard.appearedTimes', { count: summary.predominantEmotionCount })}
										</Text>
									</div>
									<Badge size='lg' variant='dot' color='violet'>
										{t('sentiment.predominantEmotionCard.percentOfCalls', {
											percent: Math.round((summary.predominantEmotionCount / aggregated.length) * 100),
										})}
									</Badge>
								</Stack>
							</Card>
						</SectionCard>
					</Grid.Col>

					{/* Part B: 8-Emotion Bar Chart */}
					<Grid.Col span={{ base: 12, md: 6 }}>
						<SectionCard title={t('sentiment.distribution.title')} description={t('sentiment.distribution.description')}>
							{emotionChartDataWithColors.length > 0 ? (
								<div className={styles.chartContainer}>
									<ResponsiveContainer width='100%' height={250}>
										<BarChart
											data={emotionChartDataWithColors}
											margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
											layout='vertical'
										>
											<CartesianGrid strokeDasharray='3 3' stroke='var(--mantine-color-gray-2)' />
											<XAxis type='number' stroke='var(--mantine-color-gray-6)' />
											<YAxis
												dataKey='name'
												type='category'
												width={30}
												stroke='var(--mantine-color-gray-6)'
											/>
											<Tooltip
												contentStyle={{
													backgroundColor: 'var(--mantine-color-gray-0)',
													border: '1px solid var(--mantine-color-gray-3)',
													borderRadius: 'var(--mantine-radius-md)',
												}}
												formatter={(value) => t('sentiment.distribution.occurrences', { count: value as number })}
												labelFormatter={(label) => {
													const emotion = emotionChartDataWithColors.find((e) => e.name === label);
													return (emotion && emotionLabels[emotion.label]) || emotion?.label || label;
												}}
											/>
											<Legend />
											<Bar
												dataKey='frequency'
												name={t('sentiment.distribution.frequency')}
												radius={[0, 8, 8, 0]}
											>
												{emotionChartDataWithColors.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={entry.fill} />
												))}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							) : (
								<Center py='xl'>
									<Text c='dimmed'>{t('sentiment.distribution.noData')}</Text>
								</Center>
							)}
						</SectionCard>
					</Grid.Col>
				</Grid>
			) : null}

			{/* Sentiment Comparison Table */}
			{comparisonData.length > 0 && (
				<SectionCard
					title={t('sentiment.comparison.title')}
					description={t('sentiment.comparison.description')}
				>
					<div className={styles.tableContainer}>
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('sentiment.comparison.date')}</Table.Th>
									<Table.Th align='center'>{t('sentiment.comparison.agentSentiment')}</Table.Th>
									<Table.Th align='center'>{t('sentiment.comparison.customerSentiment')}</Table.Th>
									<Table.Th align='center'>{t('sentiment.comparison.delta')}</Table.Th>
									<Table.Th>{t('sentiment.comparison.predominantEmotion')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{comparisonData.map((row) => {
									const agentValue = parseFloat(row.agentSentiment);
									const customerValue = parseFloat(row.customerSentiment);
									return (
										<Table.Tr key={row.id}>
											<Table.Td>{row.date}</Table.Td>
											<Table.Td align='center'>
												<Badge
													size='sm'
													variant='light'
													color={getSentimentColor(agentValue)}
												>
													{row.agentSentiment}
												</Badge>
											</Table.Td>
											<Table.Td align='center'>
												<Badge
													size='sm'
													variant='light'
													color={getSentimentColor(customerValue)}
												>
													{row.customerSentiment}
												</Badge>
											</Table.Td>
											<Table.Td align='center'>
												<Badge
													size='sm'
													variant='dot'
													color={row.delta.includes('↑') ? 'green' : row.delta.includes('↓') ? 'orange' : 'blue'}
												>
													{row.delta}
												</Badge>
											</Table.Td>
											<Table.Td>
												<Group gap='xs'>
													<Text>{EMOTION_CONFIG[row.emotion]?.emoji}</Text>
													<Text>{emotionLabels[row.emotion] || row.emotion}</Text>
												</Group>
											</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>
					</div>
				</SectionCard>
			)}

			{/* Empty State */}
			{aggregated.length === 0 && (
				<SectionCard
					title={t('empty.noData')}
					description={t('empty.noDataDescription')}
				>
					<Center py='xl'>
						<Stack gap='xs' align='center'>
							<IconAlertCircle size={32} opacity={0.5} />
							<Text c='dimmed'>{t('sentiment.empty.title')}</Text>
							<Text size='sm' c='dimmed'>
								{t('empty.tryAdjusting')}
							</Text>
						</Stack>
					</Center>
				</SectionCard>
			)}
		</Stack>
	);
};

export default SentimentAnalyticsTab;
