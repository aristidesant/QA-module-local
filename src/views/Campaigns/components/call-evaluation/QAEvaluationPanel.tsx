import { Accordion, Badge, Card, Group, Paper, Progress, RingProgress, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconAlertOctagon, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { SectionCard } from '~/components/SectionCard';
import { QA_ERROR_TYPES, QA_ERROR_TYPE_ORDER } from '../../constants';
import type { CallQAEvaluation } from '../../types';
import { getScoreColor } from './scoreColor';
import { EvidenceQuote } from './EvidenceQuote';

interface QAEvaluationPanelProps {
  qa: CallQAEvaluation;
}

export function QAEvaluationPanel({ qa }: QAEvaluationPanelProps) {
  const defaultExpandedAspects = qa.aspects
    .filter(a => a.score < a.maxScore)
    .map(a => a.id);

  const statusIconMap = {
    good: <IconCircleCheck size={16} style={{ color: 'var(--mantine-color-green-6)' }} />,
    warning: <IconAlertTriangle size={16} style={{ color: 'var(--mantine-color-yellow-6)' }} />,
    critical: <IconAlertOctagon size={16} style={{ color: 'var(--mantine-color-red-6)' }} />,
  };

  return (
    <Stack gap="md">
      {/* Header with ring score */}
      <SectionCard padding="lg">
        <Group align="center" gap="xl" wrap="nowrap">
          <div>
            <RingProgress
              sections={[{ value: qa.overallScore, color: getScoreColor(qa.overallScore) }]}
              label={
                <Text fw={700} size="xl" ta="center">{qa.overallScore}%</Text>
              }
              size={124}
              thickness={12}
              roundCaps
            />
          </div>
          <Stack gap={4} style={{ flex: 1 }}>
            <Text fw={600}>QA Score</Text>
            <Group gap="xs" wrap="wrap">
              <Badge color={qa.passed ? 'green' : 'red'} variant="filled">
                {qa.passed ? 'Passed' : 'Failed'}
              </Badge>
              <Badge variant="light" color="gray">
                Threshold {qa.passThreshold}%
              </Badge>
              <Badge variant="light" color={qa.autoFailCount ? 'red' : 'green'}>
                {qa.autoFailCount} auto-fails
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">Form: {qa.qaFormName}</Text>
          </Stack>
        </Group>
      </SectionCard>

      {/* Error types grid */}
      <SectionCard title="Error Types (COPC)" description="Score per error type across all evaluated items">
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
          {QA_ERROR_TYPE_ORDER.map(code => {
            const meta = QA_ERROR_TYPES[code];
            const errorType = qa.errorTypes.find(e => e.code === code)!;
            return (
              <Card key={code} withBorder radius="md" p="md">
                <Group justify="space-between" align="center" mb="sm">
                  <Tooltip label={meta.description}>
                    <Badge color={meta.color} variant="filled">{code}</Badge>
                  </Tooltip>
                  {statusIconMap[errorType.status]}
                </Group>
                <Text fw={700} size="xl">{errorType.score}%</Text>
                <Text size="xs" c="dimmed">{meta.shortLabel}</Text>
                <Progress value={errorType.score} color={meta.color} size="sm" mt="xs" />
                <Text size="xs" c="dimmed" mt={4}>
                  {errorType.errorsFound} error(s) · {errorType.itemsEvaluated} items
                </Text>
              </Card>
            );
          })}
        </SimpleGrid>
      </SectionCard>

      {/* Aspects accordion */}
      <SectionCard title="Aspects" description="Item-level results grouped by aspect">
        <Accordion variant="separated" multiple defaultValue={defaultExpandedAspects}>
          {qa.aspects.map(aspect => {
            const pct = Math.round((aspect.score / aspect.maxScore) * 100);
            return (
              <Accordion.Item key={aspect.id} value={aspect.id}>
                <Accordion.Control>
                  <Group justify="space-between" pr="md" style={{ width: '100%' }}>
                    <Text fw={600}>{aspect.name}</Text>
                    <Group gap="xs">
                      <Text size="sm" c="dimmed">
                        {aspect.score}/{aspect.maxScore} pts
                      </Text>
                      <Badge color={getScoreColor(pct)} variant="light">{pct}%</Badge>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="xs">
                    {aspect.items.map(item => (
                      <div key={item.id}>
                        <Paper withBorder p="sm" radius="sm" mb={item.evidence ? 'xs' : 0}>
                          <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Stack gap={4}>
                              <Text size="sm">{item.name}</Text>
                              <Group gap={6}>
                                <Badge
                                  size="xs"
                                  color={QA_ERROR_TYPES[item.errorType].color}
                                  variant="light"
                                >
                                  {item.errorType}
                                </Badge>
                                <Badge size="xs" variant="outline" color="gray">
                                  {item.valuation} pts
                                </Badge>
                              </Group>
                            </Stack>
                            <div style={{ textAlign: 'right' }}>
                              <Badge
                                variant="filled"
                                color={item.answer === 'yes' ? 'green' : item.answer === 'no' ? 'red' : 'gray'}
                              >
                                {item.answer === 'yes' ? 'Yes' : item.answer === 'no' ? 'No' : 'N/A'}
                              </Badge>
                              <Text size="xs" c="dimmed" ta="right" mt={4}>
                                {item.awarded}/{item.valuation}
                              </Text>
                            </div>
                          </Group>
                        </Paper>
                        {item.evidence && <EvidenceQuote evidence={item.evidence} />}
                      </div>
                    ))}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </SectionCard>
    </Stack>
  );
}
