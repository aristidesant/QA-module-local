import { useState, useEffect } from 'react';
import { Container, Title, Stack, Group, Button, Badge, Text, Card, ActionIcon, Breadcrumbs, Anchor, Table, Avatar, Select, Modal, Tabs, Checkbox, Radio } from '@mantine/core';
import { IconArrowLeft, IconLayoutGrid, IconList, IconCheckbox, IconHeartHandshake, IconChartBar, IconShield, IconSettings } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { useEvaluationStore } from '../../stores/useEvaluationStore';

interface AspectCard {
  id: string;
  type: 'qa-test' | 'sentiment' | 'business-insights' | 'compliance';
  name: string;
  description: string;
  score?: number;
  status?: 'pending' | 'finished';
  blocked?: boolean;
}

// Mock data for campaign names and conversation lists
const mockCampaignNames: { [key: string]: string } = {
  '1': 'Q2 Sales Performance',
  '2': 'Customer Support Review',
  '3': 'Agent Training Q2',
};

const mockContactLists: { [key: string]: string } = {
  'list1': 'Q2 Sales Performance',
  'list2': 'Q2 Sales Performance',
  'list3': 'Q2 Sales Performance',
  'list4': 'Q2 Sales Performance',
  'list5': 'Q2 Sales Performance',
};

export default function ConversationAspects() {
  const navigate = useNavigate();
  const { campaignId, contactListId } = useParams();
  const [aspectCards, setAspectCards] = useState<AspectCard[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedQATests, setSelectedQATests] = useState<string[]>(['qa-test-1']);
  const [importFrequency, setImportFrequency] = useState<'daily' | 'weekly' | 'biweekly'>('weekly');
  const [autoImportEnabled, setAutoImportEnabled] = useState(true);
  const { setAvailableEvaluations, clearEvaluations } = useEvaluationStore();

  const campaignName = mockCampaignNames[campaignId || ''] || 'Campaign';
  const conversationName = mockContactLists[contactListId || ''] || 'Conversation';

  // Helper function to get card type label
  const getCardTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'qa-test': 'QA Test',
      'sentiment': 'Sentiment Analysis',
      'business-insights': 'Business Insights',
      'compliance': 'Compliance Test',
    };
    return labels[type] || 'Assessment';
  };

  // Helper function to get avatar color and icon based on card type
  const getAvatarConfig = (type: string) => {
    const configs: { [key: string]: { bgColor: string; icon: JSX.Element } } = {
      'qa-test': {
        bgColor: '#0d7530',
        icon: <IconCheckbox size={20} style={{ color: '#ffffff', opacity: 1 }} />,
      },
      'sentiment': {
        bgColor: '#b91c1c',
        icon: <IconHeartHandshake size={20} style={{ color: '#ffffff', opacity: 1 }} />,
      },
      'business-insights': {
        bgColor: '#00618b',
        icon: <IconChartBar size={20} style={{ color: '#ffffff', opacity: 1 }} />,
      },
      'compliance': {
        bgColor: '#6c2e84',
        icon: <IconShield size={20} style={{ color: '#ffffff', opacity: 1 }} />,
      },
    };
    return configs[type] || configs['qa-test'];
  };

  useEffect(() => {
    // Build aspect cards
    const cards: AspectCard[] = [];

    // Add QA Test card
    cards.push({
      id: 'qa-test-1',
      type: 'qa-test',
      name: 'Sales Call Quality Standards',
      description: 'Comprehensive sales call evaluation framework',
      score: 88,
      status: 'finished',
      blocked: false,
    });

    // Add Sentiment & Emotion card (blocked)
    cards.push({
      id: 'sentiment',
      type: 'sentiment',
      name: 'Emotion & Sentiment Analysis',
      description: 'Analyze emotional tone and sentiment patterns in conversations',
      status: 'pending',
      blocked: true,
    });

    // Add Business Insights card
    cards.push({
      id: 'business-insights',
      type: 'business-insights',
      name: 'Business Insights',
      description: 'Strategic business analytics and performance metrics',
      score: 92,
      status: 'finished',
      blocked: false,
    });

    // Add Compliance Test cards
    const complianceTests: Array<{ id: string; name: string; score?: number; status: 'pending' | 'finished'; blocked: boolean }> = [
      { id: 'compliance-1', name: 'GDPR Compliance', score: 100, status: 'finished', blocked: false },
      { id: 'compliance-2', name: 'Call Recording Consent', status: 'pending', blocked: true },
      { id: 'compliance-3', name: 'Data Protection Standards', score: 85, status: 'finished', blocked: false },
    ];

    complianceTests.forEach((test) => {
      cards.push({
        id: test.id,
        type: 'compliance',
        name: test.name,
        description: 'Regulatory compliance verification',
        score: test.score,
        status: test.status,
        blocked: test.blocked,
      });
    });

    setAspectCards(cards);

    // Populate evaluation store with available (non-blocked) evaluations
    const availableEvals = cards
      .filter((card) => !card.blocked)
      .map((card) => ({
        id: card.id,
        name: card.name,
        type: card.type,
        label: getCardTypeLabel(card.type),
      }));
    setAvailableEvaluations(availableEvals);
  }, [contactListId, setAvailableEvaluations]);

  // Clear evaluations when leaving this page
  useEffect(() => {
    return () => {
      clearEvaluations();
    };
  }, [clearEvaluations]);

  const filteredCards = typeFilter
    ? aspectCards.filter((card) => card.type === typeFilter)
    : aspectCards;

  return (
    <div style={{ paddingLeft: '280px' }}>
        <Container size="xl" px="lg" style={{ width: '100%', maxWidth: '100%', paddingTop: '48px', paddingBottom: '32px' }}>
        <Stack gap="lg" style={{ width: '100%' }}>
          {/* Breadcrumb Navigation with Back Button */}
          <Group align="center" gap="sm">
            <ActionIcon
              variant="subtle"
              onClick={() => navigate(`/qa/campaigns/${campaignId}`)}
              title="Back to campaign"
              size="lg"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Breadcrumbs style={{ flex: 1 }}>
              <Anchor onClick={() => navigate('/qa/campaigns')} style={{ cursor: 'pointer', color: 'var(--nt-blue-500)' }}>
                Campaigns
              </Anchor>
              <Anchor
                onClick={() => navigate(`/qa/campaigns/${campaignId}`)}
                style={{ cursor: 'pointer', color: 'var(--nt-blue-500)' }}
              >
                {campaignName}
              </Anchor>
              <Text size="sm" c="gray.6" fw={500}>{conversationName}</Text>
            </Breadcrumbs>
          </Group>

          {/* Header with View Toggle */}
          <Group justify="space-between" align="flex-end">
            <div>
              <Title order={2} style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                {conversationName}
              </Title>
              <Text size="sm" c="dimmed">Analysis and evaluation aspects</Text>
            </div>
            <Group gap="md" align="flex-end">
              <Select
                placeholder="Filter by type"
                searchable
                clearable
                data={[
                  { value: 'qa-test', label: 'QA Test' },
                  { value: 'sentiment', label: 'Sentiment Analysis' },
                  { value: 'business-insights', label: 'Business Insights' },
                  { value: 'compliance', label: 'Compliance Test' },
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ minWidth: '160px' }}
              />
              <Group gap="sm">
                <ActionIcon
                  variant={viewMode === 'grid' ? 'filled' : 'subtle'}
                  color="blue"
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  size="lg"
                >
                  <IconLayoutGrid size={20} />
                </ActionIcon>
                <ActionIcon
                  variant={viewMode === 'list' ? 'filled' : 'subtle'}
                  color="blue"
                  onClick={() => setViewMode('list')}
                  title="List view"
                  size="lg"
                >
                  <IconList size={20} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => setSettingsModalOpen(true)}
                  title="Settings"
                  size="lg"
                >
                  <IconSettings size={20} />
                </ActionIcon>
              </Group>
            </Group>
          </Group>

          {/* Aspect Cards - Grid or List View */}
          {viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', marginTop: '24px' }}>
              {filteredCards.map((card) => (
                <Card
                  key={card.id}
                  padding="lg"
                  radius="lg"
                  withBorder
                  style={{
                    cursor: card.blocked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    borderColor: card.blocked ? '#d3d3d3' : '#dde2e8',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: card.blocked ? 0.6 : 1,
                    backgroundColor: card.blocked ? '#f8f8f8' : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!card.blocked) {
                      e.currentTarget.style.borderColor = 'var(--nt-blue-500)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(27, 75, 184, 0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!card.blocked) {
                      e.currentTarget.style.borderColor = '#dde2e8';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                  onClick={() => {
                    if (!card.blocked) {
                      navigate(`/qa/campaigns/${campaignId}/evaluations/1`);
                    }
                  }}
                >
                  <Stack gap="md" style={{ flex: 1 }}>
                    <div>
                      <Group justify="space-between" align="flex-start" gap="sm" mb="xs">
                        <Group gap="sm" align="flex-start" style={{ flex: 1 }}>
                          <Avatar
                            size="md"
                            radius="xl"
                            style={{
                              marginTop: '2px',
                              flexShrink: 0,
                              backgroundColor: getAvatarConfig(card.type).bgColor,
                            }}
                          >
                            {getAvatarConfig(card.type).icon}
                          </Avatar>
                          <div style={{ flex: 1 }}>
                            <Text fw={600} size="base" mb={4}>
                              {card.name}
                            </Text>
                            <Text size="xs" c="gray.6">
                              {getCardTypeLabel(card.type)}
                            </Text>
                          </div>
                        </Group>
                        {card.blocked && (
                          <Badge size="sm" color="red" variant="light">
                            Blocked
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed" lh={1.5} pl="calc(40px + 8px)">
                        {card.description}
                      </Text>
                    </div>

                    {card.blocked ? (
                      <div
                        style={{
                          padding: '16px',
                          backgroundColor: '#fef3f2',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '1px solid #fee4e2',
                        }}
                      >
                        <Text size="xs" c="var(--nt-red-500)" mb="4px" fw={500}>
                          Not Available
                        </Text>
                        <Text size="sm" c="dimmed">
                          Client did not select this evaluation
                        </Text>
                      </div>
                    ) : card.score !== undefined ? (
                      <div
                        style={{
                          padding: '16px',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '1px solid #f0f0f0',
                        }}
                      >
                        <Text size="xs" c="dimmed" mb="4px" fw={500}>
                          Score
                        </Text>
                        <Text fw={700} size="xl" c="var(--nt-green-500)">
                          {card.score}
                        </Text>
                      </div>
                    ) : null}

                    <Button
                      size="sm"
                      variant="light"
                      color="brand"
                      fullWidth
                      style={{ marginTop: 'auto' }}
                      disabled={card.blocked}
                    >
                      View Details
                    </Button>
                  </Stack>
                </Card>
              ))}
            </div>
          ) : (
            <Table striped highlightOnHover style={{ marginTop: '24px' }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Score</Table.Th>
                  <Table.Th>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredCards.map((card) => (
                  <Table.Tr
                    key={card.id}
                    style={{
                      opacity: card.blocked ? 0.6 : 1,
                      backgroundColor: card.blocked ? '#f8f8f8' : undefined,
                    }}
                  >
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar
                          size="sm"
                          radius="xl"
                          style={{
                            backgroundColor: getAvatarConfig(card.type).bgColor,
                          }}
                        >
                          {getAvatarConfig(card.type).icon}
                        </Avatar>
                        <div>
                          <Text fw={600} size="sm">
                            {card.name}
                          </Text>
                          <Text size="xs" c="gray.6">
                            {getCardTypeLabel(card.type)}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" style={{ maxWidth: '200px' }}>
                        {card.description}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        {card.blocked && (
                          <Badge size="sm" color="red" variant="light">
                            Blocked
                          </Badge>
                        )}
                        <Badge
                          size="sm"
                          color={
                            card.status === 'finished'
                              ? 'green'
                              : 'gray'
                          }
                          variant="light"
                        >
                          {card.status}
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {card.blocked ? (
                        <Text size="sm" c="var(--nt-red-500)" fw={500}>
                          Not Available
                        </Text>
                      ) : card.score !== undefined ? (
                        <Text fw={600} size="sm" c="var(--nt-green-500)">
                          {card.score}
                        </Text>
                      ) : (
                        <Text size="sm" c="dimmed">
                          —
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant="light"
                        color="brand"
                        disabled={card.blocked}
                        onClick={() => {
                          if (!card.blocked) {
                            navigate(`/qa/campaigns/${campaignId}/evaluations/1`);
                          }
                        }}
                      >
                        View
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Container>

      {/* Settings Modal */}
      <Modal
        opened={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Evaluation Settings"
        size="lg"
      >
        <Tabs defaultValue="label">
          <Tabs.List>
            <Tabs.Tab value="label">Labels</Tabs.Tab>
            <Tabs.Tab value="import">Import</Tabs.Tab>
          </Tabs.List>

          {/* Labels Tab */}
          <Tabs.Panel value="label" pt="md">
            <Stack gap="md">
              <div>
                <Text fw={600} size="sm" mb="md">
                  Select QA Tests to Apply Labels
                </Text>
                <Stack gap="sm">
                  {aspectCards
                    .filter((card) => card.type === 'qa-test')
                    .map((card) => (
                      <Checkbox
                        key={card.id}
                        label={card.name}
                        checked={selectedQATests.includes(card.id)}
                        onChange={(e) => {
                          if (e.currentTarget.checked) {
                            setSelectedQATests([...selectedQATests, card.id]);
                          } else {
                            setSelectedQATests(
                              selectedQATests.filter((id) => id !== card.id)
                            );
                          }
                        }}
                      />
                    ))}
                </Stack>
              </div>
            </Stack>
          </Tabs.Panel>

          {/* Import Tab */}
          <Tabs.Panel value="import" pt="md">
            <Stack gap="lg">
              <div>
                <Checkbox
                  label="Auto-import effective calls from this campaign"
                  checked={autoImportEnabled}
                  onChange={(e) => setAutoImportEnabled(e.currentTarget.checked)}
                  mb="md"
                />
              </div>

              {autoImportEnabled && (
                <div>
                  <Text fw={600} size="sm" mb="md">
                    Import Frequency
                  </Text>
                  <Radio.Group
                    value={importFrequency}
                    onChange={(value) =>
                      setImportFrequency(value as 'daily' | 'weekly' | 'biweekly')
                    }
                  >
                    <Stack gap="sm">
                      <Radio
                        value="daily"
                        label="Daily"
                        description="Import effective calls every day"
                      />
                      <Radio
                        value="weekly"
                        label="Weekly"
                        description="Import effective calls every week"
                      />
                      <Radio
                        value="biweekly"
                        label="Biweekly"
                        description="Import effective calls every two weeks"
                      />
                    </Stack>
                  </Radio.Group>
                </div>
              )}

              <Group justify="flex-end" mt="xl">
                <Button variant="light" onClick={() => setSettingsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  color="blue"
                  onClick={() => {
                    setSettingsModalOpen(false);
                  }}
                >
                  Save Settings
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </div>
  );
}
