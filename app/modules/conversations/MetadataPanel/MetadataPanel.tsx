import { Box, Group, Paper, Stack, Text, Progress, Badge } from '@mantine/core';
import { IconClock, IconCoin, IconThumbUp, IconThumbDown, IconInfoCircle } from '@tabler/icons-react';
import type { Metadata } from '~/models/ConversationsModels';
import styles from './MetadataPanel.module.css';

interface MetadataPanelProps {
  metadata: Metadata;
}

export function MetadataPanel({ metadata }: MetadataPanelProps) {
  const { cost, feedback, call_duration_secs, termination_reason, start_time_unix_secs } = metadata;
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  };
  
  const formatDate = (unixSeconds: number) => {
    try {
      const date = new Date(unixSeconds * 1000);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  return (
    <Paper p="md" withBorder className={styles.paper}>
      <Text size="sm" fw={500} mb="md">Call Metadata</Text>
      
      <Stack gap="md">
        {/* Duration */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconClock size={16} />
            <Text size="sm">Duration</Text>
          </Group>
          <Text size="sm">{formatDuration(call_duration_secs)}</Text>
        </Group>
        
        {/* Start Time */}
        {start_time_unix_secs && (
          <Group justify="space-between">
            <Group gap="xs">
              <IconClock size={16} />
              <Text size="sm">Start Time</Text>
            </Group>
            <Text size="sm">{formatDate(start_time_unix_secs)}</Text>
          </Group>
        )}
        
        {/* Cost */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconCoin size={16} />
            <Text size="sm">Cost</Text>
          </Group>
          <Text size="sm">{formatCost(cost)}</Text>
        </Group>
        
        {/* Termination Reason */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconInfoCircle size={16} />
            <Text size="sm">Termination Reason</Text>
          </Group>
          <Badge color="gray" variant="light">
            {termination_reason || 'Unknown'}
          </Badge>
        </Group>
        
        {/* Feedback */}
        {feedback && (
          <Box>
            <Text size="sm" mb="xs">Feedback</Text>
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconThumbUp size={16} />
                  <Text size="sm">Likes</Text>
                </Group>
                <Text size="sm">{feedback.likes}</Text>
              </Group>
              
              <Group justify="space-between">
                <Group gap="xs">
                  <IconThumbDown size={16} />
                  <Text size="sm">Dislikes</Text>
                </Group>
                <Text size="sm">{feedback.dislikes}</Text>
              </Group>
              
              {feedback.overall_score !== null && (
                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Overall Score</Text>
                    <Text size="sm">{feedback.overall_score}/10</Text>
                  </Group>
                  <Progress 
                    value={feedback.overall_score * 10} 
                    color={feedback.overall_score >= 7 ? 'green' : feedback.overall_score >= 4 ? 'yellow' : 'red'}
                  />
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

export default MetadataPanel;
