import React from 'react';
import { SimpleGrid, Stack, Text, Group, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';

interface DisputeStatsProps {
	open?: number;
	approved?: number;
	rejected?: number;
}

export const DisputesStats: React.FC<DisputeStatsProps> = ({
	open = 0,
	approved = 0,
	rejected = 0,
}) => {
	return (
		<SectionCard title='Dispute Summary' description='Overview of all disputes'>
			<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>
				<Group>
					<ThemeIcon color='yellow' variant='light' size='lg'>
						<IconAlertCircle size={20} />
					</ThemeIcon>
					<Stack gap='xs'>
						<Text size='sm' c='dimmed'>
							Open
						</Text>
						<Text fw={700} size='lg'>
							{open}
						</Text>
					</Stack>
				</Group>
				<Group>
					<ThemeIcon color='green' variant='light' size='lg'>
						<IconCheck size={20} />
					</ThemeIcon>
					<Stack gap='xs'>
						<Text size='sm' c='dimmed'>
							Approved
						</Text>
						<Text fw={700} size='lg'>
							{approved}
						</Text>
					</Stack>
				</Group>
				<Group>
					<ThemeIcon color='red' variant='light' size='lg'>
						<IconX size={20} />
					</ThemeIcon>
					<Stack gap='xs'>
						<Text size='sm' c='dimmed'>
							Rejected
						</Text>
						<Text fw={700} size='lg'>
							{rejected}
						</Text>
					</Stack>
				</Group>
			</SimpleGrid>
		</SectionCard>
	);
};
