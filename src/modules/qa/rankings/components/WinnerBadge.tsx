import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Tooltip } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';

interface WinnerBadgeProps {
	isWinner: boolean;
}

/** Flags the #1 position once the ranking is complete — flat yellow, matching the podium's gold. */
export const WinnerBadge: React.FC<WinnerBadgeProps> = ({ isWinner }) => {
	const { t } = useTranslation('qa.rankings');
	if (!isWinner) return null;

	return (
		<Tooltip label={t('drawer.winnerHint')} withArrow>
			<Badge
				variant='light'
				color='yellow'
				size='lg'
				radius='sm'
				leftSection={<IconTrophy size={14} />}
			>
				{t('drawer.winner')}
			</Badge>
		</Tooltip>
	);
};

export default WinnerBadge;
