import { Badge, Group, Paper, Progress, RingProgress, Stack, Text } from '@mantine/core';
import { IconAlertOctagon, IconAlertTriangle, IconCircleCheck, IconShieldCheck } from '@tabler/icons-react';
import { SectionCard } from '~/components/SectionCard';
import { COMPLIANCE_AREAS, COMPLIANCE_AREA_ORDER } from '../../constants';
import type { CallComplianceEvaluation, ComplianceItemStatus } from '../../types';
import { getScoreColor } from './scoreColor';
import { EvidenceQuote } from './EvidenceQuote';

interface CompliancePanelProps {
  compliance: CallComplianceEvaluation;
}

const statusMeta: Record<ComplianceItemStatus, { color: string; label: string; icon: JSX.Element }> = {
  compliant: {
    color: 'green',
    label: 'Compliant',
    icon: <IconCircleCheck size={16} style={{ color: 'var(--mantine-color-green-6)' }} />,
  },
  warning: {
    color: 'yellow',
    label: 'Warning',
    icon: <IconAlertTriangle size={16} style={{ color: 'var(--mantine-color-yellow-6)' }} />,
  },
  violation: {
    color: 'red',
    label: 'Violation',
    icon: <IconAlertOctagon size={16} style={{ color: 'var(--mantine-color-red-6)' }} />,
  },
};

export function CompliancePanel({ compliance }: CompliancePanelProps) {
  return (
    <Stack gap="md">
      {/* Header with ring */}
      <SectionCard padding="lg">
        <Group align="center" gap="xl" wrap="nowrap">
          <div>
            <RingProgress
              sections={[{ value: compliance.overallScore, color: getScoreColor(compliance.overallScore) }]}
              label={
                <Text fw={700} size="xl" ta="center">{compliance.overallScore}%</Text>
              }
              size={124}
              thickness={12}
              roundCaps
            />
          </div>
          <Stack gap={4} style={{ flex: 1 }}>
            <Text fw={600}>Compliance Score</Text>
            <Group gap="xs" wrap="wrap">
              <Badge variant="filled" color={statusMeta[compliance.status].color}>
                {statusMeta[compliance.status].label}
              </Badge>
              <Badge variant="light" color={compliance.violationCount ? 'red' : 'gray'}>
                {compliance.violationCount} violations
              </Badge>
              <Badge variant="light" color={compliance.warningCount ? 'yellow' : 'gray'}>
                {compliance.warningCount} warnings
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">Average of Security, Regulatory and Legal area scores</Text>
          </Stack>
        </Group>
      </SectionCard>

      {/* Areas */}
      <Stack gap="md">
        {COMPLIANCE_AREA_ORDER.map(key => {
          const areaMeta = COMPLIANCE_AREAS[key];
          const area = compliance.areas.find(a => a.key === key)!;

          return (
            <SectionCard
              key={key}
              title={areaMeta.label}
              description={areaMeta.description}
              icon={IconShieldCheck}
              headerActions={
                <Badge color={getScoreColor(area.score)} variant="light" size="lg">
                  {area.score}%
                </Badge>
              }
            >
              <Progress value={area.score} color={areaMeta.color} size="sm" mb="sm" />
              <Stack gap="xs">
                {area.items.map(item => {
                  const itemStatus = statusMeta[item.status];
                  return (
                    <div key={item.key}>
                      <Paper withBorder p="sm" radius="sm" mb={item.evidence ? 'xs' : 0}>
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Stack gap={2}>
                            <Group gap="xs">
                              {itemStatus.icon}
                              <Text size="sm" fw={500}>{item.label}</Text>
                            </Group>
                            {item.note && <Text size="xs" c="dimmed">{item.note}</Text>}
                          </Stack>
                          <Group gap="xs">
                            <Badge variant="light" color={itemStatus.color}>
                              {itemStatus.label}
                            </Badge>
                            <Text size="sm" fw={600}>{item.score}%</Text>
                          </Group>
                        </Group>
                      </Paper>
                      {item.evidence && <EvidenceQuote evidence={item.evidence} />}
                    </div>
                  );
                })}
              </Stack>
            </SectionCard>
          );
        })}
      </Stack>
    </Stack>
  );
}
