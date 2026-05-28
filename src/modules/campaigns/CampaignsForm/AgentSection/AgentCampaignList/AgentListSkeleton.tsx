import React from 'react';
import { Card, Group, Skeleton, Stack } from '@mantine/core';
import classes from './AgentListSkeleton.module.css';

const AgentListSkeleton: React.FC = () => (
	<Stack gap='sm'>
		<Card withBorder radius='lg' p='lg'>
			<Group gap='md' align='flex-start' wrap='nowrap'>
				<Skeleton height={52} width={52} circle />
				<Stack gap='xs' className={classes.content}>
					<Group gap='xs'>
						<Skeleton height={20} width={88} radius='xl' />
						<Skeleton height={20} width={60} radius='xl' />
					</Group>
					<Skeleton height={22} width='50%' radius='sm' />
					<Skeleton height={14} width='72%' radius='sm' />
				</Stack>
				<Skeleton height={20} width={20} radius='sm' />
			</Group>
		</Card>

		<Stack gap='xs'>
			{Array.from({ length: 2 }).map((_, index) => (
				<Card key={index} withBorder radius='md' p='md'>
					<Group gap='sm' align='center' wrap='nowrap'>
						<Skeleton height={40} width={40} circle />
						<Stack gap={4} className={classes.rowContent}>
							<Skeleton height={16} width='58%' radius='sm' />
							<Group gap='xs'>
								<Skeleton height={18} width={72} radius='xl' />
								<Skeleton height={18} width={56} radius='xl' />
							</Group>
						</Stack>
						<Skeleton height={20} width={20} radius='sm' />
					</Group>
				</Card>
			))}
		</Stack>
	</Stack>
);

export default AgentListSkeleton;
