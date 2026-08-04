import React from 'react';
import { Stack, Text } from '@mantine/core';
import type { KeyMoment } from '../types';
import styles from './KeyMomentsCard.module.css';

const MOMENT_CONFIG: Record<
  KeyMoment['type'],
  { emoji: string; label: string }
> = {
  issue: { emoji: '⚠️', label: 'Issue identified' },
  peak: { emoji: '📈', label: 'Emotion peaks' },
  'turning-point': { emoji: '✨', label: 'Turning point' },
  resolution: { emoji: '✅', label: 'Resolution' },
};

interface KeyMomentsCardProps {
  moments: KeyMoment[];
}

export default function KeyMomentsCard({ moments }: KeyMomentsCardProps) {
  return (
    <Stack gap='sm' className={styles.container}>
      <Text fw={600} size='sm'>
        Key Moments
      </Text>

      <Stack gap='sm' className={styles.moments}>
        {moments.map((moment) => {
          const config = MOMENT_CONFIG[moment.type];
          return (
            <div key={moment.timestamp} className={styles.moment}>
              <div className={styles.time}>{moment.timestamp}</div>
              <div className={styles.content}>
                <Text size='xs' fw={600} className={styles.label}>
                  {config.emoji} {config.label}
                </Text>
                <Text size='xs' c='dimmed' className={styles.description}>
                  {moment.description}
                </Text>
              </div>
            </div>
          );
        })}
      </Stack>
    </Stack>
  );
}
