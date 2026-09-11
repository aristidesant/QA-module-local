import React from 'react';
import { useNavigate } from 'react-router';
import { Group, Text, Badge, Button, Stack, Table, ThemeIcon } from '@mantine/core';
import {
	IconGift,
	IconAlertTriangle,
	IconTrendingDown,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';

interface TriggerItem {
	type: 'AUTO_DRIVEN' | 'NEGATIVE' | 'TREND';
	title: string;
	count: number;
	description: string;
}

interface InboxSummaryProps {
	autoDrivenCount?: number;
	negativeCount?: number;
	trendCount?: number;
	inboxPath: string;
}

export const InboxSummary: React.FC<InboxSummaryProps> = ({
	autoDrivenCount = 3,
	negativeCount = 2,
	trendCount = 5,
	inboxPath,
}) => {
	const navigate = useNavigate();
	const totalCount = autoDrivenCount + negativeCount + trendCount;

	const triggers: TriggerItem[] = [
		{
			type: 'AUTO_DRIVEN',
			title: 'Auto Driven Recognition',
			count: autoDrivenCount,
			description: 'Achievements and badges earned this period',
		},
		{
			type: 'NEGATIVE',
			title: 'Negative Triggers',
			count: negativeCount,
			description: 'Performance or compliance issues detected',
		},
		{
			type: 'TREND',
			title: 'Trend Triggers',
			count: trendCount,
			description: 'Behavioral or pattern changes observed',
		},
	];

	const getIcon = (type: string) => {
		switch (type) {
			case 'AUTO_DRIVEN':
				return <IconGift size={18} />;
			case 'NEGATIVE':
				return <IconAlertTriangle size={18} />;
			case 'TREND':
				return <IconTrendingDown size={18} />;
			default:
				return null;
		}
	};

	const getColor = (type: string) => {
		switch (type) {
			case 'AUTO_DRIVEN':
				return 'green';
			case 'NEGATIVE':
				return 'red';
			case 'TREND':
				return 'orange';
			default:
				return 'gray';
		}
	};

	return (
		<SectionCard
			title='Inbox Summary'
			description={`${totalCount} trigger${totalCount !== 1 ? 's' : ''} this period`}
		>
			<Stack gap='md'>
				<Group justify='flex-end'>
					<Button
						variant='subtle'
						size='xs'
						onClick={() => navigate(inboxPath)}
					>
						View All →
					</Button>
				</Group>

				<div style={{ overflowX: 'auto' }}>
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Type</Table.Th>
								<Table.Th>Count</Table.Th>
								<Table.Th>Description</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{triggers.map((trigger) => (
								<Table.Tr key={trigger.type}>
									<Table.Td>
										<Group gap='sm'>
											<ThemeIcon
												size='sm'
												variant='light'
												color={getColor(trigger.type)}
												radius='md'
											>
												{getIcon(trigger.type)}
											</ThemeIcon>
											<Text fw={500} size='sm'>
												{trigger.title}
											</Text>
										</Group>
									</Table.Td>
									<Table.Td>
										<Badge
											size='lg'
											variant='filled'
											color={getColor(trigger.type)}
										>
											{trigger.count}
										</Badge>
									</Table.Td>
									<Table.Td>
										<Text size='sm' c='dimmed'>
											{trigger.description}
										</Text>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</div>
			</Stack>
		</SectionCard>
	);
};

export default InboxSummary;
