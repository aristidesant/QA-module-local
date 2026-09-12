import { useState } from 'react';
import { Container, Title, Stack, Group, Button, Badge, Text, Card, Table, ActionIcon, TextInput, Select, Breadcrumbs, Anchor, Modal, ScrollArea, Textarea, Divider, Checkbox, Progress, Switch, Pagination, Tabs, Radio } from '@mantine/core';
import { IconArrowLeft, IconEdit, IconPlayerPlay } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { useCampaignStore } from '../stores/useCampaignStore';
import type { Campaign, ContactList, Evaluation, CampaignDetail as CampaignDetailType, QATest } from '../types';
import { mockCampaignDetails, mockContactLists, mockQATests } from '../constants';

// TODO: Import QATestEditor from common components when available
// import { QATestEditor } from '../components/QATestEditor';

// Placeholder for QATestEditor - remove when real component available
const QATestEditor = () => <div>QA Test Editor placeholder</div>;

const mockQATestsLocal: QATest[] = [
  {
    id: '1',
    name: 'Sales Call Quality Standards',
    qaType: 'sales',
    createdDate: '2026-06-15',
    evaluatedCampaigns: 5,
    createdBy: 'John Smith',
    description: 'Comprehensive sales call evaluation framework',
    status: 'ready',
    aspects: [
      {
        id: 'a1',
        name: 'Greeting & Opening',
        description: 'Evaluate agent greeting and call opening',
        items: [
          { id: 'i1', name: 'Agent greeted within 3 seconds', errorType: 'critical-business', answerType: 'yes-no', valuation: 15 },
          { id: 'i2', name: 'Agent introduced company and name', errorType: 'critical-client', answerType: 'yes-no', valuation: 10 },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Compliance Assessment',
    qaType: 'sales',
    createdDate: '2026-07-01',
    evaluatedCampaigns: 8,
    createdBy: 'Legal Team',
    description: 'Regulatory and legal compliance evaluation',
    status: 'ready',
    aspects: [],
  },
  {
    id: '3',
    name: 'Sentiment Analysis',
    qaType: 'retention',
    createdDate: '2026-07-05',
    evaluatedCampaigns: 6,
    createdBy: 'Analytics Team',
    description: 'Customer sentiment and emotion detection',
    status: 'ready',
    aspects: [],
  },
  {
    id: '4',
    name: 'Business Insights',
    qaType: 'sales',
    createdDate: '2026-06-28',
    evaluatedCampaigns: 4,
    createdBy: 'Business Analysis',
    description: 'Business opportunity and revenue impact analysis',
    status: 'ready',
    aspects: [],
  },
];

const mockAgents = ['Sarah Johnson', 'Marcus Lee', 'Diana Torres', 'Kevin Park', 'Aisha Brown'];
const mockQAForms = ['Sales Call Quality Standards', 'Customer Service Excellence', 'Compliance Check'];

interface Call {
  id: string;
  filename: string;
  agentName: string;
  date: string;
  score: number;
  status: 'completed' | 'pending';
  isAutoFailed: boolean;
  isDisputed: boolean;
  qaForm: string;
  qaFormPassed: boolean;
  disputeRequested: boolean;
}

const mockCalls: Call[] = [
  { id: '1', filename: 'call_001_2026-07-20.mp3', agentName: 'Sarah Johnson', date: '2026-07-20', score: 85, status: 'completed', isAutoFailed: false, isDisputed: false, qaForm: 'Sales Call Quality Standards', qaFormPassed: true, disputeRequested: false },
  { id: '2', filename: 'call_002_2026-07-20.mp3', agentName: 'Marcus Lee', date: '2026-07-20', score: 92, status: 'completed', isAutoFailed: false, isDisputed: false, qaForm: 'Sales Call Quality Standards', qaFormPassed: true, disputeRequested: false },
  { id: '3', filename: 'call_003_2026-07-20.mp3', agentName: 'Diana Torres', date: '2026-07-20', score: 68, status: 'completed', isAutoFailed: true, isDisputed: false, qaForm: 'Customer Service Excellence', qaFormPassed: false, disputeRequested: false },
  { id: '4', filename: 'call_004_2026-07-19.mp3', agentName: 'Kevin Park', date: '2026-07-19', score: 78, status: 'completed', isAutoFailed: false, isDisputed: true, qaForm: 'Sales Call Quality Standards', qaFormPassed: true, disputeRequested: true },
  { id: '5', filename: 'call_005_2026-07-19.mp3', agentName: 'Aisha Brown', date: '2026-07-19', score: 88, status: 'completed', isAutoFailed: false, isDisputed: false, qaForm: 'Compliance Check', qaFormPassed: true, disputeRequested: false },
  { id: '6', filename: 'call_006_2026-07-19.mp3', agentName: 'Sarah Johnson', date: '2026-07-19', score: 45, status: 'completed', isAutoFailed: true, isDisputed: false, qaForm: 'Customer Service Excellence', qaFormPassed: false, disputeRequested: false },
  { id: '7', filename: 'call_007_2026-07-18.mp3', agentName: 'Marcus Lee', date: '2026-07-18', score: 81, status: 'completed', isAutoFailed: false, isDisputed: false, qaForm: 'Sales Call Quality Standards', qaFormPassed: true, disputeRequested: false },
  { id: '8', filename: 'call_008_2026-07-18.mp3', agentName: 'Diana Torres', date: '2026-07-18', score: 55, status: 'completed', isAutoFailed: true, isDisputed: true, qaForm: 'Compliance Check', qaFormPassed: false, disputeRequested: true },
  { id: '9', filename: 'call_009_2026-07-18.mp3', agentName: 'Kevin Park', date: '2026-07-18', score: 79, status: 'pending', isAutoFailed: false, isDisputed: false, qaForm: 'Customer Service Excellence', qaFormPassed: true, disputeRequested: false },
  { id: '10', filename: 'call_010_2026-07-17.mp3', agentName: 'Aisha Brown', date: '2026-07-17', score: 90, status: 'completed', isAutoFailed: false, isDisputed: false, qaForm: 'Sales Call Quality Standards', qaFormPassed: true, disputeRequested: false },
  { id: '11', filename: 'call_011_2026-07-17.mp3', agentName: 'Sarah Johnson', date: '2026-07-17', score: 52, status: 'completed', isAutoFailed: true, isDisputed: false, qaForm: 'Compliance Check', qaFormPassed: false, disputeRequested: false },
  { id: '12', filename: 'call_012_2026-07-17.mp3', agentName: 'Marcus Lee', date: '2026-07-17', score: 87, status: 'completed', isAutoFailed: false, isDisputed: false, qaForm: 'Sales Call Quality Standards', qaFormPassed: true, disputeRequested: false },
];

export default function CampaignDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const getCampaign = useCampaignStore((state) => state.getCampaign);

  // Campaign name lookup
  const mockCampaignNames: { [key: string]: string } = {
    '1': 'Q2 Sales Performance',
    '2': 'Customer Support Review',
    '3': 'Agent Training Q2',
  };

  // Get campaign config from store
  const campaignConfig = id ? getCampaign(id) : undefined;
  const campaignName = campaignConfig?.name || mockCampaignNames[id || ''] || 'Campaign';

  // Determine if this is a newly created campaign (ID is a timestamp)
  const isNewCampaign = id && /^\d{13}$/.test(id);

  // Get selected tests from campaign config
  const selectedTests = campaignConfig?.selectedTests || [];

  // Add Conversations Modal State
  const [showAddConversationsModal, setShowAddConversationsModal] = useState(false);
  const [conversationGroupingMode, setConversationGroupingMode] = useState<'weekly' | 'single' | null>(null);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResults, setExtractionResults] = useState<{ totalEffective: number } | null>(null);

  // Campaign Information Edit State
  const [campaignData, setCampaignData] = useState<any>(() => {
    const mockData = mockCampaignDetails[id || ''];
    if (mockData) {
      return mockData;
    }
    // Create campaign data for newly created campaigns from store config
    if (isNewCampaign && campaignConfig) {
      return {
        id: campaignConfig.id,
        name: campaignConfig.name,
        type: campaignConfig.type as any,
        responsibleContact: campaignConfig.responsibleContact,
        description: campaignConfig.description,
        evaluatorModel: '',
      };
    }
    // Fallback for newly created campaigns without config yet
    if (isNewCampaign) {
      return {
        id: id || '',
        name: campaignName,
        type: 'sales',
        responsibleContact: '',
        description: '',
        evaluatorModel: '',
      };
    }
    return null;
  });
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [campaignFormData, setCampaignFormData] = useState<Campaign | null>(null);


  // Edit QA Test modal state
  const [showEditQATestModal, setShowEditQATestModal] = useState(false);
  const [editingQATest, setEditingQATest] = useState<QATest | null>(null);

  // Run evaluations modal state
  const [showRunEvaluationsModal, setShowRunEvaluationsModal] = useState(false);
  const [selectedConversationForEvaluation, setSelectedConversationForEvaluation] = useState<ContactList | null>(null);
  const [isRunningEvaluations, setIsRunningEvaluations] = useState(false);

  // Campaign-level QA test
  const [campaignQATest, setCampaignQATest] = useState<Evaluation | null>(null);
  const [showAddEvaluationModal, setShowAddEvaluationModal] = useState(false);
  const [selectedQATestForAll, setSelectedQATestForAll] = useState<QATest | null>(null);
  const [qaTypeFilterForModal, setQaTypeFilterForModal] = useState<string | null>(null);
  const [showQATestEditor, setShowQATestEditor] = useState(false);


  // Analysis Settings Modal State
  const [showAnalysisSettingsModal, setShowAnalysisSettingsModal] = useState(false);
  const [analysisSettings, setAnalysisSettings] = useState({
    sentimentAnalysis: true,
    compliance: false,
    liveListen: false,
    agentAssist: true,
    businessInsights: true,
  });

  // Import Settings State
  const [autoImportEnabled, setAutoImportEnabled] = useState(true);
  const [importFrequency, setImportFrequency] = useState<'daily' | 'weekly' | 'biweekly'>('weekly');

  // External Campaign Filters State
  const [callsTableAgentFilter, setCallsTableAgentFilter] = useState<string | null>(null);
  const [callsTableDateFrom, setCallsTableDateFrom] = useState<Date | null>(null);
  const [callsTableDateTo, setCallsTableDateTo] = useState<Date | null>(null);
  const [callsTableAutoFailedOnly, setCallsTableAutoFailedOnly] = useState(false);
  const [callsTableDisputedOnly, setCallsTableDisputedOnly] = useState(false);
  const [callsTableQAFormFilter, setCallsTableQAFormFilter] = useState<string | null>(null);
  const [callsTableScoreMin, setCallsTableScoreMin] = useState<number | null>(null);
  const [callsTableScoreMax, setCallsTableScoreMax] = useState<number | null>(null);
  const [callsTableQAFormStatus, setCallsTableQAFormStatus] = useState<'all' | 'passed' | 'failed'>('all');
  const [callsTableDisputeRequested, setCallsTableDisputeRequested] = useState<'all' | 'yes' | 'no'>('all');
  const [callsTableCurrentPage, setCallsTableCurrentPage] = useState(1);
  const callsTableItemsPerPage = 10;

  // QA Tests in Campaign
  const [campaignQATests, setCampaignQATests] = useState<QATest[]>([
    {
      id: '1',
      name: 'Sales Call Quality Standards',
      qaType: 'sales',
      createdDate: '2026-06-15',
      evaluatedCampaigns: 5,
      createdBy: 'John Smith',
      status: 'ready',
    },
  ]);

  // Campaign edit handlers
  const handleEditCampaign = () => {
    if (campaignData) {
      setCampaignFormData(JSON.parse(JSON.stringify(campaignData)));
      setIsEditingCampaign(true);
    }
  };

  const handleSaveCampaign = () => {
    if (campaignFormData) {
      setCampaignData(campaignFormData);
      setIsEditingCampaign(false);
    }
  };

  const handleCancelEdit = () => {
    setCampaignFormData(null);
    setIsEditingCampaign(false);
  };

  // Handle extracting effective contacts
  const handleExtractEffectiveContacts = async () => {
    if (selectedConversations.size === 0) return;

    setIsExtracting(true);
    setExtractionProgress(0);

    // Simulate extraction process with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      setExtractionProgress(i);
    }

    // Calculate total effective contacts (mock data)
    const selectedLists = mockContactLists.filter((list) => selectedConversations.has(list.id));
    const totalEffective = selectedLists.reduce((sum, list) => sum + Math.floor(list.callCount * 0.85), 0);

    setExtractionProgress(100);
    setIsExtracting(false);
    setExtractionResults({ totalEffective });
  };

  const handleCloseConversationsModal = () => {
    setShowAddConversationsModal(false);
    setConversationGroupingMode(null);
    setSelectedConversations(new Set());
    setExtractionProgress(0);
    setIsExtracting(false);
    setExtractionResults(null);
  };



  // Handle running evaluations for a conversation
  const handleRunEvaluations = async () => {
    if (!selectedConversationForEvaluation) return;

    setIsRunningEvaluations(true);

    // Simulate evaluation run
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsRunningEvaluations(false);
    setShowRunEvaluationsModal(false);
    setSelectedConversationForEvaluation(null);
  };

  // Handle adding QA test to campaign
  const handleAddQATestToAll = () => {
    if (selectedQATestForAll) {
      // Convert QATest to Evaluation for display
      const evaluation: Evaluation = {
        id: selectedQATestForAll.id,
        name: selectedQATestForAll.name,
        status: 'pending',
        type: 'automatic',
        finalScore: 0,
        result: 'failed',
        evaluatedPercentage: 0,
        agent: 'QA Test Evaluator',
        llmModel: 'automatic',
        contactListIds: [],
        createdDate: selectedQATestForAll.createdDate,
      };
      setCampaignQATest(evaluation);
      setShowAddEvaluationModal(false);
      setSelectedQATestForAll(null);
      setQaTypeFilterForModal(null);
    }
  };

  // Handle applying QA Test to campaign
  const handleApplyQATest = () => {
    if (editingQATest) {
      // Create an evaluation summary from the QA test
      const newEvaluation: Evaluation = {
        id: `eval-${Date.now()}`,
        name: editingQATest.name,
        status: 'pending',
        type: 'automatic',
        finalScore: 0,
        result: 'failed',
        evaluatedPercentage: 0,
        agent: 'Auto Evaluator',
        llmModel: 'claude-sonnet-4-6',
        contactListIds: [],
        createdDate: new Date().toISOString().split('T')[0],
      };

      // In a real app, this would add to the evaluations
      console.log('Applying QA Test to campaign:', newEvaluation);
      setShowEditQATestModal(false);
      setEditingQATest(null);
    }
  };


  return (
    <>
      <div style={{ position: 'relative', paddingLeft: '280px', paddingRight: campaignData ? '360px' : '0' }}>
        {/* Main Content Area */}
        <div style={{ paddingBottom: '32px', transition: 'padding-right 0.2s ease' }}>
          <Container size="xl" px="lg" style={{ width: '100%', maxWidth: '100%', paddingTop: '48px', paddingBottom: '32px' }}>
            <Stack gap="lg" style={{ width: '100%' }}>
            {/* Breadcrumb Navigation with Back Button */}
            <Group align="center" gap="sm">
              <ActionIcon
                variant="subtle"
                onClick={() => navigate('/qa/campaigns')}
                title="Back to campaigns"
                size="lg"
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Breadcrumbs style={{ flex: 1 }}>
                <Anchor onClick={() => navigate('/qa/campaigns')} style={{ cursor: 'pointer', color: 'var(--nt-blue-500)' }}>
                  Campaigns
                </Anchor>
                <Text size="sm" c="gray.6" fw={500}>{campaignName}</Text>
              </Breadcrumbs>
            </Group>

            {/* Header */}
            <div>
              <Title order={2} style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                {campaignName}
              </Title>
              <Text size="sm" c="dimmed">View evaluation results and manage campaign settings</Text>
            </div>

            {/* Campaign Tabs - Overview and Conversations */}
            <Tabs defaultValue="overview">
              <Tabs.List>
                <Tabs.Tab value="overview">Overview</Tabs.Tab>
                <Tabs.Tab value="conversations">Conversations</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="overview" pt="md">
                <Stack gap="lg">
                  {/* Evaluation Overview Cards - View Only */}
                  <Group grow>
                    <Card shadow="sm" padding="lg" radius="lg" withBorder>
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <Text fw={600} size="sm">QA Evaluation</Text>
                          <Badge size="sm" color="green" variant="light">Stable</Badge>
                        </Group>
                        <Text size="lg" fw={700}>87%</Text>
                        <Text size="xs" c="dimmed">245 calls analyzed</Text>
                      </Stack>
                    </Card>
                    <Card shadow="sm" padding="lg" radius="lg" withBorder>
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <Text fw={600} size="sm">Sentiment Analysis</Text>
                          <Badge size="sm" color="yellow" variant="light">Concerning</Badge>
                        </Group>
                        <Text size="lg" fw={700}>68%</Text>
                        <Text size="xs" c="dimmed">Positive sentiment</Text>
                      </Stack>
                    </Card>
                    <Card shadow="sm" padding="lg" radius="lg" withBorder>
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <Text fw={600} size="sm">Compliance</Text>
                          <Badge size="sm" color="red" variant="light">Critical</Badge>
                        </Group>
                        <Text size="lg" fw={700}>82%</Text>
                        <Text size="xs" c="dimmed">Compliance rate</Text>
                      </Stack>
                    </Card>
                    <Card shadow="sm" padding="lg" radius="lg" withBorder>
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <Text fw={600} size="sm">Auto Fails</Text>
                          <Badge size="sm" color="red" variant="light">Warning</Badge>
                        </Group>
                        <Text size="lg" fw={700}>{mockCalls.filter(c => c.isAutoFailed).length}</Text>
                        <Text size="xs" c="dimmed">Automatically failed calls</Text>
                      </Stack>
                    </Card>
                    <Card shadow="sm" padding="lg" radius="lg" withBorder>
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <Text fw={600} size="sm">Disputes</Text>
                          <Badge size="sm" color="orange" variant="light">Review</Badge>
                        </Group>
                        <Text size="lg" fw={700}>{mockCalls.filter(c => c.disputeRequested || c.isDisputed).length}</Text>
                        <Text size="xs" c="dimmed">Disputed or requested review</Text>
                      </Stack>
                    </Card>
                  </Group>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="conversations" pt="md">
                <Stack gap="lg">
                  <Card shadow="sm" padding="lg" radius="lg" withBorder>
                    <Stack gap="md">
                      <div>
                        <Text fw={600} size="sm" mb="sm">Filters</Text>
                        <Stack gap="md">
                          <Group grow>
                            <Select
                              label="Agent"
                              placeholder="All agents"
                              data={mockAgents.map(name => ({ value: name, label: name }))}
                              value={callsTableAgentFilter}
                              onChange={setCallsTableAgentFilter}
                              clearable
                              searchable
                              size="sm"
                            />
                            <Select
                              label="QA Form"
                              placeholder="All forms"
                              data={mockQAForms.map(name => ({ value: name, label: name }))}
                              value={callsTableQAFormFilter}
                              onChange={setCallsTableQAFormFilter}
                              clearable
                              searchable
                              size="sm"
                            />
                            <Select
                              label="QA Form Result"
                              placeholder="All results"
                              data={[
                                { value: 'all', label: 'All' },
                                { value: 'passed', label: 'Passed' },
                                { value: 'failed', label: 'Failed' },
                              ]}
                              value={callsTableQAFormStatus}
                              onChange={(value) => {
                                setCallsTableQAFormStatus((value as 'all' | 'passed' | 'failed') || 'all');
                                setCallsTableCurrentPage(1);
                              }}
                              clearable={false}
                              searchable={false}
                              size="sm"
                            />
                          </Group>

                          <Group grow>
                            <TextInput
                              label="Date from"
                              type="date"
                              value={callsTableDateFrom ? callsTableDateFrom.toISOString().split('T')[0] : ''}
                              onChange={(e) => {
                                const value = e.currentTarget.value;
                                setCallsTableDateFrom(value ? new Date(value) : null);
                                setCallsTableCurrentPage(1);
                              }}
                              size="sm"
                            />
                            <TextInput
                              label="Date to"
                              type="date"
                              value={callsTableDateTo ? callsTableDateTo.toISOString().split('T')[0] : ''}
                              onChange={(e) => {
                                const value = e.currentTarget.value;
                                setCallsTableDateTo(value ? new Date(value) : null);
                                setCallsTableCurrentPage(1);
                              }}
                              size="sm"
                            />
                            <TextInput
                              label="Score Min"
                              type="number"
                              placeholder="0"
                              min="0"
                              max="100"
                              value={callsTableScoreMin ?? ''}
                              onChange={(e) => {
                                const value = e.currentTarget.value;
                                setCallsTableScoreMin(value ? parseInt(value) : null);
                                setCallsTableCurrentPage(1);
                              }}
                              size="sm"
                            />
                            <TextInput
                              label="Score Max"
                              type="number"
                              placeholder="100"
                              min="0"
                              max="100"
                              value={callsTableScoreMax ?? ''}
                              onChange={(e) => {
                                const value = e.currentTarget.value;
                                setCallsTableScoreMax(value ? parseInt(value) : null);
                                setCallsTableCurrentPage(1);
                              }}
                              size="sm"
                            />
                          </Group>

                          <Group>
                            <Select
                              label="Dispute Requested"
                              placeholder="All"
                              data={[
                                { value: 'all', label: 'All' },
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' },
                              ]}
                              value={callsTableDisputeRequested}
                              onChange={(value) => {
                                setCallsTableDisputeRequested((value as 'all' | 'yes' | 'no') || 'all');
                                setCallsTableCurrentPage(1);
                              }}
                              clearable={false}
                              searchable={false}
                              size="sm"
                              style={{ flex: 1 }}
                            />
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <input type="checkbox" checked={callsTableAutoFailedOnly} onChange={(e) => { setCallsTableAutoFailedOnly(e.currentTarget.checked); setCallsTableCurrentPage(1); }} />
                                <Text size="sm">Auto Failed</Text>
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <input type="checkbox" checked={callsTableDisputedOnly} onChange={(e) => { setCallsTableDisputedOnly(e.currentTarget.checked); setCallsTableCurrentPage(1); }} />
                                <Text size="sm">Disputed</Text>
                              </label>
                            </div>
                          </Group>
                        </Stack>
                      </div>

                    {/* Calls Table */}
                    {(() => {
                      let filteredCalls = mockCalls;

                      if (callsTableAgentFilter) {
                        filteredCalls = filteredCalls.filter(c => c.agentName === callsTableAgentFilter);
                      }

                      if (callsTableQAFormFilter) {
                        filteredCalls = filteredCalls.filter(c => c.qaForm === callsTableQAFormFilter);
                      }

                      if (callsTableQAFormStatus !== 'all') {
                        filteredCalls = filteredCalls.filter(c =>
                          callsTableQAFormStatus === 'passed' ? c.qaFormPassed : !c.qaFormPassed
                        );
                      }

                      if (callsTableDateFrom) {
                        filteredCalls = filteredCalls.filter(c => new Date(c.date) >= callsTableDateFrom);
                      }

                      if (callsTableDateTo) {
                        filteredCalls = filteredCalls.filter(c => new Date(c.date) <= callsTableDateTo);
                      }

                      if (callsTableScoreMin !== null) {
                        filteredCalls = filteredCalls.filter(c => c.score >= callsTableScoreMin);
                      }

                      if (callsTableScoreMax !== null) {
                        filteredCalls = filteredCalls.filter(c => c.score <= callsTableScoreMax);
                      }

                      if (callsTableDisputeRequested !== 'all') {
                        filteredCalls = filteredCalls.filter(c =>
                          callsTableDisputeRequested === 'yes' ? c.disputeRequested : !c.disputeRequested
                        );
                      }

                      if (callsTableAutoFailedOnly) {
                        filteredCalls = filteredCalls.filter(c => c.isAutoFailed);
                      }

                      if (callsTableDisputedOnly) {
                        filteredCalls = filteredCalls.filter(c => c.isDisputed);
                      }

                      const totalPages = Math.ceil(filteredCalls.length / callsTableItemsPerPage);
                      const startIndex = (callsTableCurrentPage - 1) * callsTableItemsPerPage;
                      const paginatedCalls = filteredCalls.slice(startIndex, startIndex + callsTableItemsPerPage);

                      return (
                        <>
                          <Text size="sm" c="dimmed">
                            Showing {Math.min(startIndex + 1, filteredCalls.length)}-
                            {Math.min(startIndex + callsTableItemsPerPage, filteredCalls.length)} of{' '}
                            {filteredCalls.length} calls
                          </Text>

                          <div style={{ overflowX: 'auto', width: '100%' }}>
                            <Table striped highlightOnHover style={{ width: '100%', minWidth: '100%' }}>
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th>Call</Table.Th>
                                  <Table.Th>Agent</Table.Th>
                                  <Table.Th>Date</Table.Th>
                                  <Table.Th style={{ textAlign: 'center' }}>Score</Table.Th>
                                  <Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
                                  <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {paginatedCalls.map((call) => (
                                  <Table.Tr key={call.id}>
                                    <Table.Td>
                                      <Text size="sm" fw={600}>{call.filename}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                      <Text size="sm">{call.agentName}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                      <Text size="sm">{call.date}</Text>
                                    </Table.Td>
                                    <Table.Td align="center">
                                      <Badge
                                        size="sm"
                                        color={call.score >= 80 ? 'green' : call.score >= 60 ? 'yellow' : 'red'}
                                        variant="light"
                                      >
                                        {call.score}%
                                      </Badge>
                                    </Table.Td>
                                    <Table.Td align="center">
                                      <Badge
                                        size="sm"
                                        color={call.status === 'completed' ? 'green' : 'blue'}
                                        variant="light"
                                      >
                                        {call.status === 'completed' ? 'Completed' : 'Pending'}
                                      </Badge>
                                    </Table.Td>
                                    <Table.Td align="right">
                                      <ActionIcon
                                        color="brand"
                                        variant="light"
                                        onClick={() => navigate(`/qa/campaigns/${id}/calls/${call.id}`)}
                                        title="View call evaluation"
                                      >
                                        <IconPlayerPlay size={16} />
                                      </ActionIcon>
                                    </Table.Td>
                                  </Table.Tr>
                                ))}
                              </Table.Tbody>
                            </Table>
                          </div>

                          {totalPages > 1 && (
                            <Group justify="center">
                              <Pagination value={callsTableCurrentPage} onChange={setCallsTableCurrentPage} total={totalPages} />
                            </Group>
                          )}
                        </>
                      );
                    })()}
                  </Stack>
                </Card>
                </Stack>
              </Tabs.Panel>
            </Tabs>
            </Stack>
        </Container>
      </div>

      {/* Removed old Conversation Groups section - replaced with Evaluated Calls table above */}

      {/* Add Conversations Modal */}
      <Modal
        opened={showAddConversationsModal}
        onClose={handleCloseConversationsModal}
        title="Add Conversations"
        size="md"
        centered
      >
        <Stack gap="lg">
          {!conversationGroupingMode ? (
            <>
              {/* Grouping Mode Selection */}
              <div>
                <Text fw={600} size="sm" mb="md">How would you like to view available effective contacts?</Text>
                <Group grow>
                  <Card
                    padding="md"
                    radius="md"
                    withBorder
                    onClick={() => setConversationGroupingMode('weekly')}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--nt-blue-500)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 75, 184, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#dde2e8';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Stack align="center" gap="sm">
                      <Text fw={600} size="sm">Weekly Groups</Text>
                      <Text size="xs" c="dimmed" ta="center">View conversations grouped by week</Text>
                    </Stack>
                  </Card>
                  <Card
                    padding="md"
                    radius="md"
                    withBorder
                    onClick={() => setConversationGroupingMode('single')}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--nt-blue-500)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 75, 184, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#dde2e8';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Stack align="center" gap="sm">
                      <Text fw={600} size="sm">Single Group</Text>
                      <Text size="xs" c="dimmed" ta="center">View all conversations together</Text>
                    </Stack>
                  </Card>
                </Group>
              </div>

              {/* Action Buttons */}
              <Group justify="flex-end">
                <Button variant="default" onClick={handleCloseConversationsModal}>
                  Cancel
                </Button>
              </Group>
            </>
          ) : !extractionResults ? (
            <>
              {/* Conversations Selection */}
              <div>
                <Text fw={600} size="sm" mb="md">Select conversations to extract</Text>
                <Stack gap="sm">
                  {conversationGroupingMode === 'weekly'
                    ? // Group by week - show week groups
                      Object.entries(
                        mockContactLists.reduce((acc, list) => {
                          const weekMatch = list.name.match(/(\d{2}\/\d{2})\s*-\s*(\d{2}\/\d{2})/);
                          const week = weekMatch ? `${weekMatch[1]} - ${weekMatch[2]}` : 'Other';
                          if (!acc[week]) acc[week] = [];
                          acc[week].push(list);
                          return acc;
                        }, {} as { [key: string]: typeof mockContactLists })
                      ).map(([week, lists]) => (
                        <div key={week}>
                          <Text size="xs" fw={600} c="dimmed" mb="xs" mt={week !== Object.keys(mockContactLists.reduce((acc, list) => {
                            const weekMatch = list.name.match(/(\d{2}\/\d{2})\s*-\s*(\d{2}\/\d{2})/);
                            const w = weekMatch ? `${weekMatch[1]} - ${weekMatch[2]}` : 'Other';
                            if (!acc[w]) acc[w] = [];
                            acc[w].push(list);
                            return acc;
                          }, {} as { [key: string]: typeof mockContactLists }))[0] ? 'lg' : undefined}>
                            Week: {week}
                          </Text>
                          <Stack gap="sm">
                            {lists.map((list) => (
                              <Card key={list.id} padding="sm" radius="md" withBorder>
                                <Group justify="space-between">
                                  <Group>
                                    <Checkbox
                                      checked={selectedConversations.has(list.id)}
                                      onChange={(e) => {
                                        const newSelected = new Set(selectedConversations);
                                        if (e.currentTarget.checked) {
                                          newSelected.add(list.id);
                                        } else {
                                          newSelected.delete(list.id);
                                        }
                                        setSelectedConversations(newSelected);
                                      }}
                                      color="brand"
                                    />
                                    <div>
                                      <Text size="sm" fw={500}>{list.name}</Text>
                                      <Text size="xs" c="dimmed">{list.callCount} calls</Text>
                                    </div>
                                  </Group>
                                </Group>
                              </Card>
                            ))}
                          </Stack>
                        </div>
                      ))
                    : // Single group - show all conversations
                      mockContactLists.map((list) => (
                        <Card key={list.id} padding="sm" radius="md" withBorder>
                          <Group justify="space-between">
                            <Group>
                              <Checkbox
                                checked={selectedConversations.has(list.id)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedConversations);
                                  if (e.currentTarget.checked) {
                                    newSelected.add(list.id);
                                  } else {
                                    newSelected.delete(list.id);
                                  }
                                  setSelectedConversations(newSelected);
                                }}
                                color="brand"
                              />
                              <div>
                                <Text size="sm" fw={500}>{list.name}</Text>
                                <Text size="xs" c="dimmed">{list.callCount} calls</Text>
                              </div>
                            </Group>
                          </Group>
                        </Card>
                      ))}
                </Stack>
              </div>

              {/* Extraction Progress */}
              {isExtracting && (
                <div>
                  <Text size="sm" fw={600} mb="sm">Extracting effective contacts...</Text>
                  <Progress value={extractionProgress} color="brand" size="lg" />
                  <Text size="xs" c="dimmed" mt="sm" ta="center">{extractionProgress}%</Text>
                </div>
              )}

              {/* Action Buttons */}
              <Group justify="flex-end">
                <Button variant="default" onClick={() => setConversationGroupingMode(null)} disabled={isExtracting}>
                  Back
                </Button>
                <Button variant="default" onClick={handleCloseConversationsModal} disabled={isExtracting}>
                  Cancel
                </Button>
                <Button
                  color="brand"
                  onClick={handleExtractEffectiveContacts}
                  disabled={selectedConversations.size === 0 || isExtracting}
                  loading={isExtracting}
                >
                  Extract Effective Contacts
                </Button>
              </Group>
            </>
          ) : (
            <>
              {/* Extraction Results */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--nt-green-500)', marginBottom: '8px' }}>
                    {extractionResults.totalEffective}
                  </div>
                  <Text size="sm" c="dimmed">Effective contacts extracted</Text>
                </div>
              </div>

              {/* Action Buttons */}
              <Group justify="flex-end">
                <Button color="brand" onClick={handleCloseConversationsModal}>
                  Done
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>


      {/* Add QA Test - Edit Modal */}
      <Modal
        opened={showEditQATestModal}
        onClose={() => {
          setShowEditQATestModal(false);
          setEditingQATest(null);
        }}
        title={`Edit: ${editingQATest?.name}`}
        size="lg"
        centered
      >
        {editingQATest && (
          <Stack gap="md">
            {/* QA Test Details */}
            <div>
              <Text size="sm" fw={600} mb="xs">Test Name</Text>
              <TextInput
                placeholder="QA Test Name"
                value={editingQATest.name}
                onChange={(e) => setEditingQATest({ ...editingQATest, name: e.currentTarget.value })}
              />
            </div>

            <div>
              <Text size="sm" fw={600} mb="xs">Description</Text>
              <Textarea
                placeholder="Test description"
                value={editingQATest.description || ''}
                onChange={(e) => setEditingQATest({ ...editingQATest, description: e.currentTarget.value })}
                rows={3}
              />
            </div>

            {/* Test Info */}
            <Stack gap="sm">
              <Group grow>
                <div>
                  <Text size="xs" fw={600} c="dimmed" mb="xs">Type</Text>
                  <Text size="sm">{editingQATest.qaType.charAt(0).toUpperCase() + editingQATest.qaType.slice(1)}</Text>
                </div>
                <div>
                  <Text size="xs" fw={600} c="dimmed" mb="xs">Created By</Text>
                  <Text size="sm">{editingQATest.createdBy}</Text>
                </div>
                <div>
                  <Text size="xs" fw={600} c="dimmed" mb="xs">Status</Text>
                  <Badge
                    size="sm"
                    color={editingQATest.status === 'draft' ? 'yellow' : 'green'}
                    variant="light"
                  >
                    {editingQATest.status === 'draft' ? 'Draft' : 'Ready'}
                  </Badge>
                </div>
              </Group>
            </Stack>

            {/* Action Buttons */}
            <Group justify="flex-end" gap="xs" style={{ paddingTop: '12px', borderTop: '1px solid #e9ecef' }}>
              <Button
                variant="default"
                onClick={() => {
                  setShowEditQATestModal(false);
                  setEditingQATest(null);
                }}
              >
                Cancel
              </Button>
              <Button color="brand" onClick={handleApplyQATest}>
                Apply to Campaign
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Run Evaluations Modal */}
      <Modal
        opened={showRunEvaluationsModal}
        onClose={() => {
          setShowRunEvaluationsModal(false);
          setSelectedConversationForEvaluation(null);
        }}
        title="Run Evaluations"
        centered
      >
        {selectedConversationForEvaluation && campaignQATest && (
          <Stack gap="md">
            <div>
              <Text size="sm" fw={600} mb="xs">Conversation</Text>
              <Text size="sm">{selectedConversationForEvaluation.name}</Text>
            </div>

            <div>
              <Text size="sm" fw={600} mb="xs">QA Test to Run</Text>
              <Text size="sm">{campaignQATest.name}</Text>
            </div>

            <Text size="sm" c="dimmed">
              This will run the selected QA test for this conversation. This process may take a few moments.
            </Text>

            <Group justify="flex-end" gap="xs">
              <Button
                variant="default"
                onClick={() => {
                  setShowRunEvaluationsModal(false);
                  setSelectedConversationForEvaluation(null);
                }}
                disabled={isRunningEvaluations}
              >
                Cancel
              </Button>
              <Button
                color="brand"
                onClick={handleRunEvaluations}
                loading={isRunningEvaluations}
              >
                Run Evaluations
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Add QA Test to All Conversations Modal */}
      <Modal
        opened={showAddEvaluationModal}
        onClose={() => {
          setShowAddEvaluationModal(false);
          setSelectedQATestForAll(null);
          setQaTypeFilterForModal(null);
        }}
        title="Add QA Test to All Conversations"
        size="lg"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Select a QA test to add to all conversation groups in this campaign
          </Text>

          <Select
            placeholder="Filter by QA Type"
            data={[
              { value: 'sales', label: 'Sales' },
              { value: 'localization', label: 'Localization' },
              { value: 'retention', label: 'Retention' },
              { value: 'activation', label: 'Activation' },
              { value: 'accounts-receivable', label: 'Accounts Receivable' },
            ]}
            value={qaTypeFilterForModal}
            onChange={setQaTypeFilterForModal}
            clearable
            searchable
          />

          <Stack gap="md" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {mockQATests
              .filter((test) => !qaTypeFilterForModal || test.qaType === qaTypeFilterForModal)
              .map((test) => (
                <Card
                  key={test.id}
                  padding="md"
                  radius="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedQATestForAll?.id === test.id ? 'rgba(27, 181, 74, 0.05)' : 'transparent',
                    borderColor: selectedQATestForAll?.id === test.id ? 'var(--nt-green-500)' : '#dde2e8',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setSelectedQATestForAll(test)}
                >
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Text fw={600} size="sm" mb="xs">{test.name}</Text>
                      <Text size="xs" c="dimmed">{test.description}</Text>
                      <Group gap="xs" mt="xs">
                        <Badge size="sm" variant="light" color="blue">
                          {test.qaType.charAt(0).toUpperCase() + test.qaType.slice(1)}
                        </Badge>
                        <Badge size="sm" variant="light" color={test.status === 'ready' ? 'green' : 'yellow'}>
                          {test.status === 'ready' ? 'Ready' : 'Draft'}
                        </Badge>
                      </Group>
                    </div>
                    <ActionIcon
                      variant="light"
                      color="brand"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingQATest(test);
                        setShowQATestEditor(true);
                      }}
                      title="Edit test"
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
          </Stack>

          <Group justify="flex-end" gap="xs">
            <Button
              variant="default"
              onClick={() => {
                setShowAddEvaluationModal(false);
                setSelectedQATestForAll(null);
                setQaTypeFilterForModal(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="brand"
              onClick={handleAddQATestToAll}
              disabled={!selectedQATestForAll}
            >
              Add QA Test to All
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* QA Test Editor Modal */}
      <Modal
        opened={showQATestEditor}
        onClose={() => {
          setShowQATestEditor(false);
          setEditingQATest(null);
        }}
        title={`Edit: ${editingQATest?.name}`}
        size="xl"
        centered
      >
        {editingQATest && editingQATest.aspects && (
          <QATestEditor
            aspects={editingQATest.aspects}
            onChange={(updatedAspects) => {
              setEditingQATest({
                ...editingQATest,
                aspects: updatedAspects,
              });
            }}
            onReady={(finalAspects) => {
              const updated = {
                ...editingQATest,
                aspects: finalAspects,
              };
              setEditingQATest(updated);
              setSelectedQATestForAll(updated);
              setShowQATestEditor(false);
            }}
            readyButtonText="Apply Changes"
          />
        )}
      </Modal>

      {/* Fixed Campaign Information Sidebar */}
      {campaignData && (
        <div style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '360px',
          height: '100vh',
          backgroundColor: '#fff',
          borderLeft: '1px solid #e9ecef',
          overflowY: 'auto',
          padding: '48px 16px 32px 16px',
          zIndex: 50,
        }}>
          <Stack gap="lg">
            {/* QA Tests Section */}
            <div>
              <Group justify="space-between" align="center" mb="md">
                <Title order={5} size="h6" style={{ margin: 0 }}>Available QA Tests</Title>
              </Group>
              {isNewCampaign && selectedTests.length === 0 ? (
                <Stack align="center" justify="center" py="md">
                  <Text size="sm" c="dimmed" ta="center">No QA tests selected</Text>
                </Stack>
              ) : (
                <ScrollArea>
                  <Stack gap="sm" pr="md">
                    {(isNewCampaign ? selectedTests : mockQATests).map((test) => (
                      <Card
                        key={test.id}
                        padding="sm"
                        radius="md"
                        withBorder
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        className="hover-card"
                        onClick={() => {
                          setEditingQATest(test as any);
                          setShowEditQATestModal(true);
                        }}
                      >
                        <Stack gap="xs">
                          <Text size="sm" fw={600}>{test.name}</Text>
                          <Group justify="space-between" align="center">
                            <Text size="xs" c="dimmed">Type</Text>
                            <Badge size="xs" color="blue" variant="light">
                              {test.qaType}
                            </Badge>
                          </Group>
                          <Group justify="space-between" align="center">
                            <Text size="xs" c="dimmed">Status</Text>
                            <Badge size="xs" color="green" variant="light">
                              {test.status}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed" lineClamp={2}>{test.description}</Text>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </ScrollArea>
              )}
            </div>

            <Divider />

            <Group justify="space-between" align="center">
              <Title order={5} size="h6">Campaign Info</Title>
              {!isEditingCampaign && (
                <ActionIcon
                  variant="light"
                  color="brand"
                  onClick={handleEditCampaign}
                  title="Edit campaign"
                  size="sm"
                >
                  <IconEdit size={14} />
                </ActionIcon>
              )}
            </Group>

            {!isEditingCampaign ? (
              <Stack gap="md">
                <div>
                  <Text size="xs" fw={600} c="dimmed" mb="xs">Campaign Name</Text>
                  <Text size="sm" fw={500}>{campaignData.name}</Text>
                </div>
                <div>
                  <Text size="xs" fw={600} c="dimmed" mb="xs">Campaign Type</Text>
                  <Badge size="sm" color="blue" variant="light">
                    {campaignData.type.charAt(0).toUpperCase() + campaignData.type.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Text size="xs" fw={600} c="dimmed" mb="xs">Responsible Contact</Text>
                  <Text size="sm">{campaignData.responsibleContact}</Text>
                </div>
                {campaignData.evaluatorModel && (
                  <div>
                    <Text size="xs" fw={600} c="dimmed" mb="xs">Evaluator Model</Text>
                    <Badge size="sm" color="green" variant="light">
                      {campaignData.evaluatorModel}
                    </Badge>
                  </div>
                )}
                <div>
                  <Text size="xs" fw={600} c="dimmed" mb="xs">Description</Text>
                  <Text size="sm" c="dimmed">{campaignData.description}</Text>
                </div>
              </Stack>
            ) : (
              <Stack gap="md">
                <div>
                  <Text fw={600} size="xs" mb="xs">Campaign Name</Text>
                  <TextInput
                    placeholder="Enter campaign name"
                    size="sm"
                    value={campaignFormData?.name || ''}
                    onChange={(e) =>
                      setCampaignFormData(
                        campaignFormData ? { ...campaignFormData, name: e.currentTarget.value } : null
                      )
                    }
                  />
                </div>

                <div>
                  <Text fw={600} size="xs" mb="xs">Campaign Type</Text>
                  <Select
                    placeholder="Select type"
                    size="sm"
                    data={[
                      { value: 'sales', label: 'Sales' },
                      { value: 'localization', label: 'Localization' },
                      { value: 'retention', label: 'Retention' },
                      { value: 'activation', label: 'Activation' },
                      { value: 'accounts-receivable', label: 'Accounts Receivable' },
                    ]}
                    value={campaignFormData?.type || null}
                    onChange={(val) =>
                      setCampaignFormData(
                        campaignFormData
                          ? { ...campaignFormData, type: val as Campaign['type'] }
                          : null
                      )
                    }
                  />
                </div>

                <div>
                  <Text fw={600} size="xs" mb="xs">Responsible Contact</Text>
                  <TextInput
                    placeholder="Enter contact name"
                    size="sm"
                    value={campaignFormData?.responsibleContact || ''}
                    onChange={(e) =>
                      setCampaignFormData(
                        campaignFormData
                          ? { ...campaignFormData, responsibleContact: e.currentTarget.value }
                          : null
                      )
                    }
                  />
                </div>

                <div>
                  <Text fw={600} size="xs" mb="xs">Evaluator Model</Text>
                  <TextInput
                    placeholder="e.g., Pro Sales Evaluator v2.5"
                    size="sm"
                    value={campaignFormData?.evaluatorModel || ''}
                    onChange={(e) =>
                      setCampaignFormData(
                        campaignFormData
                          ? { ...campaignFormData, evaluatorModel: e.currentTarget.value }
                          : null
                      )
                    }
                  />
                </div>

                <div>
                  <Text fw={600} size="xs" mb="xs">Description</Text>
                  <Textarea
                    placeholder="Enter description"
                    size="sm"
                    value={campaignFormData?.description || ''}
                    onChange={(e) =>
                      setCampaignFormData(
                        campaignFormData
                          ? { ...campaignFormData, description: e.currentTarget.value }
                          : null
                      )
                    }
                    rows={2}
                  />
                </div>

                <Group justify="flex-end" gap="xs" style={{ paddingTop: 'var(--mantine-spacing-md)', borderTop: '1px solid #e9ecef' }}>
                  <Button variant="default" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button color="brand" size="sm" onClick={handleSaveCampaign}>
                    Save
                  </Button>
                </Group>
              </Stack>
            )}
          </Stack>
        </div>
      )}
      </div>

{/* Analysis Settings Modal with Tabs */}
      <Modal
        opened={showAnalysisSettingsModal}
        onClose={() => setShowAnalysisSettingsModal(false)}
        title="Campaign Settings"
        centered
        size="md"
      >
        <Tabs defaultValue="qa-tests">
          <Tabs.List>
            <Tabs.Tab value="qa-tests">QA Tests</Tabs.Tab>
            <Tabs.Tab value="import">Import</Tabs.Tab>
          </Tabs.List>

          {/* QA Tests Tab */}
          <Tabs.Panel value="qa-tests" pt="md">
            <Stack gap="md">
              {/* QA Tests in Campaign */}
              <div>
                <Group justify="space-between" align="center" mb="md">
                  <Text fw={600} size="sm">QA Tests</Text>
                  <Button
                    size="xs"
                    variant="light"
                    color="brand"
                    onClick={() => {
                      setShowAnalysisSettingsModal(false);
                      setShowAddEvaluationModal(true);
                    }}
                  >
                    Add Test
                  </Button>
                </Group>
                {campaignQATests.length > 0 ? (
                  <Stack gap="sm">
                    {campaignQATests.map((test) => (
                      <Card
                        key={test.id}
                        padding="sm"
                        radius="md"
                        withBorder
                        style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}
                      >
                        <div>
                          <Text size="sm" fw={500}>{test.name}</Text>
                          <Text size="xs" c="dimmed" mt="4px">
                            Type: {test.qaType} • Created by: {test.createdBy}
                          </Text>
                        </div>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed">No QA tests added yet</Text>
                )}
              </div>

              <Divider />

              {/* Analysis Options */}
              <div>
                <Text fw={600} size="sm" mb="md">Analysis Parameters</Text>
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <div>
                      <Text size="sm" fw={500}>Sentiment Analysis</Text>
                      <Text size="xs" c="dimmed">Analyze emotional tone of conversations</Text>
                    </div>
                    <Switch
                      checked={analysisSettings.sentimentAnalysis}
                      onChange={(e) =>
                        setAnalysisSettings({ ...analysisSettings, sentimentAnalysis: e.currentTarget.checked })
                      }
                    />
                  </Group>

                  <Group justify="space-between" align="center">
                    <div>
                      <Text size="sm" fw={500}>Compliance</Text>
                      <Text size="xs" c="dimmed">Verify compliance requirements</Text>
                    </div>
                    <Switch
                      checked={analysisSettings.compliance}
                      onChange={(e) =>
                        setAnalysisSettings({ ...analysisSettings, compliance: e.currentTarget.checked })
                      }
                    />
                  </Group>

                  <Group justify="space-between" align="center">
                    <div>
                      <Text size="sm" fw={500}>Live Listen</Text>
                      <Text size="xs" c="dimmed">Real-time conversation monitoring</Text>
                    </div>
                    <Switch
                      checked={analysisSettings.liveListen}
                      onChange={(e) =>
                        setAnalysisSettings({ ...analysisSettings, liveListen: e.currentTarget.checked })
                      }
                    />
                  </Group>

                  <Group justify="space-between" align="center">
                    <div>
                      <Text size="sm" fw={500}>Agent Assist</Text>
                      <Text size="xs" c="dimmed">AI suggestions during calls</Text>
                    </div>
                    <Switch
                      checked={analysisSettings.agentAssist}
                      onChange={(e) =>
                        setAnalysisSettings({ ...analysisSettings, agentAssist: e.currentTarget.checked })
                      }
                    />
                  </Group>

                  <Group justify="space-between" align="center">
                    <div>
                      <Text size="sm" fw={500}>Business Insights</Text>
                      <Text size="xs" c="dimmed">Strategic business analytics</Text>
                    </div>
                    <Switch
                      checked={analysisSettings.businessInsights}
                      onChange={(e) =>
                        setAnalysisSettings({ ...analysisSettings, businessInsights: e.currentTarget.checked })
                      }
                    />
                  </Group>
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
                  <Text fw={600} size="sm" mb="md">Import Frequency</Text>
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
            </Stack>
          </Tabs.Panel>

          {/* Action Buttons */}
          <Group justify="flex-end" gap="xs" mt="lg">
            <Button variant="default" onClick={() => setShowAnalysisSettingsModal(false)}>
              Close
            </Button>
            <Button color="brand" onClick={() => setShowAnalysisSettingsModal(false)}>
              Save Settings
            </Button>
          </Group>
        </Tabs>
      </Modal>
    </>
  );
}
