import {
	Stack,
	SimpleGrid,
	Card,
	Text,
	Progress,
	Group,
	Badge,
	ThemeIcon,
} from '@mantine/core';
import {
	IconTrendingUp,
	IconUsers,
	IconAlertCircle,
} from '@tabler/icons-react';

interface BusinessMetric {
	label: string;
	value: number;
	unit: string;
	trend?: 'up' | 'down';
	trendValue?: number;
}

const BusinessView = () => {
	const conversionMetrics: BusinessMetric[] = [
		{
			label: 'Overall Conversion',
			value: 18.5,
			unit: '%',
			trend: 'up',
			trendValue: 2.3,
		},
		{
			label: 'First Call Conversion',
			value: 12.2,
			unit: '%',
			trend: 'up',
			trendValue: 1.8,
		},
		{
			label: 'Call Backs Converted',
			value: 24.6,
			unit: '%',
			trend: 'down',
			trendValue: -0.5,
		},
	];

	const objectionHandling = [
		{ reason: 'Price Concern', count: 156, percentage: 34 },
		{ reason: 'Not Interested', count: 142, percentage: 31 },
		{ reason: 'Competitor Better', count: 98, percentage: 21 },
		{ reason: 'Need Info', count: 68, percentage: 14 },
	];

	const competitors = [
		{ name: 'CompetitorA', mentions: 87, sentiment: 'positive' },
		{ name: 'CompetitorB', mentions: 62, sentiment: 'negative' },
		{ name: 'CompetitorC', mentions: 45, sentiment: 'neutral' },
	];

	return (
		<Stack gap='lg'>
			<div>
				<Text fw={600} size='sm' mb='md'>
					Conversion Analysis
				</Text>
				<SimpleGrid cols={3} spacing='lg'>
					{conversionMetrics.map((metric) => (
						<Card key={metric.label} withBorder p='md'>
							<Group justify='space-between' mb='xs'>
								<Text size='sm' fw={500}>
									{metric.label}
								</Text>
								{metric.trend && (
									<Badge
										size='sm'
										variant='light'
										color={metric.trend === 'up' ? 'green' : 'red'}
									>
										{metric.trend === 'up' ? '+' : '-'}
										{Math.abs(metric.trendValue || 0).toFixed(1)}%
									</Badge>
								)}
							</Group>
							<Text fw={700} size='lg'>
								{metric.value.toFixed(1)}
								{metric.unit}
							</Text>
						</Card>
					))}
				</SimpleGrid>
			</div>

			<div>
				<Text fw={600} size='sm' mb='md'>
					Objection Handling
				</Text>
				<Stack gap='md'>
					{objectionHandling.map((obj) => (
						<Card key={obj.reason} withBorder p='md'>
							<Group justify='space-between' mb='xs'>
								<Text size='sm' fw={500}>
									{obj.reason}
								</Text>
								<Badge size='sm' variant='light'>
									{obj.count} calls
								</Badge>
							</Group>
							<Stack gap='xs' mb='xs'>
								<Progress value={obj.percentage} size='sm' />
								<Text size='sm' fw={500}>
									{obj.percentage}%
								</Text>
							</Stack>
						</Card>
					))}
				</Stack>
			</div>

			<div>
				<Text fw={600} size='sm' mb='md'>
					Competitor Mentions
				</Text>
				<SimpleGrid cols={3} spacing='lg'>
					{competitors.map((comp) => (
						<Card key={comp.name} withBorder p='md'>
							<Group justify='space-between' mb='xs'>
								<Text size='sm' fw={500}>
									{comp.name}
								</Text>
								<ThemeIcon
									size='sm'
									variant='light'
									color={
										comp.sentiment === 'positive'
											? 'green'
											: comp.sentiment === 'negative'
												? 'red'
												: 'gray'
									}
								>
									{comp.sentiment === 'positive' ? (
										<IconTrendingUp size={14} />
									) : comp.sentiment === 'negative' ? (
										<IconAlertCircle size={14} />
									) : (
										<IconUsers size={14} />
									)}
								</ThemeIcon>
							</Group>
							<Text fw={700} size='lg'>
								{comp.mentions} mentions
							</Text>
						</Card>
					))}
				</SimpleGrid>
			</div>
		</Stack>
	);
};

export default BusinessView;
