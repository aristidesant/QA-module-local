import React from 'react';
import { Button, Group, Tooltip } from '@mantine/core';
import { UserReactionType } from '../types/leaderboard';

interface ReactionButtonsProps {
  currentReaction: UserReactionType | null;
  onReactionChange: (reaction: UserReactionType | null) => void;
  disabled?: boolean;
}

const REACTION_OPTIONS = [
  { emoji: UserReactionType.THUMBS_UP, label: 'Thumbs Up' },
  { emoji: UserReactionType.CLAPPING_HANDS, label: 'Clapping Hands' },
  { emoji: UserReactionType.HEART, label: 'Heart' },
  { emoji: UserReactionType.FIRE, label: 'Fire' },
];

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  currentReaction,
  onReactionChange,
  disabled = false,
}) => {
  return (
    <Group gap='xs'>
      <span>React:</span>
      {REACTION_OPTIONS.map(({ emoji, label }) => (
        <Tooltip key={emoji} label={label} withArrow>
          <Button
            variant={currentReaction === emoji ? 'filled' : 'light'}
            size='sm'
            p={8}
            onClick={() => {
              if (currentReaction === emoji) {
                onReactionChange(null); // Toggle off
              } else {
                onReactionChange(emoji);
              }
            }}
            disabled={disabled}
          >
            <span style={{ fontSize: '1.2em' }}>{emoji}</span>
          </Button>
        </Tooltip>
      ))}
    </Group>
  );
};

export default ReactionButtons;
