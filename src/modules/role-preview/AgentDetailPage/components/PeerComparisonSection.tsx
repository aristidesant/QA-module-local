import React from 'react';
import {
	Stack,
	Card,
	Text,
	Group,
	ThemeIcon,
	Progress,
	SimpleGrid,
} from '@mantine/core';
import {
	IconTrendingUp,
	IconTrendingDown,
	IconMinus,
} from '@tabler/icons-react';

interface ComparisonMetric {
	label: string;
	agentValue: number;
	teamAverage: number;
	unit?: string;
}

interface PeerComparisonSectionProps {
	metrics: ComparisonMetric[];
	agentName?: string;
	percentileRank?: string;
}

const PeerComparisonSection: React.FC<PeerComparisonSectionProps> = ({
	metrics,
	agentName = 'This Agent',
	percentileRank,
}) => {
	const getComparisonIcon = (agentValue: number, teamAverage: number) => {
		const diff = agentValue - teamAverage;
		if (Math.abs(diff) <= 2) {
			return <IconMinus size={16} color='gray' />;
		}
		return diff > 0 ? (
			<IconTrendingUp size={16} color='green' />
		) : (
			<IconTrendingDown size={16} color='red' />
		);
	};

	const getComparisonColor = (agentValue: number, teamAverage: number) => {
		const diff = agentValue - teamAverage;
		if (Math.abs(diff) <= 2) {
			return 'gray';
		}
		return diff > 0 ? 'green' : 'red';
	};

	return (
		<Stack gap='md'>
			{percentileRank && (
				<Card withBorder p='md' mb='md'>
					<Group justify='space-between'>
						<div>
							<Text size='sm' c='dimmed'>
								Percentile Rank
							</Text>
							<Text fw={700} size='lg'>
								{percentileRank}
							</Text>
						</div>
						<ThemeIcon size='lg' radius='md' variant='light' color='blue'>
							<Text fw={700}>★</Text>
						</ThemeIcon>
					</Group>
				</Card>
			)}

			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
				{metrics.map((metric, index) => {
					const diff = metric.agentValue - metric.teamAverage;
					const percentDiff = ((diff / metric.teamAverage) * 100).toFixed(1);

					return (
						<Card key={index} withBorder p='md'>
							<Stack gap='md'>
								<Text fw={600} size='sm'>
									{metric.label}
								</Text>

								<Group justify='space-between'>
									<div>
										<Text size='xs' c='dimmed' mb='xs'>
											{agentName}
										</Text>
										<Group gap='xs'>
											<Text fw={700} size='lg'>
												{metric.agentValue}
												{metric.unit ? metric.unit : '%'}
											</Text>
											<ThemeIcon
												size='sm'
												radius='md'
												variant='light'
												color={getComparisonColor(
													metric.agentValue,
													metric.teamAverage
												)}
											>
												{getComparisonIcon(
													metric.agentValue,
													metric.teamAverage
												)}
											</ThemeIcon>
										</Group>
									</div>
								</Group>

								<div>
									<Group justify='space-between' mb='xs'>
										<Text size='xs' c='dimmed'>
											Team Average
										</Text>
										<Text size='xs' fw={500}>
											{metric.teamAverage}
											{metric.unit ? metric.unit : '%'}
										</Text>
									</Group>
									<Progress
										value={(metric.agentValue / 100) * 100}
										size='sm'
										color={getComparisonColor(
											metric.agentValue,
											metric.teamAverage
										)}
									/>
								</div>

								{Math.abs(diff) > 2 && (
									<Text
										size='xs'
										c={getComparisonColor(
											metric.agentValue,
											metric.teamAverage
										)}
										fw={500}
									>
										{diff > 0 ? '+' : ''}
										{percentDiff}% vs team average
									</Text>
								)}
							</Stack>
						</Card>
					);
				})}
			</SimpleGrid>
		</Stack>
	);
};

export default PeerComparisonSection;
