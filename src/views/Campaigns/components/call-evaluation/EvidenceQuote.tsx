import { Badge, Group, Paper, Text } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import type { Evidence } from '../../types';

interface EvidenceQuoteProps {
  evidence: Evidence;
}

export function EvidenceQuote({ evidence }: EvidenceQuoteProps) {
  return (
    <Paper withBorder radius="sm" p="xs" bg="var(--mantine-color-gray-light)">
      <Group gap="xs" mb="xs">
        <Badge size="xs" variant="light" color={evidence.speaker === 'agent' ? 'blue' : 'gray'}>
          {evidence.speaker === 'agent' ? 'Agent' : 'Customer'}
        </Badge>
        <Group gap={4}>
          <IconClock size={12} />
          <Text size="xs" c="dimmed">{evidence.timestamp}</Text>
        </Group>
      </Group>
      <Text size="sm" fs="italic">"{evidence.quote}"</Text>
    </Paper>
  );
}
