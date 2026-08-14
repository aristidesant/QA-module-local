import React from 'react';
import { SimpleGrid, Card, Text, Group, Badge } from '@mantine/core';
import SectionCard from '~/components/SectionCard';

interface Alert {
	id: string;
	type: 'compliance' | 'sentiment' | 'trend';
	title: string;
	count: number;
	severity: 'high' | 'medium';
	description: string;
	affectedSupervisors: string[];
}

interface RiskAlertPanelProps {
	alerts: Alert[];
}

const RiskAlertPanel: React.FC<RiskAlertPanelProps> = ({ alerts }) => {
	const getSeverityColor = (severity: 'high' | 'medium') => {
		return severity === 'high' ? 'red' : 'orange';
	};

	return (
		<SectionCard
			title='Risk Alerts'
			description='High-priority issues requiring immediate attention'
		>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='md'>
				{alerts.map((alert) => (
					<Card key={alert.id} withBorder>
						<Group justify='space-between' mb='sm'>
							<Text fw={600} size='sm'>
								{alert.title}
							</Text>
							<Badge
								color={getSeverityColor(alert.severity)}
								variant='dot'
								size='lg'
								fw={700}
							>
								{alert.count}
							</Badge>
						</Group>
						<Text size='sm' c='dimmed' mb='sm'>
							{alert.description}
						</Text>
						{alert.affectedSupervisors.length > 0 && (
							<div>
								<Text size='xs' fw={500} mb='xs'>
									Affected Supervisors:
								</Text>
								<Group gap={4}>
									{alert.affectedSupervisors.map((supervisor) => (
										<Badge key={supervisor} size='sm' variant='outline'>
											{supervisor}
										</Badge>
									))}
								</Group>
							</div>
						)}
					</Card>
				))}
			</SimpleGrid>
		</SectionCard>
	);
};

export default RiskAlertPanel;
