import { useState, useMemo } from 'react';
import { Container, Title, Table, Badge, Button, Group, Stack, ActionIcon, Modal, Text, Tooltip, Card, TextInput, Select, Pagination, Breadcrumbs, Anchor, Switch, useMantineTheme } from '@mantine/core';
import { IconPlus, IconFileText, IconSearch, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { notifySuccess, notifyError } from '~/modules/qa/utils/notifications';
import type { Campaign } from '../types';
import { mockCampaigns } from '../constants';

export default function CampaignsList() {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [completeConfirm, setCompleteConfirm] = useState<string | null>(null);
  const [evaluationSettingsId, setEvaluationSettingsId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState({
    sentimentAnalysis: true,
    businessInsights: true,
    compliance: false,
    liveListen: false,
    liveCoaching: false,
  });
  const itemsPerPage = 10;

  // Filter and search logic
  const filteredCampaigns = useMemo(() => {
    let result = campaigns;

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((campaign) => campaign.status === statusFilter);
    }

    return result;
  }, [campaigns, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      pending: 'gray',
      active: 'green',
      paused: 'orange',
    };
    return colors[status];
  };

  const getStatusLabel = (status: Campaign['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getTypeColor = () => {
    return 'blue';
  };

  const getTypeLabel = (type: Campaign['type']) => {
    return type === 'external' ? 'External' : 'CMX';
  };

  const handleMarkAsCompleted = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      setCampaigns(campaigns.map(c =>
        c.id === id ? { ...c, status: 'paused' as const } : c
      ));
      notifySuccess(`"${campaign.name}" paused`);
    }
    setCompleteConfirm(null);
  };

  const handleBulkAction = (targetStatus: Campaign['status'], action: 'pause' | 'resume') => {
    const affectedCount = campaigns.filter(c => c.status === targetStatus).length;
    if (affectedCount === 0) {
      notifyError(new Error(`No ${targetStatus} campaigns to ${action}`));
      return;
    }

    const newStatus: Campaign['status'] = action === 'pause' ? 'paused' : 'active';
    setCampaigns(campaigns.map(c =>
      c.status === targetStatus ? { ...c, status: newStatus } : c
    ));
    notifySuccess(`${action === 'pause' ? 'Paused' : 'Resumed'} ${affectedCount} ${targetStatus} campaign${affectedCount > 1 ? 's' : ''}`);
  };

  const rows = paginatedCampaigns.map((campaign) => (
    <Table.Tr
      key={campaign.id}
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/qa/campaigns/${campaign.id}/contact-lists/list1`)}
    >
      <Table.Td>
        <div>
          <Text fw={600} size="sm" c="var(--nt-blue-500)">{campaign.name}</Text>
          <Text size="xs" c="dimmed">{campaign.description}</Text>
        </div>
      </Table.Td>
      <Table.Td align="center">
        <Group justify="center" gap={0}>
          <Badge color={getTypeColor()} variant="light">
            {getTypeLabel(campaign.type)}
          </Badge>
        </Group>
      </Table.Td>
      <Table.Td align="center">
        <Group justify="center" gap={0}>
          <Badge color={getStatusColor(campaign.status)} variant="light">
            {getStatusLabel(campaign.status)}
          </Badge>
        </Group>
      </Table.Td>
      <Table.Td align="center">{campaign.evaluationsCompleted}</Table.Td>
      <Table.Td align="right" style={{ verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
        <Group gap="xs" justify="flex-end" align="center" wrap="nowrap">
          <Tooltip label="View Details">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => navigate(`/qa/campaigns/${campaign.id}/contact-lists/list1`)}
              title="View Details"
            >
              <IconFileText size={18} />
            </ActionIcon>
          </Tooltip>

          {/* Pause - Active campaigns */}
          {campaign.status === 'active' && (
            <Tooltip label="Pause Campaign">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  setCompleteConfirm(campaign.id);
                }}
                title="Pause Campaign"
              >
                <IconPlayerPause size={18} />
              </ActionIcon>
            </Tooltip>
          )}

          {/* Play - Pending and Paused campaigns */}
          {(campaign.status === 'pending' || campaign.status === 'paused') && (
            <Tooltip label="Resume Campaign">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  setCampaigns(campaigns.map(c =>
                    c.id === campaign.id ? { ...c, status: 'active' as const } : c
                  ));
                  notifySuccess(`"${campaign.name}" resumed`);
                }}
                title="Resume Campaign"
              >
                <IconPlayerPlay size={18} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" px="lg" style={{ paddingTop: '48px', paddingBottom: '32px' }}>
      <Stack gap="lg">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs>
          <Anchor onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', color: 'var(--nt-blue-500)' }}>
            Dashboard
          </Anchor>
          <Text size="xs" c="gray.6" fw={400}>Campaign</Text>
        </Breadcrumbs>

        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Campaign</Title>
            <Text size="sm" c="dimmed">Manage and evaluate call campaigns</Text>
          </div>
          <Group gap="sm">
            <Button
              leftSection={<IconPlus size={18} />}
              color="brand"
              onClick={() => navigate('/qa/campaigns/new')}
            >
              New external campaign
            </Button>
          </Group>
        </Group>

        {/* KPI Metrics */}
        <Group grow>
          <Card shadow="sm" padding="md" radius="lg" withBorder>
            <Stack gap={0}>
              <Text size="xs" fw={600} c="dimmed" mb="xs">Campaigns Active</Text>
              <Title order={3}>{campaigns.filter((c) => c.status === 'active').length}</Title>
            </Stack>
          </Card>
          <Card shadow="sm" padding="md" radius="lg" withBorder>
            <Stack gap={0}>
              <Text size="xs" fw={600} c="dimmed" mb="xs">Campaigns Pending</Text>
              <Title order={3}>{campaigns.filter((c) => c.status === 'pending').length}</Title>
            </Stack>
          </Card>
          <Card shadow="sm" padding="md" radius="lg" withBorder>
            <Stack gap={0}>
              <Text size="xs" fw={600} c="dimmed" mb="xs">Campaigns Paused</Text>
              <Title order={3}>{campaigns.filter((c) => c.status === 'paused').length}</Title>
            </Stack>
          </Card>
        </Group>

        {/* Reviews Table Card */}
        <Card shadow="sm" padding="lg" radius="lg" withBorder>
          <Stack gap="md">
            {/* Bulk Actions */}
            <Group>
              <Button
                variant="light"
                color="gray"
                size="sm"
                leftSection={<IconPlayerPause size={16} />}
                onClick={() => handleBulkAction('active', 'pause')}
              >
                Pause All Active
              </Button>
              <Button
                variant="light"
                color="gray"
                size="sm"
                leftSection={<IconPlayerPlay size={16} />}
                onClick={() => handleBulkAction('pending', 'resume')}
              >
                Resume All Pending
              </Button>
              <Button
                variant="light"
                color="gray"
                size="sm"
                leftSection={<IconPlayerPlay size={16} />}
                onClick={() => handleBulkAction('paused', 'resume')}
              >
                Resume All Paused
              </Button>
            </Group>

            {/* Search and Filters */}
            <Group grow align="flex-end">
              <TextInput
                placeholder="Search by name or description..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.currentTarget.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
              />
              <Select
                placeholder="Filter by status..."
                data={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'active', label: 'Active' },
                  { value: 'paused', label: 'Paused' },
                ]}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1); // Reset to page 1 on filter
                }}
                clearable
                searchable
              />
            </Group>

            {/* Results Info */}
            <Text size="sm" c="dimmed">
              Showing {Math.min(startIndex + 1, filteredCampaigns.length)}-
              {Math.min(startIndex + itemsPerPage, filteredCampaigns.length)} of{' '}
              {filteredCampaigns.length} campaigns
            </Text>

            {/* Table */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <Table striped highlightOnHover style={{ width: '100%', minWidth: '100%' }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Campaign Name</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Source</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>QA Tests</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredCampaigns.length > 0 && (
              <Group justify="center">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                  size="sm"
                  disabled={totalPages <= 1}
                />
              </Group>
            )}

            {/* Empty State */}
            {filteredCampaigns.length === 0 && (
              <Stack align="center" py="xl">
                <Text c="dimmed">No campaigns found matching your criteria</Text>
              </Stack>
            )}
          </Stack>
        </Card>
      </Stack>

      {/* Pause Confirmation Modal */}
      <Modal
        opened={!!completeConfirm}
        onClose={() => setCompleteConfirm(null)}
        title="Pause Campaign"
        centered
      >
        <Stack gap="lg">
          <Text>Are you sure you want to pause this campaign?</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCompleteConfirm(null)}>
              Cancel
            </Button>
            <Button color="orange" onClick={() => completeConfirm && handleMarkAsCompleted(completeConfirm)}>
              Pause Campaign
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Evaluation Settings Modal */}
      <Modal
        opened={!!evaluationSettingsId}
        onClose={() => setEvaluationSettingsId(null)}
        title="Evaluation Settings"
        centered
        size="md"
      >
        <Stack gap="lg">
          <div style={{ padding: '16px', backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px', border: '1px solid var(--mantine-color-gray-2)' }}>
            <Group justify="space-between" align="center">
              <div style={{ flex: 1 }}>
                <Text fw={600} mb="xs">Auto-assign QA Tests</Text>
                <Text size="sm" c="dimmed">Automatically apply QA tests based on campaign type</Text>
              </div>
              <input type="checkbox" id="autoAssign" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            </Group>
          </div>

          <div>
            <Text fw={600} mb="md">Services</Text>
            <Stack gap="md">
              <Group justify="space-between" align="center" p="xs" style={{ borderRadius: '6px', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>Sentiment Analysis</Text>
                </div>
                <Switch
                  checked={services.sentimentAnalysis}
                  onChange={(e) => setServices({ ...services, sentimentAnalysis: e.currentTarget.checked })}
                  color="brand"
                />
              </Group>

              <Group justify="space-between" align="center" p="xs" style={{ borderRadius: '6px', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>Business Insights</Text>
                </div>
                <Switch
                  checked={services.businessInsights}
                  onChange={(e) => setServices({ ...services, businessInsights: e.currentTarget.checked })}
                  color="brand"
                />
              </Group>

              <Group justify="space-between" align="center" p="xs" style={{ borderRadius: '6px', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>Compliance</Text>
                </div>
                <Switch
                  checked={services.compliance}
                  onChange={(e) => setServices({ ...services, compliance: e.currentTarget.checked })}
                  color="brand"
                />
              </Group>

              <Group justify="space-between" align="center" p="xs" style={{ borderRadius: '6px', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>Live Listen</Text>
                </div>
                <Switch
                  checked={services.liveListen}
                  onChange={(e) => setServices({ ...services, liveListen: e.currentTarget.checked })}
                  color="brand"
                />
              </Group>

              <Group justify="space-between" align="center" p="xs" style={{ borderRadius: '6px', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>Live Coaching</Text>
                </div>
                <Switch
                  checked={services.liveCoaching}
                  onChange={(e) => setServices({ ...services, liveCoaching: e.currentTarget.checked })}
                  color="brand"
                />
              </Group>
            </Stack>
          </div>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setEvaluationSettingsId(null)}>
              Cancel
            </Button>
            <Button color="brand" onClick={() => {
              notifySuccess('Evaluation settings saved');
              setEvaluationSettingsId(null);
            }}>
              Save Settings
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
