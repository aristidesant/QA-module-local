import React from 'react';
import { Group, Progress, Stack, Text } from '@mantine/core';
import type { ToneScores } from '../types';
import styles from './ToneScoreCard.module.css';

interface ToneScoreCardProps {
  scores: ToneScores;
}

export default function ToneScoreCard({ scores }: ToneScoreCardProps) {
  const tones = [
    { label: 'Polite', value: scores.polite },
    { label: 'Professional', value: scores.professional },
    { label: 'Empathetic', value: scores.empathetic },
  ];

  const getColor = (value: number) => {
    if (value >= 85) return 'green';
    if (value >= 70) return 'yellow';
    return 'red';
  };

  return (
    <Stack gap='md' className={styles.container}>
      <Text fw={600} size='sm'>
        Tone & Communication
      </Text>

      <Stack gap='lg'>
        {tones.map((tone) => (
          <div key={tone.label}>
            <Group justify='space-between' mb='xs'>
              <Text size='sm' fw={500}>
                {tone.label}
              </Text>
              <Text size='sm' fw={600} c={getColor(tone.value)}>
                {tone.value}%
              </Text>
            </Group>
            <Progress
              value={tone.value}
              color={getColor(tone.value)}
              size='sm'
              radius='md'
            />
          </div>
        ))}
      </Stack>

      <div className={styles.summary}>
        <Text size='xs' c='dimmed'>
          ✓ Agent demonstrated strong professional and empathetic communication
        </Text>
      </div>
    </Stack>
  );
}
