import React from 'react';
import { Badge, Tooltip } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';

interface WinnerBadgeProps {
	isWinner: boolean;
}

/** Flags the #1 position once the ranking is complete — flat yellow, matching the podium's gold. */
export const WinnerBadge: React.FC<WinnerBadgeProps> = ({ isWinner }) => {
	if (!isWinner) return null;

	return (
		<Tooltip label='Period winner' withArrow>
			<Badge
				variant='light'
				color='yellow'
				size='lg'
				radius='sm'
				leftSection={<IconTrophy size={14} />}
			>
				Winner
			</Badge>
		</Tooltip>
	);
};

export default WinnerBadge;
