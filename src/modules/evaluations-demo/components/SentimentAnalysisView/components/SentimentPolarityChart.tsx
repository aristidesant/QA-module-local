import React from 'react';
import { Stack, Text } from '@mantine/core';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { SentimentPolarity } from '../types';
import styles from './SentimentPolarityChart.module.css';

interface SentimentPolarityChartProps {
  polarity: SentimentPolarity;
}

export default function SentimentPolarityChart({
  polarity,
}: SentimentPolarityChartProps) {
  const data = [
    { name: 'Positive', value: polarity.positive, fill: '#51cf66' },
    { name: 'Neutral', value: polarity.neutral, fill: '#909090' },
    { name: 'Negative', value: polarity.negative, fill: '#ff6b6b' },
  ];

  return (
    <Stack gap='sm' className={styles.container}>
      <div>
        <Text fw={600} size='sm'>
          Sentiment Polarity
        </Text>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width='100%' height={120}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='var(--mantine-color-gray-3)'
            />
            <XAxis
              dataKey='name'
              stroke='var(--mantine-color-gray-5)'
              style={{ fontSize: '11px' }}
              tick={{ fill: 'var(--mantine-color-gray-6)' }}
            />
            <YAxis
              stroke='var(--mantine-color-gray-5)'
              style={{ fontSize: '11px' }}
              tick={{ fill: 'var(--mantine-color-gray-6)' }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--mantine-color-gray-8)',
                border: '1px solid var(--mantine-color-gray-6)',
                borderRadius: '4px',
                padding: '8px',
              }}
              labelStyle={{ color: 'var(--mantine-color-gray-1)' }}
              formatter={(value) => `${value}%`}
            />
            <Bar dataKey='value' radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legend}>
        {data.map((item) => (
          <div key={item.name} className={styles.legendItem}>
            <div
              className={styles.legendDot}
              style={{ backgroundColor: item.fill }}
            />
            <Text size='xs'>{item.name}: {item.value}%</Text>
          </div>
        ))}
      </div>
    </Stack>
  );
}
