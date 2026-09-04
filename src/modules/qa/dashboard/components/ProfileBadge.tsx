import React from 'react';
import { Paper, Group, Avatar, Stack, Text, Badge } from '@mantine/core';

interface ProfileBadgeProps {
	name: string;
	role?: string;
	status?: 'active' | 'inactive' | 'on-break';
	score?: number;
	imageUrl?: string;
	onClick?: () => void;
}

const statusColor = {
	active: 'green',
	inactive: 'gray',
	'on-break': 'yellow',
};

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({
	name,
	role,
	status,
	score,
	imageUrl,
	onClick,
}) => {
	return (
		<Paper
			p='md'
			radius='md'
			withBorder
			style={{ cursor: onClick ? 'pointer' : 'default' }}
			onClick={onClick}
		>
			<Group>
				<Avatar
					src={imageUrl}
					name={name}
					color='blue'
					size='lg'
					radius='md'
				/>
				<Stack gap='xs' style={{ flex: 1 }}>
					<Group justify='space-between' align='center'>
						<div>
							<Text fw={500} size='sm'>
								{name}
							</Text>
							{role && (
								<Text size='xs' c='dimmed'>
									{role}
								</Text>
							)}
						</div>
						{status && (
							<Badge color={statusColor[status]} variant='dot' size='sm'>
								{status}
							</Badge>
						)}
					</Group>
					{score !== undefined && (
						<Text size='sm' fw={600} c='blue'>
							Score: {score}%
						</Text>
					)}
				</Stack>
			</Group>
		</Paper>
	);
};
