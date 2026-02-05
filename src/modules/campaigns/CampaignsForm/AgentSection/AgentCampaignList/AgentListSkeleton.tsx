import React from 'react';
import { Card, Skeleton, Stack, Group, Box } from '@mantine/core';

const AgentListSkeleton: React.FC = () => (
	<Stack gap='sm'>
		{/* Agent Profile Card Skeleton */}
		<Card withBorder radius='md' p='md'>
			<Group gap='xs' mb='sm'>
				<Skeleton height={16} width={16} radius='sm' />
				<Skeleton height={14} width={100} radius='sm' />
			</Group>
			<Group gap='md'>
				<Skeleton height={48} width={48} circle />
				<Stack gap='xs' style={{ flex: 1 }}>
					<Skeleton height={16} width='60%' radius='sm' />
					<Skeleton height={12} width='40%' radius='sm' />
				</Stack>
			</Group>
		</Card>

		{/* Voice Card Skeleton */}
		<Card withBorder radius='md' p='md'>
			<Group gap='xs' mb='sm'>
				<Skeleton height={16} width={16} radius='sm' />
				<Skeleton height={14} width={80} radius='sm' />
			</Group>
			<Group gap='md'>
				<Skeleton height={40} width={40} radius='md' />
				<Box style={{ flex: 1 }}>
					<Skeleton height={14} width='50%' radius='sm' />
				</Box>
			</Group>
		</Card>
	</Stack>
);

export default AgentListSkeleton;
