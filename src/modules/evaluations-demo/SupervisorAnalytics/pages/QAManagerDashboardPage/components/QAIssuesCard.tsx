import React from 'react';
import { Stack, Text, Group, Badge, Card, ThemeIcon } from '@mantine/core';
import {
	IconAlertTriangle,
	IconTrendingUp,
	IconTrendingDown,
	IconMinus,
} from '@tabler/icons-react';

interface QAIssue {
	category: string;
	count: number;
	trend: 'up' | 'down' | 'stable';
}

interface QAIssuesCardProps {
	issues: QAIssue[];
}

const QAIssuesCard: React.FC<QAIssuesCardProps> = ({ issues }) => {
	const getTrendIcon = (trend: string) => {
		switch (trend) {
			case 'up':
				return <IconTrendingUp size={14} />;
			case 'down':
				return <IconTrendingDown size={14} />;
			default:
				return <IconMinus size={14} />;
		}
	};

	const getTrendColor = (trend: string) => {
		switch (trend) {
			case 'up':
				return 'red';
			case 'down':
				return 'green';
			default:
				return 'gray';
		}
	};

	return (
		<Card withBorder h='100%'>
			<Stack gap='md' h='100%'>
				<Group gap='sm'>
					<ThemeIcon size='lg' radius='md' variant='light' color='yellow'>
						<IconAlertTriangle size={32} />
					</ThemeIcon>
					<div>
						<Text size='sm' c='dimmed' fw={500}>
							QA Issues
						</Text>
						<Text size='xs' c='dimmed'>
							This week
						</Text>
					</div>
				</Group>

				<Stack gap='xs'>
					{issues.map((issue, idx) => (
						<Group key={idx} justify='space-between' align='center'>
							<Text size='sm'>{issue.category}</Text>
							<Group gap='xs'>
								<Badge size='sm' variant='light' color='blue'>
									{issue.count}
								</Badge>
								<Badge
									size='sm'
									variant='light'
									color={getTrendColor(issue.trend)}
									leftSection={getTrendIcon(issue.trend)}
								>
									{issue.trend}
								</Badge>
							</Group>
						</Group>
					))}
				</Stack>
			</Stack>
		</Card>
	);
};

export default QAIssuesCard;
