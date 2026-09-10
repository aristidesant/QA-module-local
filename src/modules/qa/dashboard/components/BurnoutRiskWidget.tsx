import React from 'react';
import { Stack, Progress, Group, Text, Badge, ThemeIcon } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { BurnoutRiskData, BurnoutRiskLevel } from '../types/burnoutRisk';

interface BurnoutRiskWidgetProps {
  data: BurnoutRiskData;
}

const BurnoutRiskWidget: React.FC<BurnoutRiskWidgetProps> = ({ data }) => {
  const { t } = useTranslation('qa.dashboard');

  const getRiskColor = (level: BurnoutRiskLevel): string => {
    switch (level) {
      case 'low':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'high':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <IconTrendingDown size={16} />;
      case 'declining':
        return <IconTrendingUp size={16} />;
      default:
        return <IconMinus size={16} />;
    }
  };

  return (
    <Stack gap='md'>
      {/* Header with level badge */}
      <Group justify='space-between'>
        <Text fw={600}>{t('burnout.title', 'Burnout Risk')}</Text>
        <Badge color={getRiskColor(data.level)} variant='light'>
          {t(`burnout.level.${data.level}`, data.level.toUpperCase())}
        </Badge>
      </Group>

      {/* Progress bar */}
      <Progress
        value={data.percentage}
        color={getRiskColor(data.level)}
        size='lg'
        radius='md'
      />

      {/* Percentage and trend */}
      <Group justify='space-between'>
        <Text size='sm' c='dimmed'>
          {data.percentage}%
        </Text>
        <Group gap='xs'>
          <ThemeIcon variant='light' size='sm' radius='md'>
            {getTrendIcon(data.trend)}
          </ThemeIcon>
          <Text size='sm' c='dimmed'>
            {t(`burnout.trend.${data.trend}`, data.trend)}
          </Text>
        </Group>
      </Group>
    </Stack>
  );
};

export default BurnoutRiskWidget;
