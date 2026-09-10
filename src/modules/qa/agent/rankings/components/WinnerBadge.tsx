import React from 'react';
import { Badge, Tooltip } from '@mantine/core';

interface WinnerBadgeProps {
  isWinner: boolean;
}

export const WinnerBadge: React.FC<WinnerBadgeProps> = ({ isWinner }) => {
  if (!isWinner) return null;

  return (
    <Tooltip label='Period winner' withArrow>
      <Badge
        variant='gradient'
        gradient={{ from: 'gold', to: 'orange' }}
        size='lg'
        radius='sm'
      >
        <span aria-hidden>🏆</span> Winner
      </Badge>
    </Tooltip>
  );
};

export default WinnerBadge;
