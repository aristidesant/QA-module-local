import React from 'react';
import { Group, Progress, Stack, Text } from '@mantine/core';
import type { AgentPerformance } from '../types';
import styles from './AgentPerformanceCard.module.css';

interface AgentPerformanceCardProps {
  performance: AgentPerformance;
}

export default function AgentPerformanceCard({
  performance,
}: AgentPerformanceCardProps) {
  const getColor = (value: number) => {
    if (value >= 85) return 'green';
    if (value >= 70) return 'yellow';
    return 'red';
  };

  return (
    <Stack gap='md' className={styles.container}>
      <Text fw={600} size='sm'>
        Agent Performance
      </Text>

      <Stack gap='lg'>
        <div>
          <Group justify='space-between' mb='xs'>
            <Text size='sm' fw={500}>
              Empathy Score
            </Text>
            <Text
              size='sm'
              fw={600}
              c={getColor(performance.empathyScore)}
            >
              {performance.empathyScore}/100
            </Text>
          </Group>
          <Progress
            value={performance.empathyScore}
            color={getColor(performance.empathyScore)}
            size='sm'
            radius='md'
          />
        </div>

        <div>
          <Group justify='space-between' mb='xs'>
            <Text size='sm' fw={500}>
              Response Effectiveness
            </Text>
            <Text size='sm' fw={600} c='green'>
              +{performance.responseEffectiveness}%
            </Text>
          </Group>
          <Progress
            value={Math.min(
              100,
              (performance.responseEffectiveness / 100) * 100
            )}
            color='green'
            size='sm'
            radius='md'
          />
        </div>

        <div>
          <Group justify='space-between' mb='xs'>
            <Text size='sm' fw={500}>
              Issues Acknowledged
            </Text>
            <Text size='sm' fw={600}>
              {performance.issuesAcknowledged}/{performance.totalIssues}
            </Text>
          </Group>
          <Progress
            value={
              (performance.issuesAcknowledged /
                performance.totalIssues) *
              100
            }
            color={
              performance.issuesAcknowledged ===
              performance.totalIssues
                ? 'green'
                : 'yellow'
            }
            size='sm'
            radius='md'
          />
        </div>
      </Stack>

      <div className={styles.summary}>
        <Stack gap={6}>
          <Text size='xs' fw={600}>
            Key Strengths:
          </Text>
          <ul className={styles.list}>
            <li>Excellent empathetic communication (95%)</li>
            <li>Effectively recovered negative sentiment (+65%)</li>
            <li>Acknowledged all customer concerns</li>
          </ul>
        </Stack>
      </div>
    </Stack>
  );
}
