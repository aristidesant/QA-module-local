import { Container, Title, Stack, Group, Button, Badge, Text, Card, Breadcrumbs, Anchor, ActionIcon, Grid } from '@mantine/core';
import { IconArrowLeft, IconChevronRight, IconTrendingUp, IconMoodSmile, IconShieldCheck } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import type { EvaluationType, ConversationEvaluation } from '../types';
import { mockConversationEvaluations, mockCampaignNames } from '../constants';

const getEvaluationTypeInfo = (type: EvaluationType) => {
  const typeMap: Record<EvaluationType, { icon: typeof IconTrendingUp; color: string; label: string }> = {
    'sentiment-analysis': { icon: IconMoodSmile, color: 'violet', label: 'Sentiment Analysis' },
    'business-insights': { icon: IconTrendingUp, color: 'blue', label: 'Business Insights' },
    'compliance': { icon: IconShieldCheck, color: 'green', label: 'Compliance' },
  };
  return typeMap[type];
};

export default function ConversationEvaluations() {
  const navigate = useNavigate();
  const { campaignId, contactListId, callId } = useParams();

  const campaignName = mockCampaignNames[campaignId || ''] || 'Campaign';

  const handleEvaluationClick = (evaluationId: string) => {
    navigate(`/campaigns/${campaignId}/evaluations/${evaluationId}/calls/${callId}`);
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
            <Anchor onClick={() => navigate('/campaigns')} style={{ cursor: 'pointer', color: 'var(--nt-blue-500)' }}>
              Campaigns
            </Anchor>
            <Anchor onClick={() => navigate(`/campaigns/${campaignId}/contact-lists/${contactListId}`)} style={{ cursor: 'pointer', color: 'var(--nt-blue-500)' }}>
              {campaignName}
            </Anchor>
            <Text size="sm" c="gray.6" fw={500}>{callId}</Text>
          </Breadcrumbs>
        </Group>

        {/* Header */}
        <div>
          <Title order={2} style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Evaluations
          </Title>
          <Text size="sm" c="dimmed">Select an evaluation type to review this conversation</Text>
        </div>

        {/* Evaluation Type Cards */}
        <Grid gap="lg" columns={12}>
          {mockConversationEvaluations.map((evaluation) => {
            const typeInfo = getEvaluationTypeInfo(evaluation.type);
            const IconComponent = typeInfo.icon;

            return (
              <Grid.Col key={evaluation.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderColor: 'var(--mantine-color-gray-3)',
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--nt-blue-500)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(27, 75, 184, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#dde2e8';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => handleEvaluationClick(evaluation.id)}
                >
                  <Stack gap="md">
                    {/* Icon and Title */}
                    <Group gap="md" align="flex-start">
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: `rgba(27, 75, 184, 0.08)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconComponent size={24} style={{ color: `var(--nt-${typeInfo.color}-500)` }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text fw={600} size="sm" mb="xs">
                          {typeInfo.label}
                        </Text>
                      </div>
                    </Group>

                    {/* Score or Status */}
                    <div>
                      {evaluation.score !== null ? (
                        <>
                          <Text size="xs" c="dimmed" fw={500} mb="xs">SCORE</Text>
                          <Title order={3} style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
                            {evaluation.score}
                          </Title>
                        </>
                      ) : (
                        <>
                          <Text size="xs" c="dimmed" fw={500} mb="xs">STATUS</Text>
                          <Badge size="lg" variant="light" color="gray">
                            Not yet evaluated
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Status Badge */}
                    <Group justify="space-between" align="center">
                      <Badge
                        size="sm"
                        variant="filled"
                        color={
                          evaluation.status === 'completed' ? 'green' :
                          evaluation.status === 'in-progress' ? 'blue' :
                          'gray'
                        }
                      >
                        {evaluation.status === 'completed' ? 'Completed' :
                         evaluation.status === 'in-progress' ? 'In Progress' :
                         'Not Evaluated'}
                      </Badge>
                      <IconChevronRight size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
                    </Group>

                    {/* View Button */}
                    <Button
                      size="sm"
                      variant="subtle"
                      color="gray"
                      fullWidth
                      rightSection={<IconChevronRight size={14} />}
                    >
                      View Results
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      </Stack>
    </Container>
  );
}
