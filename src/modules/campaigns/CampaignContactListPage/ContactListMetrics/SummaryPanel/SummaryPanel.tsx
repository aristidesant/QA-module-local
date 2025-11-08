import { type CSSProperties } from 'react';
import { Box, Flex, RingProgress, SimpleGrid, Text } from '@mantine/core';
import styles from './SummaryPanel.module.css';

type OverviewHighlight = {
	key: string;
	label: string;
	description: string;
	value: number;
	color: string;
};

type QuickStat = {
	key: string;
	label: string;
	value: number;
	description: string;
	color: string;
};

type SummaryPanelProps = {
	overviewHighlights: OverviewHighlight[];
	quickStats?: QuickStat[];
};

const formatNumber = (value?: number) => {
	if (!Number.isFinite(value ?? Number.NaN)) {
		return '0';
	}
	return value!.toLocaleString();
};

const formatPercentageLabel = (value: number) => {
	if (!Number.isFinite(value)) {
		return '0%';
	}
	const rounded = Math.round(value * 10) / 10;
	return `${rounded % 1 === 0 ? Math.round(rounded) : rounded.toFixed(1)}%`;
};

const clampPercentage = (value: number) =>
	Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

const buildRingChart = (value: number, color: string, size = 60) => (
	<RingProgress
		size={size}
		thickness={12}
		sections={[{ value: clampPercentage(value), color }]}
		rootColor='gray.2'
		label={
			<Text size='xs' ta={'center'} fw={600}>
				{formatPercentageLabel(value)}
			</Text>
		}
	/>
);

const toMantineVar = (color: string) =>
	`var(--mantine-color-${color.replace('.', '-')})`;

const SummaryPanel = ({
	overviewHighlights,
	quickStats = [],
}: SummaryPanelProps) => (
	<Box className={styles.summaryPanel}>
		<SimpleGrid
			cols={{ base: 1, xs: 2, lg: 3 }}
			spacing='sm'
			className={styles.performanceGrid}
		>
			{overviewHighlights.map((highlight) => (
				<Box
					key={highlight.key}
					className={styles.performanceCard}
					style={
						{
							'--accent-color': toMantineVar(highlight.color),
						} as CSSProperties
					}
				>
					<Flex
						align='flex-start'
						justify='space-between'
						className={styles.performanceHeader}
					>
						<Box>
							<Text size='xs' c='dimmed' className={styles.performanceHint}>
								{highlight.description}
							</Text>
							<Text className={styles.performanceValue}>{highlight.label}</Text>
							{/* <Text className={styles.performanceValue}>
								{formatPercentageLabel(highlight.value)}
							</Text> */}
						</Box>
						{buildRingChart(highlight.value, highlight.color, 100)}
					</Flex>
				</Box>
			))}
		</SimpleGrid>
		{quickStats.length ? (
			<SimpleGrid
				cols={{ base: 2, sm: 4 }}
				spacing='xs'
				className={styles.quickStats}
			>
				{quickStats.map((stat) => (
					<Box
						key={stat.key}
						className={styles.quickStat}
						style={
							{
								'--stat-color': toMantineVar(stat.color),
							} as CSSProperties
						}
					>
						<Flex align='center' gap={6} className={styles.quickStatLabel}>
							<span className={styles.quickStatDot} />
							<Text size='xs' c='dimmed' fw={600}>
								{stat.label}
							</Text>
						</Flex>
						<Text className={styles.quickStatValue}>
							{formatNumber(stat.value)}
						</Text>
						<Text size='xs' c='dimmed' className={styles.quickStatHint}>
							{stat.description}
						</Text>
					</Box>
				))}
			</SimpleGrid>
		) : null}
	</Box>
);

export default SummaryPanel;
