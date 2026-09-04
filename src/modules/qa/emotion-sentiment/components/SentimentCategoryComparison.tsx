import { Box, Grid, Group, Progress, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconMoodAngry,
  IconMoodSad,
  IconMoodSmile,
  IconMoodCry,
  IconMoodEmpty,
} from '@tabler/icons-react';
import styles from './SentimentCategoryComparison.module.css';
import {
  SentimentCategory,
  SentimentDistribution,
  TeamBenchmark,
  UserRole,
} from '../types';

interface SentimentCategoryComparisonProps {
  agentCategories: SentimentDistribution;
  clientCategories: SentimentDistribution;
  teamAverage?: Record<SentimentCategory, number>;
  role: UserRole;
}

const CATEGORY_CONFIG: Record<
  SentimentCategory,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  'very-negative': {
    label: 'Very Negative',
    color: 'red',
    icon: <IconMoodAngry size={18} />,
  },
  negative: {
    label: 'Negative',
    color: 'orange',
    icon: <IconMoodSad size={18} />,
  },
  neutral: {
    label: 'Neutral',
    color: 'gray',
    icon: <IconMoodEmpty size={18} />,
  },
  positive: {
    label: 'Positive',
    color: 'teal',
    icon: <IconMoodSmile size={18} />,
  },
  'very-positive': {
    label: 'Very Positive',
    color: 'green',
    icon: <IconMoodSmile size={18} />,
  },
};

const CATEGORY_ORDER: SentimentCategory[] = [
  'very-negative',
  'negative',
  'neutral',
  'positive',
  'very-positive',
];

interface CategoryItemProps {
  category: SentimentCategory;
  percentage: number;
  teamAvgPct?: number;
  role: UserRole;
  isAgent?: boolean;
}

function CategoryItem({
  category,
  percentage,
  teamAvgPct,
  role,
  isAgent = false,
}: CategoryItemProps) {
  const config = CATEGORY_CONFIG[category];
  const showDelta = role === 'agent' && isAgent && teamAvgPct !== undefined;
  const delta = showDelta ? percentage - teamAvgPct : 0;
  const deltaSign = delta > 0 ? '+' : '';

  return (
    <Box className={styles.categoryItem}>
      <Group gap={8} mb={8}>
        <ThemeIcon size={24} variant="light" color={config.color} radius="md">
          {config.icon}
        </ThemeIcon>
        <Text size="sm" fw={500} style={{ flex: 1 }}>
          {config.label}
        </Text>
      </Group>

      <Stack gap={4}>
        <Group justify="space-between" gap={8}>
          <Progress value={percentage} color={config.color} size={20} radius="md" style={{ flex: 1 }} />
          <Text size="sm" fw={500} style={{ minWidth: '40px', textAlign: 'right' }}>
            {percentage}%
          </Text>
        </Group>

        {showDelta && (
          <Text size="xs" style={{ minWidth: '40px', textAlign: 'right' }}>
            <span
              style={{
                color:
                  delta > 0
                    ? 'var(--mantine-color-teal-6)'
                    : delta < 0
                      ? 'var(--mantine-color-red-6)'
                      : 'var(--mantine-color-gray-6)',
              }}
            >
              {deltaSign}
              {delta}%
            </span>
          </Text>
        )}
        {!showDelta && !isAgent && (
          <Text size="xs" c="dimmed">
            team avg
          </Text>
        )}
      </Stack>
    </Box>
  );
}

export function SentimentCategoryComparison({
  agentCategories,
  clientCategories,
  teamAverage,
  role,
}: SentimentCategoryComparisonProps) {
  const columnLabel = role === 'agent' ? 'Your Emotions' : 'Agent Emotions';

  return (
    <Box className={styles.container}>
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="lg">
            <Text fw={500} size="sm">
              {columnLabel}
            </Text>
            <Stack gap="md">
              {CATEGORY_ORDER.map((cat) => (
                <CategoryItem
                  key={`agent-${cat}`}
                  category={cat}
                  percentage={agentCategories[cat].percentage}
                  teamAvgPct={teamAverage?.[cat]}
                  role={role}
                  isAgent={true}
                />
              ))}
            </Stack>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="lg">
            <Text fw={500} size="sm">
              Client Emotions
            </Text>
            <Stack gap="md">
              {CATEGORY_ORDER.map((cat) => (
                <CategoryItem
                  key={`client-${cat}`}
                  category={cat}
                  percentage={clientCategories[cat].percentage}
                  teamAvgPct={undefined}
                  role={role}
                  isAgent={false}
                />
              ))}
            </Stack>
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
