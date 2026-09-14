import { useTranslation } from 'react-i18next';
import {
	Stack,
	Card,
	Text,
	Progress,
	Group,
	Badge,
	ThemeIcon,
	SimpleGrid,
	Button,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconAlertCircle,
	IconTrendingDown,
} from '@tabler/icons-react';

interface BurnoutAgent {
	agentId: string;
	agentName: string;
	riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
	riskScore: number;
	drivers: string[];
	lastCheckIn?: string;
}

const BurnoutView = () => {
	const { t } = useTranslation('qa.teamAnalytics');

	const burnoutCandidates: BurnoutAgent[] = [
		{
			agentId: 'AG-001',
			agentName: 'Agent Smith',
			riskLevel: 'HIGH',
			riskScore: 85,
			drivers: [
				'Negative sentiment trend',
				'High after-hours calls',
				'QA score decline',
			],
			lastCheckIn: '2 days ago',
		},
		{
			agentId: 'AG-002',
			agentName: 'Agent Johnson',
			riskLevel: 'MEDIUM',
			riskScore: 62,
			drivers: ['Negative emotion above threshold', 'QA score dip'],
			lastCheckIn: '1 week ago',
		},
		{
			agentId: 'AG-003',
			agentName: 'Agent Williams',
			riskLevel: 'MEDIUM',
			riskScore: 58,
			drivers: ['Workload increase 30% above team avg'],
			lastCheckIn: undefined,
		},
	];

	const getRiskColor = (level: 'HIGH' | 'MEDIUM' | 'LOW') => {
		switch (level) {
			case 'HIGH':
				return 'red';
			case 'MEDIUM':
				return 'orange';
			case 'LOW':
				return 'green';
		}
	};

	return (
		<Stack gap='lg'>
			<SimpleGrid cols={1} spacing='lg'>
				{burnoutCandidates.map((agent) => (
					<Card key={agent.agentId} withBorder p='lg'>
						<Group justify='space-between' mb='md'>
							<div>
								<Group gap='xs' mb='xs'>
									<Text fw={600} size='sm'>
										{agent.agentName}
									</Text>
									<Badge color={getRiskColor(agent.riskLevel)} variant='light'>
										{agent.riskLevel} RISK
									</Badge>
								</Group>
								<Text size='xs' c='dimmed'>
									Risk Score: {agent.riskScore}/100
								</Text>
							</div>
							<ThemeIcon
								size='lg'
								variant='light'
								color={getRiskColor(agent.riskLevel)}
							>
								{agent.riskLevel === 'HIGH' ? (
									<IconAlertTriangle size={20} />
								) : (
									<IconAlertCircle size={20} />
								)}
							</ThemeIcon>
						</Group>

						<Progress
							value={agent.riskScore}
							color={getRiskColor(agent.riskLevel)}
							mb='md'
						/>

						<Stack gap='xs' mb='md'>
							<Text size='xs' fw={500} c='dimmed'>
								{t('burnout.drivers')}
							</Text>
							{agent.drivers.map((driver, idx) => (
								<Group key={idx} gap='xs'>
									<IconTrendingDown size={14} />
									<Text size='sm'>{driver}</Text>
								</Group>
							))}
						</Stack>

						<Group justify='space-between'>
							<Text size='xs' c='dimmed'>
								{agent.lastCheckIn
									? `Last check-in: ${agent.lastCheckIn}`
									: 'No recent check-in'}
							</Text>
							<Button size='xs' variant='light'>
								{t('burnout.actionButton')}
							</Button>
						</Group>
					</Card>
				))}
			</SimpleGrid>

			<Text size='sm' c='dimmed'>
				{burnoutCandidates.length} agents identified in burnout analysis
			</Text>
		</Stack>
	);
};

export default BurnoutView;
