import {
  Badge, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon,
} from '@mantine/core';
import { IconCalendarEvent, IconCheck, IconMinus, IconReportAnalytics, IconSparkles, IconTargetArrow } from '@tabler/icons-react';
import { SectionCard } from '~/components/SectionCard';
import { BUSINESS_SIGNALS, BUSINESS_SIGNAL_ORDER, NON_CONVERSION_REASON_LABELS } from '../../constants';
import type { CallBusinessEvaluation } from '../../types';
import { EvidenceQuote } from './EvidenceQuote';

interface BusinessInsightsPanelProps {
  business: CallBusinessEvaluation;
}

export function BusinessInsightsPanel({ business }: BusinessInsightsPanelProps) {
  const detectedCount = business.signals.filter(s => s.detected).length;
  const totalCount = business.signals.length;

  return (
    <Stack gap="md">
      {/* Summary */}
      <SectionCard padding="lg">
        <Group gap="xl" align="center" wrap="nowrap">
          <ThemeIcon
            size={56}
            radius="md"
            variant="light"
            color={business.outcome.converted ? 'green' : 'orange'}
          >
            <IconTargetArrow size={30} />
          </ThemeIcon>
          <Stack gap={2} style={{ flex: 1 }}>
            <Text fw={600}>Call outcome</Text>
            <Group gap="xs" wrap="wrap">
              <Badge
                variant="filled"
                color={business.outcome.converted ? 'green' : 'orange'}
              >
                {business.outcome.converted ? 'Converted' : 'Not converted'}
              </Badge>
              <Badge variant="light" color="blue">
                {detectedCount} of {totalCount} signals detected
              </Badge>
              {business.outcome.followUpRecommended && (
                <Badge variant="light" color="teal" leftSection={<IconCalendarEvent size={12} />}>
                  Follow-up recommended
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed">Offer: {business.outcome.offerPresented}</Text>
          </Stack>
        </Group>
      </SectionCard>

      {/* Signals */}
      <SectionCard
        title="Business Signals"
        description="Predefined signals evaluated on this call"
        icon={IconSparkles}
      >
        <Stack gap="xs">
          {BUSINESS_SIGNAL_ORDER.map(type => {
            const signal = business.signals.find(s => s.type === type)!;
            const meta = BUSINESS_SIGNALS[type];

            return (
              <div key={type}>
                <Paper
                  withBorder
                  p="sm"
                  radius="sm"
                  style={{ opacity: signal.detected ? 1 : 0.7 }}
                  mb={signal.evidence ? 'xs' : 0}
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap={2}>
                      <Group gap="xs">
                        <ThemeIcon
                          size="sm"
                          radius="xl"
                          variant={signal.detected ? 'filled' : 'light'}
                          color={
                            signal.detected
                              ? meta.tone === 'risk'
                                ? 'orange'
                                : 'teal'
                              : 'gray'
                          }
                        >
                          {signal.detected ? <IconCheck size={12} /> : <IconMinus size={12} />}
                        </ThemeIcon>
                        <Text size="sm" fw={600}>{meta.label}</Text>
                        <Badge size="xs" variant="outline" color={meta.tone === 'risk' ? 'orange' : 'teal'}>
                          {meta.tone === 'risk' ? 'Risk' : 'Opportunity'}
                        </Badge>
                      </Group>
                      <Group gap="xs">
                        <Text size="xs" c={signal.detected ? 'default' : 'dimmed'}>
                          {meta.description}
                        </Text>
                      </Group>
                      {signal.note && (
                        <Text size="xs" c="dimmed">{signal.note}</Text>
                      )}
                    </Stack>
                    <Badge variant="light" color={signal.detected ? 'blue' : 'gray'}>
                      {signal.detected ? 'Detected' : 'Not detected'}
                    </Badge>
                  </Group>
                </Paper>
                {signal.evidence && <EvidenceQuote evidence={signal.evidence} />}
              </div>
            );
          })}
        </Stack>
      </SectionCard>

      {/* Outcome Details */}
      <SectionCard title="Outcome Details" icon={IconReportAnalytics}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Paper withBorder p="sm" radius="sm">
            <Text size="xs" c="dimmed" mb={4}>Offer presented</Text>
            <Text size="sm" fw={600}>{business.outcome.offerPresented}</Text>
          </Paper>

          <Paper withBorder p="sm" radius="sm">
            <Text size="xs" c="dimmed" mb={4}>Non-conversion reason</Text>
            <Text size="sm" fw={600}>
              {business.outcome.nonConversionReason
                ? NON_CONVERSION_REASON_LABELS[business.outcome.nonConversionReason]
                : '—'}
            </Text>
          </Paper>

          <Paper withBorder p="sm" radius="sm">
            <Text size="xs" c="dimmed" mb={4}>Competitor mentioned</Text>
            <Text size="sm" fw={600}>{business.outcome.competitorMentioned ?? 'None'}</Text>
          </Paper>

          <Paper withBorder p="sm" radius="sm">
            <Text size="xs" c="dimmed" mb={4}>Best time frame</Text>
            <Text size="sm" fw={600}>{business.outcome.bestTimeFrame ?? 'Not identified'}</Text>
          </Paper>
        </SimpleGrid>
      </SectionCard>
    </Stack>
  );
}
