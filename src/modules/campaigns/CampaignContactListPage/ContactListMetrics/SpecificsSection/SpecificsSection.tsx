import { Box, Card, Flex, Progress, Stack, Text } from '@mantine/core';
import styles from './SpecificsSection.module.css';

type SpecificMetric = {
	key: string;
	label: string;
	value: number;
	meta?: {
		conversationsMeasured?: number;
	};
};

type SpecificsSectionProps = {
	displayedSpecifics: SpecificMetric[];
	maxSpecificValue: number;
};

const formatNumber = (value?: number) => {
	if (!Number.isFinite(value ?? Number.NaN)) {
		return '0';
	}
	return value!.toLocaleString();
};

const SpecificsSection = ({
	displayedSpecifics,
	maxSpecificValue,
}: SpecificsSectionProps) => {
	return (
		<Card withBorder padding='md' className={styles.specificsCard}>
			<Stack gap='sm'>
				<Box>
					<Text fw={600} size='sm'>
						Focused Metrics
					</Text>
					<Text size='xs' c='dimmed' mt={4}>
						Key KPIs reported by the platform.
					</Text>
				</Box>
				{displayedSpecifics.length ? (
					<Stack gap='sm'>
						{displayedSpecifics.map((metric) => {
							const metricValue = metric.value ?? 0;
							const percentOfMax = Math.min(
								100,
								maxSpecificValue ? (metricValue / maxSpecificValue) * 100 : 0
							);

							return (
								<Box key={metric.key} className={styles.specificItem}>
									<Flex className={styles.specificHeader}>
										<Box style={{ flex: 1, minWidth: 0 }}>
											<Text size='sm' fw={600} className={styles.specificLabel}>
												{metric.label}
											</Text>
											{metric.meta?.conversationsMeasured ? (
												<Text size='xs' c='dimmed'>
													{metric.meta.conversationsMeasured.toLocaleString()}{' '}
													conversations measured
												</Text>
											) : null}
										</Box>
										<Text size='lg' fw={700}>
											{formatNumber(metricValue)}
										</Text>
									</Flex>
									<Progress
										value={percentOfMax}
										color='blue.6'
										size='sm'
										radius='xl'
									/>
								</Box>
							);
						})}
					</Stack>
				) : (
					<Text size='sm' c='dimmed' ta='center' py='xl'>
						There are no specific metrics to display right now.
					</Text>
				)}
			</Stack>
		</Card>
	);
};

export default SpecificsSection;
