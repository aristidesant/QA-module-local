import {
  ActionIcon, Anchor, Badge, Breadcrumbs, Button, Card, Container, Grid, Group, Paper, ScrollArea, Stack, Text, ThemeIcon, Title,
} from '@mantine/core';
import {
  IconArrowLeft, IconHeadset, IconPlayerPause, IconPlayerPlay, IconUser, IconVolume2,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';
import type { CallEvaluationTab } from '../types';
import { CALL_EVALUATION_TABS, mockCampaignNames, mockCallEvaluationDetail } from '../constants';
import { QAEvaluationPanel } from '../components/call-evaluation/QAEvaluationPanel';
import { SentimentEmotionPanel } from '../components/call-evaluation/SentimentEmotionPanel';
import { CompliancePanel } from '../components/call-evaluation/CompliancePanel';
import { BusinessInsightsPanel } from '../components/call-evaluation/BusinessInsightsPanel';
import { formatDuration } from '../components/call-evaluation/scoreColor';

export default function ConversationEvaluations() {
  const navigate = useNavigate();
  const { campaignId, callId } = useParams();
  const [selectedTab, setSelectedTab] = useState<CallEvaluationTab>('qa');
  const [isPlaying, setIsPlaying] = useState(false);

  const call = mockCallEvaluationDetail;
  const campaignName = mockCampaignNames[campaignId || ''] || 'Campaign';
  const selectedMeta = CALL_EVALUATION_TABS.find(t => t.key === selectedTab)!;

  // Calculate badge scores per tab
  const getTabBadge = () => {
    switch (selectedTab) {
      case 'qa':
        return `${call.qa.overallScore}%`;
      case 'sentiment-emotion':
        return `${call.sentiment.customer.overallScore.toFixed(1)}/5`;
      case 'compliance':
        return `${call.compliance.overallScore}%`;
      case 'business-insights':
        return `${call.business.signals.filter(s => s.detected).length}/${call.business.signals.length}`;
      default:
        return '';
    }
  };

  return (
    <Container size="xl" px="lg" style={{ paddingTop: '48px', paddingBottom: '32px' }}>
      <Stack gap="lg" style={{ width: '100%' }}>
        {/* Breadcrumbs */}
        <Group align="center" gap="sm">
          <ActionIcon
            variant="subtle"
            onClick={() => navigate(-1)}
            title="Back"
            size="lg"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Breadcrumbs style={{ flex: 1 }}>
            <Anchor onClick={() => navigate('/qa/campaigns')} style={{ cursor: 'pointer', color: 'var(--mantine-color-blue-6)' }}>
              Campaigns
            </Anchor>
            <Anchor onClick={() => navigate(`/qa/campaigns/${campaignId}`)} style={{ cursor: 'pointer', color: 'var(--mantine-color-blue-6)' }}>
              {campaignName}
            </Anchor>
            <Text size="sm" c="dimmed" fw={500}>Call {callId}</Text>
          </Breadcrumbs>
        </Group>

        {/* Header */}
        <div>
          <Title order={2} style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Call Evaluation
          </Title>
          <Text size="sm" c="dimmed">
            {call.fileName} · {call.agentName} ·{' '}
            <Anchor size="sm" onClick={() => navigate(`/qa/supervisor/customers/${call.customerId}`)}>
              {call.customerName}
            </Anchor>{' '}
            · {call.date} · {formatDuration(call.durationSeconds)} · {call.direction === 'outbound' ? 'Outbound' : 'Inbound'}
          </Text>
        </div>

        {/* Tab buttons */}
        <Card padding="lg" radius="md" withBorder>
          <Stack gap="sm">
            <Group gap="sm" wrap="wrap">
              {CALL_EVALUATION_TABS.map(meta => {
                const isSelected = selectedTab === meta.key;
                const Icon = meta.icon;
                const badge = (
                  <Badge
                    variant={isSelected ? 'white' : 'light'}
                    color={isSelected ? undefined : meta.color}
                    size="sm"
                  >
                    {getTabBadge()}
                  </Badge>
                );
                return (
                  <Button
                    key={meta.key}
                    variant={isSelected ? 'filled' : 'light'}
                    color={isSelected ? meta.color : 'gray'}
                    onClick={() => setSelectedTab(meta.key)}
                    leftSection={<Icon size={18} />}
                    rightSection={badge}
                  >
                    {meta.label}
                  </Button>
                );
              })}
            </Group>
            <Text size="xs" c="dimmed">{selectedMeta.description}</Text>
          </Stack>
        </Card>

        {/* 2-Column Layout */}
        <Grid gap="lg" style={{ minHeight: '600px' }}>
          {/* Left column: Player + Transcript (sticky) */}
          <Grid.Col span={{ base: 12, lg: 5 }}>
            <div style={{ position: 'sticky', top: 16 }}>
              <Stack gap="md">
                {/* Audio Player */}
                <Card padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between" align="center">
                      <Text fw={600} size="sm">Call Recording</Text>
                      <Badge size="sm" variant="light">{formatDuration(call.durationSeconds)}</Badge>
                    </Group>

                    {/* Mock Player */}
                    <div style={{
                      padding: '16px',
                      backgroundColor: 'var(--mantine-color-gray-light)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                    >
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                        leftSection={isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
                      >
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                      <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--mantine-color-default-border)', borderRadius: '2px' }}>
                        <div style={{ width: '35%', height: '100%', backgroundColor: 'var(--mantine-color-blue-6)', borderRadius: '2px' }} />
                      </div>
                      <Text size="xs" c="dimmed">0:57 / {formatDuration(call.durationSeconds)}</Text>
                    </div>

                    <Group gap="xs">
                      <IconVolume2 size={18} style={{ color: 'var(--mantine-color-gray-6)' }} />
                      <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--mantine-color-default-border)', borderRadius: '2px' }}>
                        <div style={{ width: '70%', height: '100%', backgroundColor: 'var(--mantine-color-blue-6)', borderRadius: '2px' }} />
                      </div>
                    </Group>
                  </Stack>
                </Card>

                {/* Transcript */}
                <Card padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between" align="center">
                      <Text fw={600} size="sm">Conversation Transcript</Text>
                      <Badge size="sm" variant="light">{call.transcript.length} turns</Badge>
                    </Group>
                    <ScrollArea h={420}>
                      <Stack gap="xs" pr="md">
                        {call.transcript.map(turn => (
                          <Paper
                            key={turn.id}
                            radius="sm"
                            p="xs"
                            bg={turn.speaker === 'agent' ? 'var(--mantine-color-blue-light)' : 'var(--mantine-color-gray-light)'}
                          >
                            <Group gap={6} mb={4}>
                              <ThemeIcon size="xs" variant="transparent">
                                {turn.speaker === 'agent' ? <IconHeadset size={12} /> : <IconUser size={12} />}
                              </ThemeIcon>
                              <Text size="xs" c="dimmed">
                                {turn.speaker === 'agent' ? 'Agent' : 'Customer'} · {turn.timestamp}
                              </Text>
                            </Group>
                            <Text size="sm">{turn.text}</Text>
                          </Paper>
                        ))}
                      </Stack>
                    </ScrollArea>
                  </Stack>
                </Card>
              </Stack>
            </div>
          </Grid.Col>

          {/* Right column: Evaluation panels */}
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Stack gap="md">
              {selectedTab === 'qa' && <QAEvaluationPanel qa={call.qa} />}
              {selectedTab === 'sentiment-emotion' && <SentimentEmotionPanel sentiment={call.sentiment} />}
              {selectedTab === 'compliance' && <CompliancePanel compliance={call.compliance} />}
              {selectedTab === 'business-insights' && <BusinessInsightsPanel business={call.business} />}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
