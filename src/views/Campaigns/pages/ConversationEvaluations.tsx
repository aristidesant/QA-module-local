import { Container, Title, Stack, Group, Button, Badge, Text, Card, Breadcrumbs, Anchor, ActionIcon, Grid, Radio, ScrollArea } from '@mantine/core';
import { IconArrowLeft, IconMoodSmile, IconShieldCheck, IconTrendingUp, IconPlayerPlay, IconPlayerPause, IconVolume2 } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';
import type { EvaluationType } from '../types';
import { mockConversationEvaluations, mockCampaignNames } from '../constants';

const getEvaluationTypeInfo = (type: EvaluationType) => {
  const typeMap: Record<EvaluationType, { icon: typeof IconMoodSmile; color: string; label: string; description: string }> = {
    'sentiment-analysis': {
      icon: IconMoodSmile,
      color: 'violet',
      label: 'Sentiment Analysis',
      description: 'Customer sentiment and emotion analysis'
    },
    'business-insights': {
      icon: IconTrendingUp,
      color: 'blue',
      label: 'Business Insights',
      description: 'Business opportunity and revenue insights'
    },
    'compliance': {
      icon: IconShieldCheck,
      color: 'green',
      label: 'Compliance',
      description: 'Regulatory compliance evaluation'
    },
  };
  return typeMap[type];
};

export default function ConversationEvaluations() {
  const navigate = useNavigate();
  const { campaignId, callId } = useParams();
  const [selectedEvalType, setSelectedEvalType] = useState<EvaluationType>('sentiment-analysis');
  const [isPlaying, setIsPlaying] = useState(false);

  const campaignName = mockCampaignNames[campaignId || ''] || 'Campaign';
  const selectedEvaluation = mockConversationEvaluations.find(e => e.type === selectedEvalType);

  const renderEvaluationContent = () => {
    switch (selectedEvalType) {
      case 'sentiment-analysis':
        return (
          <Stack gap="md">
            <div style={{ padding: '16px', backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
              <Text size="sm" c="dimmed" mb="xs">Overall Sentiment Score</Text>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <Text size="xl" fw={700}>{selectedEvaluation?.score}%</Text>
                <Badge color="green" variant="light">Positive</Badge>
              </div>
            </div>
            <div>
              <Text fw={600} size="sm" mb="xs">Key Insights</Text>
              <Stack gap="xs">
                <Text size="sm">Customer expressed satisfaction with solution</Text>
                <Text size="sm">Minor concerns about response time</Text>
                <Text size="sm">Overall tone was professional and courteous</Text>
              </Stack>
            </div>
          </Stack>
        );

      case 'compliance':
        return (
          <Stack gap="md">
            <div style={{ padding: '16px', backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
              <Text size="sm" c="dimmed" mb="xs">Compliance Score</Text>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <Text size="xl" fw={700}>{selectedEvaluation?.score}%</Text>
                <Badge color="green" variant="light">Compliant</Badge>
              </div>
            </div>
            <div>
              <Text fw={600} size="sm" mb="xs">Compliance Items</Text>
              <Stack gap="xs">
                <Group gap="xs" justify="space-between" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '6px' }}>
                  <Text size="sm">Required disclosure provided</Text>
                  <Badge color="green">✓</Badge>
                </Group>
                <Group gap="xs" justify="space-between" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '6px' }}>
                  <Text size="sm">Proper identification verified</Text>
                  <Badge color="green">✓</Badge>
                </Group>
                <Group gap="xs" justify="space-between" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '6px' }}>
                  <Text size="sm">No prohibited content detected</Text>
                  <Badge color="green">✓</Badge>
                </Group>
              </Stack>
            </div>
          </Stack>
        );

      case 'business-insights':
        return (
          <Stack gap="md">
            <div style={{ padding: '16px', backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
              <Text size="sm" c="dimmed" mb="xs">Business Insights Score</Text>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <Text size="xl" fw={700}>{selectedEvaluation?.score || 'N/A'}</Text>
                {selectedEvaluation?.status === 'not-evaluated' ? (
                  <Badge color="gray" variant="light">Not Yet Evaluated</Badge>
                ) : (
                  <Badge color="blue" variant="light">Evaluated</Badge>
                )}
              </div>
            </div>
            <div>
              <Text fw={600} size="sm" mb="xs">Opportunity Assessment</Text>
              <Stack gap="xs">
                <Text size="sm">Potential upsell opportunity identified</Text>
                <Text size="sm">Cross-sell recommendation: Premium package</Text>
                <Text size="sm">Expected value: $500-$1000</Text>
              </Stack>
            </div>
          </Stack>
        );

      default:
        return null;
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
            <Anchor onClick={() => navigate('/qa/campaigns')} style={{ cursor: 'pointer', color: 'var(--nt-blue-500)' }}>
              Campaigns
            </Anchor>
            <Anchor onClick={() => navigate(`/qa/campaigns/${campaignId}`)} style={{ cursor: 'pointer', color: 'var(--nt-blue-500)' }}>
              {campaignName}
            </Anchor>
            <Text size="sm" c="gray.6" fw={500}>Call {callId}</Text>
          </Breadcrumbs>
        </Group>

        {/* Header */}
        <div>
          <Title order={2} style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Call Evaluation
          </Title>
          <Text size="sm" c="dimmed">Review detailed evaluation results for this call</Text>
        </div>

        {/* Main 2-Column Layout */}
        <Grid gap="lg" style={{ minHeight: '600px' }}>
          {/* Left Column: Player + Transcript */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              {/* Audio Player */}
              <Card padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Text fw={600} size="sm">Call Recording</Text>
                    <Badge size="sm" variant="light">2:45 min</Badge>
                  </Group>

                  {/* Mock Player */}
                  <div style={{
                    padding: '16px',
                    backgroundColor: 'var(--mantine-color-gray-0)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      leftSection={isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--mantine-color-gray-3)', borderRadius: '2px' }}>
                      <div style={{ width: '35%', height: '100%', backgroundColor: 'var(--nt-blue-500)', borderRadius: '2px' }} />
                    </div>
                    <Text size="xs" c="dimmed">0:57 / 2:45</Text>
                  </div>

                  <Group gap="xs">
                    <IconVolume2 size={18} style={{ color: 'var(--mantine-color-gray-5)' }} />
                    <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--mantine-color-gray-3)', borderRadius: '2px' }}>
                      <div style={{ width: '70%', height: '100%', backgroundColor: 'var(--nt-blue-500)', borderRadius: '2px' }} />
                    </div>
                  </Group>
                </Stack>
              </Card>

              {/* Transcript */}
              <Card padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Text fw={600} size="sm">Conversation Transcript</Text>
                  <ScrollArea style={{ height: '300px' }}>
                    <Stack gap="md" pr="md">
                      <div style={{ padding: '8px 12px', backgroundColor: 'var(--mantine-color-blue-0)', borderRadius: '6px' }}>
                        <Text size="xs" c="dimmed" mb="4px">Agent - 0:12</Text>
                        <Text size="sm">Hello, thank you for calling customer support. How can I assist you today?</Text>
                      </div>
                      <div style={{ padding: '8px 12px', backgroundColor: 'var(--mantine-color-gray-1)', borderRadius: '6px' }}>
                        <Text size="xs" c="dimmed" mb="4px">Customer - 0:28</Text>
                        <Text size="sm">Hi, I'm having trouble with my account access. I can't log in this morning.</Text>
                      </div>
                      <div style={{ padding: '8px 12px', backgroundColor: 'var(--mantine-color-blue-0)', borderRadius: '6px' }}>
                        <Text size="xs" c="dimmed" mb="4px">Agent - 0:45</Text>
                        <Text size="sm">I'd be happy to help you regain access. Let me pull up your account details. Can you provide me with your email address please?</Text>
                      </div>
                      <div style={{ padding: '8px 12px', backgroundColor: 'var(--mantine-color-gray-1)', borderRadius: '6px' }}>
                        <Text size="xs" c="dimmed" mb="4px">Customer - 1:10</Text>
                        <Text size="sm">Sure, it's john.doe@email.com</Text>
                      </div>
                    </Stack>
                  </ScrollArea>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          {/* Right Column: Evaluation Panel */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              {/* Evaluation Type Selector */}
              <Card padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Text fw={600} size="sm">Select Evaluation Type</Text>
                  <Radio.Group
                    value={selectedEvalType}
                    onChange={(value) => setSelectedEvalType(value as EvaluationType)}
                  >
                    <Stack gap="xs">
                      {mockConversationEvaluations.map((evaluation) => {
                        const info = getEvaluationTypeInfo(evaluation.type);
                        const Icon = info.icon;
                        return (
                          <Group
                            key={evaluation.type}
                            p="xs"
                            style={{
                              backgroundColor: selectedEvalType === evaluation.type ? 'var(--mantine-color-blue-0)' : 'transparent',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              border: selectedEvalType === evaluation.type ? '2px solid var(--nt-blue-500)' : '2px solid transparent',
                            }}
                          >
                            <Radio value={evaluation.type} style={{ cursor: 'pointer' }} />
                            <Group gap="sm" style={{ flex: 1 }}>
                              <div
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '6px',
                                  backgroundColor: `rgba(27, 75, 184, 0.08)`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Icon size={20} color={`var(--mantine-color-${info.color}-6)`} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <Text fw={500} size="sm">{info.label}</Text>
                                <Text size="xs" c="dimmed">{info.description}</Text>
                              </div>
                              {evaluation.score !== null && (
                                <Badge color={info.color} variant="light">{evaluation.score}%</Badge>
                              )}
                            </Group>
                          </Group>
                        );
                      })}
                    </Stack>
                  </Radio.Group>
                </Stack>
              </Card>

              {/* Evaluation Details */}
              <Card padding="lg" radius="md" withBorder>
                <ScrollArea style={{ height: '420px' }}>
                  {renderEvaluationContent()}
                </ScrollArea>
              </Card>

              {/* Action Buttons */}
              <Group grow>
                <Button variant="light" onClick={() => navigate(-1)}>
                  Back to Calls
                </Button>
                <Button color="brand">
                  Review All Evaluations
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
