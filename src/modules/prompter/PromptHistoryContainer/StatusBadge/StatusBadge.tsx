import React from 'react';
import { Badge } from '@mantine/core';
import type { Prompt } from '~/models/PromptModel';

interface StatusBadgeProps {
	status: Prompt['status'];
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'ACTIVE':
				return 'green';
			case 'INACTIVE':
				return 'gray';
			default:
				return 'blue';
		}
	};

	return (
		<Badge size='sm' variant='light' color={getStatusColor(status)}>
			{status}
		</Badge>
	);
};
