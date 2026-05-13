import {
	Box,
	Card,
	Flex,
	Progress,
	SimpleGrid,
	Stack,
	Text,
} from '@mantine/core';
import { BarChart } from '@mantine/charts';
import styles from './BreakdownSection.module.css';

type Reason = {
	label: string;
	count: number;
	percentage: string;
};

type BreakdownCard = {
	key: string;
	title: string;
	subtitle: string;
	color: string;
	reasons: Reason[];
};

type BreakdownSectionProps = {
	breakdownCards: BreakdownCard[];
};

const formatNumber = (value?: number) => {
	if (!Number.isFinite(value ?? Number.NaN)) {
		return '0';
	}
	return value!.toLocaleString();
};

const parsePercentageValue = (value?: string | number) => {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0;
	}
	if (!value) {
		return 0;
	}
	const numericValue = Number.parseFloat(value.replace('%', ''));
	return Number.isFinite(numericValue) ? numericValue : 0;
};

const clampPercentage = (value: number) =>
	Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

const BreakdownSection = ({ breakdownCards }: BreakdownSectionProps) => {
	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2 }}
			spacing={{ base: 'sm', sm: 'md' }}
			className={styles.breakdownGrid}
		>
			{breakdownCards.map((card) => (
				<Card
					key={card.key}
					withBorder
					padding='md'
					className={styles.breakdownCard}
				>
					<Stack gap='sm' className={styles.breakdownContent}>
						<Box>
							<Text fw={600} size='sm'>
								{card.title}
							</Text>
							<Text size='xs' c='dimmed' mt={4}>
								{card.subtitle}
							</Text>
						</Box>

						{card.reasons.length ? (
							<>
								<Box className={styles.chartWrapper}>
									<BarChart
										data={card.reasons.map((reason) => ({
											label: reason.label,
											count: reason.count,
										}))}
										dataKey='label'
										series={[{ name: 'count', color: card.color }]}
										withLegend={false}
										withTooltip
										orientation='horizontal'
										gridAxis='none'
										tickLine='none'
										xAxisProps={{ hide: true }}
										yAxisProps={{ width: 140 }}
										valueFormatter={(value) =>
											Number.isFinite(value) ? value.toLocaleString() : '0'
										}
										h={220}
										w='100%'
										className={styles.breakdownChart}
									/>
								</Box>
								<Stack gap='sm' className={styles.breakdownList}>
									{card.reasons.map((reason) => {
										const percentageValue = clampPercentage(
											parsePercentageValue(reason.percentage)
										);

										return (
											<Box
												key={`${card.key}-${reason.label}`}
												className={styles.breakdownRow}
											>
												<Flex
													align='center'
													justify='space-between'
													className={styles.breakdownHeader}
												>
													<Text
														size='sm'
														fw={600}
														className={styles.breakdownLabel}
													>
														{reason.label}
													</Text>
													<Text size='xs' fw={600} c='dimmed'>
														{reason.percentage}
													</Text>
												</Flex>
												<Progress
													value={percentageValue}
													color={card.color}
													size='xs'
													radius='xl'
												/>
												<Text
													size='xs'
													c='dimmed'
													className={styles.breakdownCount}
												>
													{formatNumber(reason.count)} calls
												</Text>
											</Box>
										);
									})}
								</Stack>
							</>
						) : (
							<Text size='sm' c='dimmed' ta='center' py='xl'>
								No breakdown data available for this range.
							</Text>
						)}
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};

export default BreakdownSection;
