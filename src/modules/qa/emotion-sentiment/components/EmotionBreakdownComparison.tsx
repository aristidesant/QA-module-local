import { Box, Grid, Stack, Table, Text, ThemeIcon } from '@mantine/core';
import {
  IconMoodAngry,
  IconMoodCry,
  IconMoodSmile,
  IconMoodWink,
  IconMoodSad,
  IconAlertCircle,
  IconHeartHandshake,
  IconMask,
  IconSparkles,
} from '@tabler/icons-react';
import styles from './EmotionBreakdownComparison.module.css';
import { Emotion, EmotionBreakdown, UserRole } from '../types';

interface EmotionBreakdownComparisonProps {
  agentEmotions: EmotionBreakdown[];
  clientEmotions: EmotionBreakdown[];
  teamAverages?: Record<Emotion, number>;
  role: UserRole;
}

const EMOTION_ICONS: Record<Emotion, React.ReactNode> = {
  RAGE: <IconMoodAngry size={16} />,
  ANGER: <IconMoodAngry size={16} />,
  FRUSTRATION: <IconMoodCry size={16} />,
  DISAPPOINTMENT: <IconMoodCry size={16} />,
  SADNESS: <IconMoodSad size={16} />,
  FEAR: <IconAlertCircle size={16} />,
  NEUTRAL: <IconMask size={16} />,
  SURPRISE: <IconMoodSmile size={16} />,
  RELIEF: <IconMoodSmile size={16} />,
  SATISFACTION: <IconMoodWink size={16} />,
  GRATITUDE: <IconHeartHandshake size={16} />,
  JOY: <IconSparkles size={16} />,
  ELATION: <IconSparkles size={16} />,
};

const EMOTION_COLORS: Record<Emotion, string> = {
  RAGE: 'red',
  ANGER: 'red',
  FRUSTRATION: 'orange',
  DISAPPOINTMENT: 'orange',
  SADNESS: 'orange',
  FEAR: 'yellow',
  NEUTRAL: 'gray',
  SURPRISE: 'blue',
  RELIEF: 'teal',
  SATISFACTION: 'teal',
  GRATITUDE: 'teal',
  JOY: 'green',
  ELATION: 'green',
};

interface EmotionRowProps {
  emotion: Emotion;
  percentage: number;
  teamAvgPct?: number;
  role: UserRole;
}

function EmotionRow({ emotion, percentage, teamAvgPct, role }: EmotionRowProps) {
  const color = EMOTION_COLORS[emotion];
  const showDelta = role === 'agent' && teamAvgPct !== undefined;
  const delta = showDelta ? percentage - teamAvgPct : 0;
  const deltaSign = delta > 0 ? '+' : '';

  return (
    <Table.Tr key={emotion} className={styles.emotionRow}>
      <Table.Td className={styles.emotionName}>
        <Box style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ThemeIcon size={20} variant="light" color={color} radius="md">
            {EMOTION_ICONS[emotion]}
          </ThemeIcon>
          <Text size="sm" fw={500}>
            {emotion}
          </Text>
        </Box>
      </Table.Td>
      <Table.Td align="right">
        <Text size="sm">{percentage}%</Text>
      </Table.Td>
      {showDelta && (
        <Table.Td align="right">
          <Text size="sm">
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
        </Table.Td>
      )}
    </Table.Tr>
  );
}

export function EmotionBreakdownComparison({
  agentEmotions,
  clientEmotions,
  teamAverages,
  role,
}: EmotionBreakdownComparisonProps) {
  const agentSorted = [...agentEmotions].sort((a, b) => b.percentage - a.percentage);
  const clientSorted = [...clientEmotions].sort((a, b) => b.percentage - a.percentage);

  return (
    <Box className={styles.container}>
      <Grid gap="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <Box>
              <Text fw={500} size="sm" mb={12}>
                {role === 'agent' ? 'Your Emotions' : 'Agent Emotions'}
              </Text>
            </Box>
            <Table striped highlightOnHover className={styles.table}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className={styles.headerCell}>Emotion</Table.Th>
                  <Table.Th align="right" className={styles.headerCell}>
                    %
                  </Table.Th>
                  {role === 'agent' && (
                    <Table.Th align="right" className={styles.headerCell}>
                      vs team
                    </Table.Th>
                  )}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {agentSorted.map((item) => (
                  <EmotionRow
                    key={item.emotion}
                    emotion={item.emotion}
                    percentage={item.percentage}
                    teamAvgPct={teamAverages?.[item.emotion]}
                    role={role}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <Box>
              <Text fw={500} size="sm" mb={12}>
                Client Emotions
              </Text>
            </Box>
            <Table striped highlightOnHover className={styles.table}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className={styles.headerCell}>Emotion</Table.Th>
                  <Table.Th align="right" className={styles.headerCell}>
                    %
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {clientSorted.map((item) => (
                  <EmotionRow
                    key={item.emotion}
                    emotion={item.emotion}
                    percentage={item.percentage}
                    teamAvgPct={undefined}
                    role={role}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
