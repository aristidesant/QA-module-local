import React from 'react';
import { SimpleGrid, Card, Text, Group, Badge, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';

interface CriticalIssue {
	id: string;
	type: 'compliance' | 'emotion' | 'autofail' | 'recovery';
	title: string;
	count: number;
	severity: 'critical' | 'high';
	description: string;
	affectedEntities: string[];
	trend: 'up' | 'down' | 'stable';
}

interface CriticalIssuesPanelProps {
	issues: CriticalIssue[];
}

const CriticalIssuesPanel: React.FC<CriticalIssuesPanelProps> = ({
	issues,
}) => {
	const getSeverityColor = (severity: 'critical' | 'high') => {
		return severity === 'critical' ? 'red' : 'orange';
	};

	const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
		switch (trend) {
			case 'up':
				return '↑';
			case 'down':
				return '↓';
			case 'stable':
				return '→';
		}
	};

	if (issues.length === 0) {
		return (
			<SectionCard
				title='Critical Issues'
				description='High-severity issues requiring immediate attention'
			>
				<Group justify='center' py='lg'>
					<Text c='dimmed' size='sm'>
						No critical issues detected
					</Text>
				</Group>
			</SectionCard>
		);
	}

	return (
		<SectionCard
			title='Critical Issues'
			description='High-severity issues requiring immediate attention'
			headerAccent='red'
		>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 2 }} spacing='md'>
				{issues.map((issue) => (
					<Card key={issue.id} withBorder>
						<Group justify='space-between' align='flex-start' mb='sm'>
							<Stack gap={4}>
								<Text fw={600} size='sm'>
									{issue.title}
								</Text>
								<Text size='xs' c='dimmed'>
									{issue.description}
								</Text>
							</Stack>
							<Badge
								color={getSeverityColor(issue.severity)}
								variant='filled'
								size='lg'
								fw={700}
								leftSection={<IconAlertTriangle size={14} />}
							>
								{issue.count}
							</Badge>
						</Group>

						<Group justify='space-between' mt='md'>
							{/* inline-style-allow: flex layout for affected entities column */}
							<Stack gap={4} style={{ flex: 1 }}>
								<Text size='xs' fw={500} c='dimmed'>
									Affected:
								</Text>
								<Group gap={4}>
									{issue.affectedEntities.slice(0, 2).map((entity) => (
										<Badge key={entity} size='sm' variant='outline'>
											{entity}
										</Badge>
									))}
									{issue.affectedEntities.length > 2 && (
										<Badge size='sm' variant='outline'>
											+{issue.affectedEntities.length - 2}
										</Badge>
									)}
								</Group>
							</Stack>
							<Text size='xl' fw={700} c={getSeverityColor(issue.severity)}>
								{getTrendIcon(issue.trend)}
							</Text>
						</Group>
					</Card>
				))}
			</SimpleGrid>
		</SectionCard>
	);
};

export default CriticalIssuesPanel;
