import React from 'react';
import { Badge, Stack, Text } from '@mantine/core';
import type { EmpathyIndicator } from '../types';
import styles from './EmpathyIndicatorsCard.module.css';

interface EmpathyIndicatorsCardProps {
  indicators: EmpathyIndicator[];
}

export default function EmpathyIndicatorsCard({
  indicators,
}: EmpathyIndicatorsCardProps) {
  return (
    <Stack gap='md' className={styles.container}>
      <Text fw={600} size='sm'>
        Empathy Indicators
      </Text>

      <Stack gap='sm'>
        {indicators.map((indicator, idx) => (
          <div key={idx} className={styles.indicator}>
            <div className={styles.content}>
              <Badge
                size='xs'
                variant='light'
                color='blue'
                className={styles.time}
              >
                {indicator.timestamp}
              </Badge>
              <Text fw={500} size='sm' className={styles.phrase}>
                "{indicator.phrase}"
              </Text>
              <Text size='xs' c='dimmed' className={styles.context}>
                {indicator.context}
              </Text>
            </div>
            <div className={styles.icon}>💙</div>
          </div>
        ))}
      </Stack>

      <div className={styles.summary}>
        <Text size='xs' c='dimmed'>
          ✓ Agent used {indicators.length} empathetic phrases to demonstrate
          understanding and support
        </Text>
      </div>
    </Stack>
  );
}
