import {
  Badge, ColorSwatch, Grid, Group, Paper, Progress, SimpleGrid, Stack, Text, ThemeIcon, Tooltip,
} from '@mantine/core';
import { IconArrowRight, IconCalendarEvent, IconHeadset, IconMicrophone2, IconTrendingDown, IconTrendingUp, IconUser, IconWaveSine, IconHeartHandshake } from '@tabler/icons-react';
import { SectionCard } from '~/components/SectionCard';
import {
  EMOTION_COLORS, EMOTION_LABELS, SENTIMENT_CATEGORIES, SENTIMENT_CATEGORY_ORDER,
} from '../../constants';
import type { CallSentimentEvaluation } from '../../types';
import { formatDuration, getScoreColor } from './scoreColor';
import { EvidenceQuote } from './EvidenceQuote';

interface SentimentEmotionPanelProps {
  sentiment: CallSentimentEvaluation;
}

export function SentimentEmotionPanel({ sentiment }: SentimentEmotionPanelProps) {
  const renderSpeakerCard = (speaker: 'agent' | 'customer') => {
    const data = speaker === 'agent' ? sentiment.agent : sentiment.customer;
    const categoryMeta = SENTIMENT_CATEGORIES[data.overallCategory];
    const Icon = categoryMeta.icon;

    return (
      <SectionCard
        key={speaker}
        title={speaker === 'agent' ? 'Agent' : 'Customer'}
        icon={speaker === 'agent' ? IconHeadset : IconUser}
      >
        {/* Headline */}
        <Group gap="md" align="center" mb="md">
          <ThemeIcon size={48} radius="md" variant="light" color={categoryMeta.color}>
            <Icon size={28} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={700} size="lg">{categoryMeta.label}</Text>
            <Text size="sm" c="dimmed">
              Score {data.overallScore.toFixed(1)} / 5.0 · Dominant: {EMOTION_LABELS[data.dominantEmotion]}
            </Text>
          </Stack>
        </Group>

        {/* Category distribution */}
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" mt="md" mb="xs">Sentiment categories</Text>
        <Progress.Root size="lg" mb="xs">
          {SENTIMENT_CATEGORY_ORDER.map(key => {
            const pct = data.categories[key];
            if (pct === 0) return null;
            const meta = SENTIMENT_CATEGORIES[key];
            return (
              <Tooltip key={key} label={`${meta.label} ${pct}%`}>
                <Progress.Section value={pct} color={meta.color} />
              </Tooltip>
            );
          })}
        </Progress.Root>

        {/* Legend */}
        <Group gap="sm" mb="md">
          {SENTIMENT_CATEGORY_ORDER.map(key => {
            const pct = data.categories[key];
            if (pct === 0) return null;
            const meta = SENTIMENT_CATEGORIES[key];
            return (
              <Group key={key} gap={4}>
                <ColorSwatch size={10} color={`var(--mantine-color-${meta.color}-6)`} />
                <Text size="xs">{meta.label} {pct}%</Text>
              </Group>
            );
          })}
        </Group>

        {/* Emotions */}
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="sm">Emotions detected</Text>
        <Stack gap={6}>
          {data.emotions.map(({ emotion, percentage }) => (
            <div key={emotion}>
              <Group justify="space-between" mb={4}>
                <Badge variant="light" color={EMOTION_COLORS[emotion]}>
                  {EMOTION_LABELS[emotion]}
                </Badge>
                <Text size="xs" c="dimmed">{percentage}%</Text>
              </Group>
              <Progress value={percentage} color={EMOTION_COLORS[emotion]} size="xs" />
            </div>
          ))}
        </Stack>
      </SectionCard>
    );
  };

  const detectedSignalsCount = sentiment.recovery.recovered ? 1 : 0;

  return (
    <Stack gap="md">
      {/* Speaker cards */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {renderSpeakerCard('agent')}
        {renderSpeakerCard('customer')}
      </SimpleGrid>

      {/* Recovery & Empathy */}
      <SectionCard
        title="Recovery & Empathy"
        description="How the customer's sentiment evolved and how the agent responded"
        icon={IconHeartHandshake}
      >
        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Text size="sm" fw={600} mb="md">Customer sentiment journey</Text>
            <Group gap="xs" align="center" wrap="nowrap">
              {/* Start */}
              <Paper withBorder p="sm" radius="sm" style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" mb={4}>Start</Text>
                <Badge color={SENTIMENT_CATEGORIES[sentiment.recovery.startCategory].color} variant="light" mb={4}>
                  {SENTIMENT_CATEGORIES[sentiment.recovery.startCategory].label}
                </Badge>
                <Text fw={700}>{sentiment.recovery.startScore.toFixed(1)}</Text>
              </Paper>

              {/* Arrow */}
              <IconArrowRight size={16} c="dimmed" />

              {/* Lowest */}
              <Paper withBorder p="sm" radius="sm" style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" mb={4}>Lowest at {sentiment.recovery.lowestAt}</Text>
                <Badge color={SENTIMENT_CATEGORIES[sentiment.recovery.lowestCategory].color} variant="light" mb={4}>
                  {SENTIMENT_CATEGORIES[sentiment.recovery.lowestCategory].label}
                </Badge>
                <Text fw={700}>{sentiment.recovery.lowestScore.toFixed(1)}</Text>
              </Paper>

              {/* Arrow */}
              <IconArrowRight size={16} c="dimmed" />

              {/* End */}
              <Paper withBorder p="sm" radius="sm" style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" mb={4}>End</Text>
                <Badge color={SENTIMENT_CATEGORIES[sentiment.recovery.endCategory].color} variant="light" mb={4}>
                  {SENTIMENT_CATEGORIES[sentiment.recovery.endCategory].label}
                </Badge>
                <Text fw={700}>{sentiment.recovery.endScore.toFixed(1)}</Text>
              </Paper>
            </Group>

            {/* Recovery stats */}
            <Group gap="xs" mt="sm" wrap="wrap">
              <Badge
                color={sentiment.recovery.recovered ? 'green' : 'red'}
                variant="filled"
                leftSection={sentiment.recovery.recovered ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
              >
                {sentiment.recovery.recovered ? 'Recovered' : 'Not recovered'}
              </Badge>
              <Badge variant="light" color="gray">
                Recovery time {formatDuration(sentiment.recovery.recoveryTimeSeconds)}
              </Badge>
              <Badge
                variant="light"
                color={sentiment.recovery.improvementDelta >= 0 ? 'teal' : 'red'}
              >
                {sentiment.recovery.improvementDelta >= 0 ? '+' : ''}{sentiment.recovery.improvementDelta.toFixed(1)} pts
              </Badge>
            </Group>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="sm">
              Empathy phrases ({sentiment.empathyIndicators.length})
            </Text>
            <Stack gap="xs">
              {sentiment.empathyIndicators.map((indicator, idx) => (
                <div key={idx}>
                  <EvidenceQuote evidence={{ timestamp: indicator.timestamp, speaker: 'agent', quote: indicator.phrase }} />
                  <Text size="xs" c="dimmed" mt={4}>{indicator.context}</Text>
                </div>
              ))}
            </Stack>
          </Grid.Col>
        </Grid>
      </SectionCard>

      {/* Agent Tone */}
      <SectionCard
        title="Agent Tone"
        description="Tone dimensions scored across the call"
        icon={IconMicrophone2}
      >
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
          {[
            { key: 'polite', label: 'Polite' },
            { key: 'professional', label: 'Professional' },
            { key: 'empathetic', label: 'Empathetic' },
            { key: 'consistency', label: 'Consistency' },
          ].map(({ key, label }) => {
            const value = sentiment.tone[key as keyof typeof sentiment.tone];
            return (
              <Paper key={key} withBorder p="sm" radius="sm">
                <Text size="xs" c="dimmed" mb={4}>{label}</Text>
                <Text fw={700} size="xl">{value}</Text>
                <Progress value={value} color={getScoreColor(value)} size="sm" mt={4} />
              </Paper>
            );
          })}
        </SimpleGrid>
      </SectionCard>

      {/* Speech Patterns */}
      <SectionCard
        title="Speech Patterns"
        description="Talk time, silences and responsiveness"
        icon={IconWaveSine}
      >
        {/* Talk-time ratio */}
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="xs">Talk time ratio</Text>
        <Progress.Root size="xl" mb="md">
          <Progress.Section value={sentiment.speech.talkTimeRatio.agent} color="blue">
            <Progress.Label c="blue" size="xs">Agent {sentiment.speech.talkTimeRatio.agent}%</Progress.Label>
          </Progress.Section>
          <Progress.Section value={sentiment.speech.talkTimeRatio.customer} color="gray">
            <Progress.Label c="gray" size="xs">Customer {sentiment.speech.talkTimeRatio.customer}%</Progress.Label>
          </Progress.Section>
        </Progress.Root>

        {/* Stats */}
        <SimpleGrid cols={{ base: 2, md: 3 }} spacing="sm">
          <Paper withBorder p="sm" radius="sm">
            <Text size="xs" c="dimmed" mb={4}>Silences</Text>
            <Text fw={700} size="lg">{sentiment.speech.silenceCount}</Text>
            <Text size="xs" c="dimmed" mt={4}>
              {sentiment.speech.totalSilenceSeconds}s total · longest {sentiment.speech.longestSilenceSeconds}s
            </Text>
          </Paper>

          <Paper withBorder p="sm" radius="sm">
            <Text size="xs" c="dimmed" mb={4}>Avg response latency</Text>
            <Text fw={700} size="lg">{sentiment.speech.avgResponseLatencySeconds.toFixed(1)}s</Text>
          </Paper>

          <Paper withBorder p="sm" radius="sm">
            <Text size="xs" c="dimmed" mb={4}>Interruptions</Text>
            <Text fw={700} size="lg">{sentiment.speech.interruptions.byAgent + sentiment.speech.interruptions.byCustomer}</Text>
            <Text size="xs" c="dimmed" mt={4}>
              agent {sentiment.speech.interruptions.byAgent} · customer {sentiment.speech.interruptions.byCustomer}
            </Text>
          </Paper>

          <Paper withBorder p="sm" radius="sm">
            <Text size="xs" c="dimmed" mb={4}>Agent pace</Text>
            <Text fw={700} size="lg">{sentiment.speech.agentWordsPerMinute} wpm</Text>
          </Paper>
        </SimpleGrid>
      </SectionCard>
    </Stack>
  );
}
