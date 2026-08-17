import React from 'react';
import {
	Card,
	Stack,
	Text,
	ThemeIcon,
	Group,
	RingProgress,
} from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';

interface ClientSentimentCardProps {
	score: number;
}

const ClientSentimentCard: React.FC<ClientSentimentCardProps> = ({ score }) => {
	const percentage = score * 10;
	const color = score >= 8 ? 'green' : score >= 6.5 ? 'blue' : 'red';

	return (
		<Card withBorder h='100%'>
			<Stack gap='lg' justify='center' h='100%'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap='xs'>
						<Text size='sm' c='dimmed' fw={500}>
							Client Sentiment Score
						</Text>
						<Group gap='xs' align='baseline'>
							<Text size='xl' fw={700}>
								{score.toFixed(1)}
							</Text>
							<Text size='xs' c='dimmed'>
								/ 10.0
							</Text>
						</Group>
					</Stack>
					<ThemeIcon size='lg' radius='md' variant='light' color={color}>
						<IconUsers size={32} />
					</ThemeIcon>
				</Group>
				<RingProgress
					sections={[{ value: percentage, color }]}
					label={
						<Stack gap={0} align='center' justify='center'>
							<Text fw={700} size='sm'>
								{percentage.toFixed(0)}%
							</Text>
						</Stack>
					}
					size={120}
					thickness={8}
				/>
			</Stack>
		</Card>
	);
};

export default ClientSentimentCard;
