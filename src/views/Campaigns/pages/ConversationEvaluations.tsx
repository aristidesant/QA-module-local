import { Container, Title, Stack, Group, Button, Badge, Text, Card, Breadcrumbs, Anchor, ActionIcon, Grid, ScrollArea, Tabs } from '@mantine/core';
import { IconArrowLeft, IconMoodSmile, IconShieldCheck, IconTrendingUp, IconPlayerPlay, IconPlayerPause, IconVolume2, IconClipboardList } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';
import type { EvaluationType } from '../types';
import { mockConversationEvaluations, mockCampaignNames } from '../constants';

type EvaluationTabType = 'qa' | 'sentiment-analysis' | 'business-insights' | 'compliance';

const getEvaluationTypeInfo = (type: EvaluationTabType) => {
  const typeMap: Record<EvaluationTabType, { icon: typeof IconMoodSmile; color: string; label: string; description: string }> = {
    'qa': {
      icon: IconClipboardList,
      color: 'orange',
      label: 'QA',
      description: 'Quality Assurance evaluation'
    },
    'sentiment-analysis': {
      icon: IconMoodSmile,
      color: 'violet',
      label: 'Sentiment and Emotion',
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
  const [selectedEvalType, setSelectedEvalType] = useState<EvaluationTabType>('qa');
  const [isPlaying, setIsPlaying] = useState(false);

  const campaignName = mockCampaignNames[campaignId || ''] || 'Campaign';

  const renderEvaluationContent = () => {
    switch (selectedEvalType) {
      case 'qa':
        return (
          <Stack gap="md">
            <div style={{ padding: '16px', backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
              <Text size="sm" c="dimmed" mb="xs">QA Score</Text>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <Text size="xl" fw={700}>87%</Text>
                <Badge color="orange" variant="light">Stable</Badge>
              </div>
            </div>
            <div>
              <Text fw={600} size="sm" mb="xs">Quality Metrics</Text>
              <Stack gap="xs">
                <Group gap="xs" justify="space-between" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '6px' }}>
                  <Text size="sm">Call clarity</Text>
                  <Badge color="green">Good</Badge>
                </Group>
                <Group gap="xs" justify="space-between" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '6px' }}>
                  <Text size="sm">Agent response time</Text>
                  <Badge color="green">Good</Badge>
                </Group>
                <Group gap="xs" justify="space-between" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '6px' }}>
                  <Text size="sm">Call handling</Text>
                  <Badge color="yellow">Needs improvement</Badge>
                </Group>
              </Stack>
            </div>
          </Stack>
        );

      case 'sentiment-analysis':
        return (
          <Stack gap="md">
            <div style={{ padding: '16px', backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
              <Text size="sm" c="dimmed" mb="xs">Sentiment Score</Text>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <Text size="xl" fw={700}>68%</Text>
                <Badge color="violet" variant="light">Positive</Badge>
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
                <Text size="xl" fw={700}>82%</Text>
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
              <Text size="sm" c="dimmed" mb="xs">Business Insights</Text>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <Text size="xl" fw={700}>High</Text>
                <Badge color="blue" variant="light">Identified</Badge>
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

  const evaluationTabs: EvaluationTabType[] = ['qa', 'sentiment-analysis', 'compliance', 'business-insights'];

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

        {/* Evaluation Type Tabs */}
        <Card padding="lg" radius="md" withBorder>
          <Group gap="md" wrap="wrap">
            {evaluationTabs.map((tabType) => {
              const info = getEvaluationTypeInfo(tabType);
              const Icon = info.icon;
              const isSelected = selectedEvalType === tabType;
              return (
                <Button
                  key={tabType}
                  variant={isSelected ? 'filled' : 'light'}
                  color={isSelected ? info.color : 'gray'}
                  onClick={() => setSelectedEvalType(tabType)}
                  leftSection={<Icon size={18} />}
                >
                  {info.label}
                </Button>
              );
            })}
          </Group>
        </Card>

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

          {/* Right Column: Evaluation Details */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card padding="lg" radius="md" withBorder style={{ height: '100%' }}>
              <Stack gap="md" style={{ height: '100%' }}>
                <div>
                  <Text fw={600} size="sm" mb="xs">Evaluation Results</Text>
                  <Text size="xs" c="dimmed">{getEvaluationTypeInfo(selectedEvalType).description}</Text>
                </div>
                <ScrollArea style={{ flex: 1 }}>
                  {renderEvaluationContent()}
                </ScrollArea>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
