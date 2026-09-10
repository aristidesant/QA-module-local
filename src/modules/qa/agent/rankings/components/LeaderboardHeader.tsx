import React from 'react';
import { Group, Stack, Text, Title, Progress, Badge } from '@mantine/core';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import type { LeaderboardMetadata } from '../types/leaderboard';

interface LeaderboardHeaderProps {
  metadata: LeaderboardMetadata;
  daysRemaining: number;
}

export const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({
  metadata,
  daysRemaining,
}) => {
  const startDate = new Date(metadata.startDate);
  const endDate = new Date(metadata.endDate);
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = totalDays - daysRemaining;
  const percentComplete = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;

  return (
    <Stack gap='md'>
      <div>
        <Group justify='space-between' align='flex-start'>
          <div>
            <Title order={2}>{metadata.name}</Title>
            {metadata.description && (
              <Text c='dimmed' mt='xs'>{metadata.description}</Text>
            )}
          </div>
          <Badge size='lg' variant='light'>
            {metadata.scoreType}
          </Badge>
        </Group>
      </div>

      <Group gap='xl'>
        <div>
          <Text size='xs' c='dimmed' tt='uppercase' fw={600}>Start Date</Text>
          <Group gap={4} mt={4}>
            <IconCalendar size={16} />
            <Text size='sm'>{startDate.toLocaleDateString()}</Text>
          </Group>
        </div>
        <div>
          <Text size='xs' c='dimmed' tt='uppercase' fw={600}>End Date</Text>
          <Group gap={4} mt={4}>
            <IconClock size={16} />
            <Text size='sm'>{endDate.toLocaleDateString()}</Text>
          </Group>
        </div>
        <div>
          <Text size='xs' c='dimmed' tt='uppercase' fw={600}>Days Remaining</Text>
          <Text size='sm' fw={600}>{Math.max(0, daysRemaining)}</Text>
        </div>
      </Group>

      <Progress value={percentComplete} radius='md' size='sm' />
    </Stack>
  );
};

export default LeaderboardHeader;
