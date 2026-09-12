import { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Title,
  Stack,
  Group,
  Button,
  Card,
  Text,
  TextInput,
  Table,
  Badge,
  Progress,
  ActionIcon,
  FileInput,
  Radio,
  Modal,
  Loader,
  Center,
  ScrollArea,
  Textarea,
  Select,
  Stepper,
  Checkbox,
  Switch,
  Divider,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconUpload,
  IconTrash,
  IconSearch,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import ExternalCampaignProgress from '../components/ExternalCampaignProgress';
import { useCampaignStore } from '../stores/useCampaignStore';
import type { CampaignConfig, Aspect } from '../types';

// TODO: Import real QATestEditor from common components
const QATestEditor = () => <div>QA Test Editor placeholder</div>;

interface UploadedFile {
  id: string;
  name: string;
  duration: string;
  format: string;
  agentName: string;
  campaignId: string;
  status: 'extracting' | 'ready' | 'error';
}

interface CMXCampaign {
  id: string;
  name: string;
  callCount: number;
  status: 'active' | 'inactive';
}

interface EvaluationItem {
  id: string;
  name: string;
  points: number;
  enabled: boolean;
}

interface EvaluationAspect {
  id: string;
  name: string;
  weight: number;
  enabled: boolean;
  items: EvaluationItem[];
}

interface Evaluation {
  id: string;
  name: string;
  type: 'localization' | 'retention' | 'activation' | 'accounts receivable';
  status: 'active' | 'running' | 'pending' | 'completed';
  aspects: EvaluationAspect[];
}

interface EvaluationItemQA {
  id: string;
  name: string;
  errorType: 'critical-business' | 'critical-client' | 'critical-compliance';
  answerType: 'yes-no' | 'yes-no-na';
  description?: string;
  valuation: number;
}

interface AspectQA {
  id: string;
  name: string;
  description: string;
  items: EvaluationItemQA[];
}

interface QATest {
  id: string;
  name: string;
  qaType: 'sales' | 'localization' | 'retention' | 'activation' | 'accounts-receivable';
  createdDate: string;
  evaluatedCampaigns: number;
  createdBy: string;
  description?: string;
  aspects?: AspectQA[];
  status: 'ready' | 'draft';
}

const mockCMXCampaigns: CMXCampaign[] = [
  { id: '1', name: 'Q2 Sales Performance', callCount: 45, status: 'active' },
  { id: '2', name: 'Customer Support Quality', callCount: 120, status: 'active' },
  { id: '3', name: 'New Hire Training - June', callCount: 30, status: 'inactive' },
  { id: '4', name: 'Q3 Retention Campaign', callCount: 60, status: 'active' },
  { id: '5', name: 'Accounts Receivable Follow-up', callCount: 85, status: 'inactive' },
];

const mockImportedCampaigns = ['1', '3'];

interface Conversation {
  id: string;
  name: string;
  date: string;
  callCount: number;
  effectiveContacts: number;
}

const mockConversations: { [campaignId: string]: Conversation[] } = {
  '1': [
    { id: 'c1', name: 'Q2 Sales Performance 06/15', date: '2026-06-15', callCount: 12, effectiveContacts: 10 },
    { id: 'c2', name: 'Q2 Sales Performance 06/22', date: '2026-06-22', callCount: 8, effectiveContacts: 7 },
    { id: 'c3', name: 'Q2 Sales Performance 06/29', date: '2026-06-29', callCount: 10, effectiveContacts: 8 },
    { id: 'c4', name: 'Q2 Sales Performance 07/06', date: '2026-07-06', callCount: 9, effectiveContacts: 7 },
    { id: 'c5', name: 'Q2 Sales Performance 07/13', date: '2026-07-13', callCount: 6, effectiveContacts: 5 },
  ],
  '2': [
    { id: 'c6', name: 'Customer Support Quality 06/10', date: '2026-06-10', callCount: 25, effectiveContacts: 20 },
    { id: 'c7', name: 'Customer Support Quality 06/17', date: '2026-06-17', callCount: 30, effectiveContacts: 25 },
    { id: 'c8', name: 'Customer Support Quality 06/24', date: '2026-06-24', callCount: 28, effectiveContacts: 23 },
    { id: 'c9', name: 'Customer Support Quality 07/01', date: '2026-07-01', callCount: 22, effectiveContacts: 18 },
    { id: 'c10', name: 'Customer Support Quality 07/08', date: '2026-07-08', callCount: 15, effectiveContacts: 12 },
  ],
  '3': [
    { id: 'c11', name: 'New Hire Training - June 01', date: '2026-06-01', callCount: 8, effectiveContacts: 6 },
    { id: 'c12', name: 'New Hire Training - June 08', date: '2026-06-08', callCount: 10, effectiveContacts: 8 },
    { id: 'c13', name: 'New Hire Training - June 15', date: '2026-06-15', callCount: 12, effectiveContacts: 10 },
  ],
  '4': [
    { id: 'c14', name: 'Q3 Retention Campaign 07/01', date: '2026-07-01', callCount: 18, effectiveContacts: 15 },
    { id: 'c15', name: 'Q3 Retention Campaign 07/08', date: '2026-07-08', callCount: 22, effectiveContacts: 19 },
    { id: 'c16', name: 'Q3 Retention Campaign 07/15', date: '2026-07-15', callCount: 20, effectiveContacts: 17 },
  ],
  '5': [
    { id: 'c17', name: 'Accounts Receivable Follow-up 06/20', date: '2026-06-20', callCount: 35, effectiveContacts: 28 },
    { id: 'c18', name: 'Accounts Receivable Follow-up 06/27', date: '2026-06-27', callCount: 28, effectiveContacts: 22 },
    { id: 'c19', name: 'Accounts Receivable Follow-up 07/04', date: '2026-07-04', callCount: 22, effectiveContacts: 18 },
  ],
};

const mockQATests: QATest[] = [
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
        description: 'Evaluate agent greeting, introduction, and call opening sequence',
        items: [
          {
            id: 'i1',
            name: 'Agent greeted within 3 seconds',
            errorType: 'critical-business',
            answerType: 'yes-no',
            description: 'Customer received greeting within 3 seconds of call connection',
            valuation: 15,
          },
          {
            id: 'i2',
            name: 'Agent introduced company and name',
            errorType: 'critical-client',
            answerType: 'yes-no',
            description: 'Agent clearly stated company name and personal name',
            valuation: 10,
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Product Description Accuracy',
    qaType: 'localization',
    createdDate: '2026-06-10',
    evaluatedCampaigns: 3,
    createdBy: 'Maria Garcia',
    status: 'draft',
  },
  {
    id: '3',
    name: 'Customer Retention Messaging',
    qaType: 'retention',
    createdDate: '2026-06-08',
    evaluatedCampaigns: 8,
    createdBy: 'Sarah Johnson',
    status: 'ready',
  },
  {
    id: '4',
    name: 'New User Activation Flow',
    qaType: 'activation',
    createdDate: '2026-06-05',
    evaluatedCampaigns: 4,
    createdBy: 'Michael Chen',
    status: 'ready',
  },
  {
    id: '5',
    name: 'Invoice Accuracy & Compliance',
    qaType: 'accounts-receivable',
    createdDate: '2026-05-28',
    evaluatedCampaigns: 2,
    createdBy: 'Amanda Wilson',
    status: 'draft',
  },
  {
    id: '6',
    name: 'Multi-language Support Testing',
    qaType: 'localization',
    createdDate: '2026-05-20',
    evaluatedCampaigns: 6,
    createdBy: 'James Rodriguez',
    status: 'ready',
  },
];

const qaTypeConfig = {
  sales: { label: 'Sales', color: 'green' },
  localization: { label: 'Localization', color: 'blue' },
  retention: { label: 'Retention', color: 'violet' },
  activation: { label: 'Activation', color: 'cyan' },
  'accounts-receivable': { label: 'Accounts Receivable', color: 'orange' },
};

export default function CampaignCreate() {
  const navigate = useNavigate();
  const addCampaign = useCampaignStore((state) => state.addCampaign);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [campaignName, setCampaignName] = useState('');
  const [selectedCMXCampaign, setSelectedCMXCampaign] = useState<string | null>(null);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [conversationGrouping, setConversationGrouping] = useState<'all' | 'from-date'>('all');
  const [analysisServices, setAnalysisServices] = useState({
    sentimentAnalysis: true,
    compliance: false,
    liveListen: false,
    agentAssist: true,
    businessInsights: true,
  });
  const [selectedEvaluations, setSelectedEvaluations] = useState<Set<string>>(new Set());
  const [selectedEvaluation, setSelectedEvaluation] = useState<QATest | Evaluation | null>(null);
  const [modifiedEvaluation, setModifiedEvaluation] = useState<QATest | Evaluation | null>(null);
  const [modifiedAspects, setModifiedAspects] = useState<Aspect[]>([]);
  const [showAssignmentOptions, setShowAssignmentOptions] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationComplete, setEvaluationComplete] = useState(false);
  const [externalCampaignForm, setExternalCampaignForm] = useState<{
    campaignName: string;
    type: string;
    callDirection: 'inbound' | 'outbound' | 'mixed';
    description: string;
  }>({
    campaignName: '',
    type: 'sales',
    callDirection: 'inbound',
    description: '',
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [qaTestSearchQuery, setQaTestSearchQuery] = useState('');
  const [qaTypeFilter, setQaTypeFilter] = useState<string | null>(null);
  const [selectedQATests, setSelectedQATests] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'external-form' | 'local' | 'external-upload' | 'evaluation'>('external-form');

  const filteredQATests = useMemo(() => {
    let result = mockQATests.filter((test) => test.status === 'ready');

    if (qaTestSearchQuery.trim()) {
      result = result.filter(
        (test) =>
          test.name.toLowerCase().includes(qaTestSearchQuery.toLowerCase()) ||
          test.createdBy.toLowerCase().includes(qaTestSearchQuery.toLowerCase())
      );
    }

    if (qaTypeFilter) {
      result = result.filter((test) => test.qaType === qaTypeFilter);
    }

    return result;
  }, [qaTestSearchQuery, qaTypeFilter]);

  const availableCMXCampaigns = mockCMXCampaigns.filter(
    (campaign) => !mockImportedCampaigns.includes(campaign.id) &&
      (statusFilter === 'all' || campaign.status === statusFilter)
  );

  // Auto-select all conversations when grouping mode changes
  useEffect(() => {
    if (selectedCMXCampaign) {
      const conversations = mockConversations[selectedCMXCampaign] || [];
      const allConversationIds = new Set(conversations.map((c) => c.id));
      setSelectedConversations(allConversationIds);
    }
  }, [conversationGrouping, selectedCMXCampaign]);

  // Simulate file extraction
  const handleFilesSelect = (files: File[] | null) => {
    if (!files) return;

    setIsExtracting(true);
    setExtractionProgress(0);

    const totalFiles = files.length;
    let processedCount = 0;

    const interval = setInterval(() => {
      processedCount++;
      setExtractionProgress((processedCount / totalFiles) * 100);

      if (processedCount === totalFiles) {
        clearInterval(interval);

        const newFiles: UploadedFile[] = files.map((file, index) => {
          const agentNames = ['John Smith', 'Sarah Jones', 'Mike Wilson', 'Emma Davis', 'Alex Brown'];
          const campaignId = `CAMP-${Date.now()}-${index}`;

          return {
            id: `file-${Date.now()}-${index}`,
            name: file.name,
            duration: Math.floor(Math.random() * 600 + 60) + 's',
            format: file.name.split('.').pop()?.toUpperCase() || 'MP3',
            agentName: agentNames[Math.floor(Math.random() * agentNames.length)],
            campaignId,
            status: 'ready',
          };
        });

        setUploadedFiles([...uploadedFiles, ...newFiles]);
        setIsExtracting(false);

        if (!campaignName && newFiles.length > 0) {
          const suggestedName = newFiles[0].agentName + ' - ' + new Date().toLocaleDateString();
          setCampaignName(suggestedName);
        }
      }
    }, 150);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== id));
  };

  const handleLocalCampaignSelect = (cmxId: string) => {
    const campaign = mockCMXCampaigns.find(c => c.id === cmxId);
    if (campaign) {
      setSelectedCMXCampaign(cmxId);
      setCampaignName(campaign.name);
    }
  };

  const handleAssignmentOptions = () => {
    setEvaluationComplete(false);
    setShowAssignmentOptions(true);
  };

  const handleStartEvaluationImmediately = () => {
    setIsEvaluating(true);

    // Simulate evaluation processing
    setTimeout(() => {
      console.log('Evaluation completed:', {
        campaignName,
        evaluation: modifiedEvaluation,
      });
      setIsEvaluating(false);
      setEvaluationComplete(true);
    }, 2000);
  };

  const handleViewEvaluation = () => {
    const evaluationId = selectedEvaluation?.id || '1';
    // Navigate to evaluation detail page with simplified URL pattern
    navigate(`/qa/campaigns/${selectedCMXCampaign}/evaluations/${evaluationId}`);
  };

  const handleAssignAndEvaluateLater = () => {
    console.log('Evaluation assigned:', {
      campaignName,
      evaluation: modifiedEvaluation,
    });
    setShowAssignmentOptions(false);
    notifySuccess('Evaluation assigned successfully');
    navigate(`/qa/campaigns/${selectedCMXCampaign}`);
  };

  const handleSaveCampaign = () => {
    const campaignId = Date.now().toString();
    console.log('Saving campaign:', {
      id: campaignId,
      name: campaignName,
      files: uploadedFiles,
    });
    notifySuccess('Campaign created successfully');
    navigate(`/qa/campaigns/${campaignId}`);
  };

  // ═══════════════════════════════════════════════════════════════════
  // EXTERNAL CAMPAIGN STEPPER FLOW (4 STEPS)
  // ═══════════════════════════════════════════════════════════════════
  if (step === 'local') {
    return (
      <Container size="xl" px="xl" style={{ paddingTop: '64px', paddingBottom: '140px' }}>
        <Stack gap="xl">
          <Group>
            <ActionIcon variant="subtle" onClick={() => {
              if (currentStep > 0) {
                setCurrentStep(currentStep - 1);
              } else {
                navigate('/qa/campaigns');
                setCurrentStep(0);
              }
            }} title="Back">
              <IconArrowLeft size={18} />
            </ActionIcon>
            <div style={{ flex: 1 }}>
              <Title order={2} style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                Import Campaign from CMX
              </Title>
              <Text size="sm" c="dimmed">Set up your campaign evaluation with these simple steps</Text>
            </div>
          </Group>

          {/* Stepper */}
          <Card shadow="sm" padding="xl" radius="lg" withBorder>
            <Stepper active={currentStep} onStepClick={setCurrentStep} allowNextStepsSelect={false}>
              <Stepper.Step label="Select Campaign" description="Choose a CMX campaign">
                <Stack gap="lg" style={{ paddingTop: '16px' }}>
                  <Text size="sm" c="dimmed">Select a campaign from your available CMX campaigns</Text>
                  <div>
                    <Group justify="space-between" align="flex-end" mb="md">
                      <Text fw={600}>Available Campaigns</Text>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed" fw={500}>Filter by status:</Text>
                        <Group gap={4}>
                          <Button
                            size="xs"
                            variant={statusFilter === 'all' ? 'filled' : 'light'}
                            color="gray"
                            onClick={() => setStatusFilter('all')}
                          >
                            All
                          </Button>
                          <Button
                            size="xs"
                            variant={statusFilter === 'active' ? 'filled' : 'light'}
                            color="green"
                            onClick={() => setStatusFilter('active')}
                          >
                            Active
                          </Button>
                          <Button
                            size="xs"
                            variant={statusFilter === 'inactive' ? 'filled' : 'light'}
                            color="gray"
                            onClick={() => setStatusFilter('inactive')}
                          >
                            Inactive
                          </Button>
                        </Group>
                      </Group>
                    </Group>
                    {availableCMXCampaigns.length === 0 ? (
                      <Stack align="center" justify="center" py="lg" gap="md">
                        <Text size="sm" c="dimmed" style={{ textAlign: 'center' }}>
                          All campaigns have already been imported or no campaigns are available.
                        </Text>
                      </Stack>
                    ) : (
                    <ScrollArea>
                    <Table striped highlightOnHover style={{ minWidth: '100%' }}>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th></Table.Th>
                          <Table.Th>Campaign Name</Table.Th>
                          <Table.Th style={{ textAlign: 'center' }}>Total Calls</Table.Th>
                          <Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                        <Table.Tbody>
                          {availableCMXCampaigns.map((campaign) => (
                            <Table.Tr
                              key={campaign.id}
                              style={{
                                cursor: 'pointer',
                                backgroundColor: selectedCMXCampaign === campaign.id ? 'rgba(27, 181, 74, 0.05)' : 'transparent',
                              }}
                              onClick={() => handleLocalCampaignSelect(campaign.id)}
                            >
                              <Table.Td>
                                <Radio
                                  checked={selectedCMXCampaign === campaign.id}
                                  onChange={() => handleLocalCampaignSelect(campaign.id)}
                                  color="brand"
                                  style={{ cursor: 'pointer' }}
                                />
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" fw={500}>{campaign.name}</Text>
                              </Table.Td>
                              <Table.Td align="center">
                                <Badge color="gray" variant="light" size="sm">
                                  {campaign.callCount} calls
                                </Badge>
                              </Table.Td>
                              <Table.Td align="center">
                                <Badge
                                  color={campaign.status === 'active' ? 'green' : 'gray'}
                                  variant="light"
                                  size="sm"
                                >
                                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                </Badge>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                    )}
                  </div>
                </Stack>
              </Stepper.Step>

              <Stepper.Step label="Select Effective Contacts" description="Choose contacts to import">
                <Stack gap="lg" style={{ paddingTop: '16px' }}>
                  <Group>
                    <div style={{ flex: 1 }}>
                      <Text fw={600} mb="md">Select effective contacts to import</Text>
                      <Text size="sm" c="dimmed">Choose whether to import all effective contacts or specify a starting date</Text>
                    </div>
                  </Group>

                  {/* Effective Contacts Selection */}
                  <Card padding="md" radius="md" withBorder style={{ backgroundColor: '#f9f9f9' }}>
                    <Stack gap="md">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          cursor: 'pointer',
                          padding: '12px',
                          borderRadius: '6px',
                          border: conversationGrouping === 'all' ? '2px solid var(--nt-green-500)' : '1px solid #dde2e8',
                          backgroundColor: conversationGrouping === 'all' ? 'rgba(27, 181, 74, 0.05)' : 'transparent'
                        }}
                        onClick={() => setConversationGrouping('all')}
                      >
                        <Radio
                          checked={conversationGrouping === 'all'}
                          onChange={() => setConversationGrouping('all')}
                          color="brand"
                          style={{ marginTop: '2px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <Text size="sm" fw={600}>All Effective Contacts</Text>
                          <Text size="xs" c="dimmed">Import all available effective contacts from the selected campaign</Text>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          cursor: 'pointer',
                          padding: '12px',
                          borderRadius: '6px',
                          border: conversationGrouping === 'from-date' ? '2px solid var(--nt-green-500)' : '1px solid #dde2e8',
                          backgroundColor: conversationGrouping === 'from-date' ? 'rgba(27, 181, 74, 0.05)' : 'transparent'
                        }}
                        onClick={() => setConversationGrouping('from-date')}
                      >
                        <Radio
                          checked={conversationGrouping === 'from-date'}
                          onChange={() => setConversationGrouping('from-date')}
                          color="brand"
                          style={{ marginTop: '2px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <Text size="sm" fw={600}>From Specific Date</Text>
                          <Text size="xs" c="dimmed">Import effective contacts starting from a specific date</Text>
                          {conversationGrouping === 'from-date' && (
                            <TextInput
                              type="date"
                              placeholder="Select start date"
                              mt="md"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                      </div>
                    </Stack>
                  </Card>
                </Stack>
              </Stepper.Step>

              <Stepper.Step label="Select QA Tests & Services" description="Configure tests and analysis">
                <Stack gap="lg" style={{ paddingTop: '16px' }}>
                  <Group>
                    <div style={{ flex: 1 }}>
                      <Text fw={600} mb="md">Configure QA tests and analysis services</Text>
                      <Text size="sm" c="dimmed">Select QA tests to assign and enable analysis services for this campaign</Text>
                    </div>
                  </Group>

                  {/* QA Tests Section */}
                  <Card padding="lg" radius="lg" withBorder>
                    <Stack gap="md">
                      {/* Search Input */}
                      <TextInput
                        placeholder="Search QA tests by name..."
                        leftSection={<IconSearch size={16} />}
                        size="md"
                        value={qaTestSearchQuery}
                        onChange={(e) => setQaTestSearchQuery(e.currentTarget.value)}
                      />

                      {/* Type Filter */}
                      <div>
                        <Text size="sm" fw={600} mb="xs">Filter by Type</Text>
                        <Group gap={4}>
                          <Button
                            size="xs"
                            variant={qaTypeFilter === null ? 'filled' : 'light'}
                            color="gray"
                            onClick={() => setQaTypeFilter(null)}
                          >
                            All Types
                          </Button>
                          <Button
                            size="xs"
                            variant={qaTypeFilter === 'sales' ? 'filled' : 'light'}
                            color="gray"
                            onClick={() => setQaTypeFilter('sales')}
                          >
                            Sales
                          </Button>
                          <Button
                            size="xs"
                            variant={qaTypeFilter === 'compliance' ? 'filled' : 'light'}
                            color="gray"
                            onClick={() => setQaTypeFilter('compliance')}
                          >
                            Compliance
                          </Button>
                          <Button
                            size="xs"
                            variant={qaTypeFilter === 'quality' ? 'filled' : 'light'}
                            color="gray"
                            onClick={() => setQaTypeFilter('quality')}
                          >
                            Quality
                          </Button>
                          <Button
                            size="xs"
                            variant={qaTypeFilter === 'training' ? 'filled' : 'light'}
                            color="gray"
                            onClick={() => setQaTypeFilter('training')}
                          >
                            Training
                          </Button>
                        </Group>
                      </div>

                      <Divider />

                      {/* QA Tests List */}
                      <ScrollArea>
                        <Stack gap="md" style={{ minWidth: '100%' }}>
                          {(qaTypeFilter === null || qaTypeFilter === 'sales') && (
                            <Checkbox
                              label="Sales Quality Scorecard"
                              description="Evaluate sales call quality and performance"
                              size="lg"
                              checked={selectedQATests.has('sales-scorecard')}
                              onChange={(e) => {
                                const newSelected = new Set(selectedQATests);
                                if (e.currentTarget.checked) {
                                  newSelected.add('sales-scorecard');
                                } else {
                                  newSelected.delete('sales-scorecard');
                                }
                                setSelectedQATests(newSelected);
                              }}
                            />
                          )}
                          {(qaTypeFilter === null || qaTypeFilter === 'quality') && (
                            <Checkbox
                              label="Customer Support Quality"
                              description="Assess customer service call handling and satisfaction"
                              size="lg"
                              checked={selectedQATests.has('support-quality')}
                              onChange={(e) => {
                                const newSelected = new Set(selectedQATests);
                                if (e.currentTarget.checked) {
                                  newSelected.add('support-quality');
                                } else {
                                  newSelected.delete('support-quality');
                                }
                                setSelectedQATests(newSelected);
                              }}
                            />
                          )}
                          {(qaTypeFilter === null || qaTypeFilter === 'compliance') && (
                            <Checkbox
                              label="Compliance Audit"
                              description="Verify regulatory and compliance requirements"
                              size="lg"
                              checked={selectedQATests.has('compliance-audit')}
                              onChange={(e) => {
                                const newSelected = new Set(selectedQATests);
                                if (e.currentTarget.checked) {
                                  newSelected.add('compliance-audit');
                                } else {
                                  newSelected.delete('compliance-audit');
                                }
                                setSelectedQATests(newSelected);
                              }}
                            />
                          )}
                          {(qaTypeFilter === null || qaTypeFilter === 'training') && (
                            <Checkbox
                              label="Agent Training Assessment"
                              description="Evaluate agent knowledge and training effectiveness"
                              size="lg"
                              checked={selectedQATests.has('training-assessment')}
                              onChange={(e) => {
                                const newSelected = new Set(selectedQATests);
                                if (e.currentTarget.checked) {
                                  newSelected.add('training-assessment');
                                } else {
                                  newSelected.delete('training-assessment');
                                }
                                setSelectedQATests(newSelected);
                              }}
                            />
                          )}
                          {(qaTypeFilter === null || qaTypeFilter === 'quality') && (
                            <Checkbox
                              label="Call Handling Efficiency"
                              description="Measure call duration and handling efficiency"
                              size="lg"
                              checked={selectedQATests.has('call-efficiency')}
                              onChange={(e) => {
                                const newSelected = new Set(selectedQATests);
                                if (e.currentTarget.checked) {
                                  newSelected.add('call-efficiency');
                                } else {
                                  newSelected.delete('call-efficiency');
                                }
                                setSelectedQATests(newSelected);
                              }}
                            />
                          )}
                          {(qaTypeFilter === null || qaTypeFilter === 'training') && (
                            <Checkbox
                              label="Agent Soft Skills"
                              description="Assess communication, empathy, and professionalism"
                              size="lg"
                              checked={selectedQATests.has('soft-skills')}
                              onChange={(e) => {
                                const newSelected = new Set(selectedQATests);
                                if (e.currentTarget.checked) {
                                  newSelected.add('soft-skills');
                                } else {
                                  newSelected.delete('soft-skills');
                                }
                                setSelectedQATests(newSelected);
                              }}
                            />
                          )}
                        </Stack>
                      </ScrollArea>

                      {/* Empty State */}
                      {((qaTypeFilter === 'sales' || qaTypeFilter === 'compliance' || qaTypeFilter === 'training' || qaTypeFilter === 'quality') &&
                        (qaTypeFilter === 'sales' ? false : qaTypeFilter === 'quality' ? false : qaTypeFilter === 'compliance' ? false : qaTypeFilter === 'training' ? false : true)) && (
                        <Stack align="center" py="lg">
                          <Text size="sm" c="dimmed">No QA tests found for this type</Text>
                        </Stack>
                      )}

                      <Text size="xs" c="dimmed" mt="md">
                        Select one or more QA tests to include in this campaign
                      </Text>
                    </Stack>
                  </Card>

                  {/* Analysis Services Section */}
                  <Card padding="lg" radius="lg" withBorder>
                    <Stack gap="md">
                      <div>
                        <Text fw={600} size="sm" mb="md">Enable Analysis Services</Text>
                        <Text size="xs" c="dimmed" mb="md">Select which analysis services to enable for this campaign</Text>
                      </div>

                      {/* Sentiment Analysis */}
                      <Group justify="space-between" align="center">
                        <div style={{ flex: 1 }}>
                          <Text fw={600} size="sm">Sentiment Analysis</Text>
                          <Text size="xs" c="dimmed">Analyze emotional tone and sentiment patterns in conversations</Text>
                        </div>
                        <Switch
                          checked={analysisServices.sentimentAnalysis}
                          onChange={(e) =>
                            setAnalysisServices({ ...analysisServices, sentimentAnalysis: e.currentTarget.checked })
                          }
                          color="brand"
                        />
                      </Group>

                      <Divider />

                      {/* Live Listen */}
                      <Group justify="space-between" align="center">
                        <div style={{ flex: 1 }}>
                          <Text fw={600} size="sm">Live Listen</Text>
                          <Text size="xs" c="dimmed">Real-time conversation monitoring and alerts</Text>
                        </div>
                        <Switch
                          checked={analysisServices.liveListen}
                          onChange={(e) =>
                            setAnalysisServices({ ...analysisServices, liveListen: e.currentTarget.checked })
                          }
                          color="brand"
                        />
                      </Group>

                      <Divider />

                      {/* Agent Assist */}
                      <Group justify="space-between" align="center">
                        <div style={{ flex: 1 }}>
                          <Text fw={600} size="sm">Agent Assist</Text>
                          <Text size="xs" c="dimmed">AI-powered suggestions and guidance during calls</Text>
                        </div>
                        <Switch
                          checked={analysisServices.agentAssist}
                          onChange={(e) =>
                            setAnalysisServices({ ...analysisServices, agentAssist: e.currentTarget.checked })
                          }
                          color="brand"
                        />
                      </Group>

                      <Divider />

                      {/* Business Insights */}
                      <Group justify="space-between" align="center">
                        <div style={{ flex: 1 }}>
                          <Text fw={600} size="sm">Business Insights</Text>
                          <Text size="xs" c="dimmed">Strategic business analytics and performance metrics</Text>
                        </div>
                        <Switch
                          checked={analysisServices.businessInsights}
                          onChange={(e) =>
                            setAnalysisServices({ ...analysisServices, businessInsights: e.currentTarget.checked })
                          }
                          color="brand"
                        />
                      </Group>
                    </Stack>
                  </Card>

                  {/* Services Summary */}
                  <Card padding="md" radius="md" withBorder style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                    <Stack gap="sm">
                      <Text fw={600} size="sm">Enabled Services Summary</Text>
                      <Group gap="xs">
                        {analysisServices.sentimentAnalysis && (
                          <Badge color="green" variant="light">
                            Sentiment Analysis
                          </Badge>
                        )}
                        {analysisServices.liveListen && (
                          <Badge color="green" variant="light">
                            Live Listen
                          </Badge>
                        )}
                        {analysisServices.agentAssist && (
                          <Badge color="green" variant="light">
                            Agent Assist
                          </Badge>
                        )}
                        {analysisServices.businessInsights && (
                          <Badge color="green" variant="light">
                            Business Insights
                          </Badge>
                        )}
                      </Group>
                      {!analysisServices.sentimentAnalysis && !analysisServices.liveListen && !analysisServices.agentAssist && !analysisServices.businessInsights && (
                        <Text size="xs" c="dimmed">
                          No services enabled
                        </Text>
                      )}
                    </Stack>
                  </Card>
                </Stack>
              </Stepper.Step>

              <Stepper.Completed>
                <Stack align="center" py="xl" gap="lg">
                  <div style={{ textAlign: 'center' }}>
                    <Text fw={600} size="lg" mb="sm">Campaign Setup Complete!</Text>
                    <Text size="sm" c="dimmed">
                      Your campaign has been configured and is ready to start evaluating.
                    </Text>
                  </div>
                </Stack>
              </Stepper.Completed>
            </Stepper>
          </Card>

          {selectedCMXCampaign && (
            <Card shadow="sm" padding="lg" radius="lg" withBorder style={{ backgroundColor: '#f7f8fa', marginTop: '8px' }}>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" fw={600} mb="sm">
                    SELECTED CAMPAIGN
                  </Text>
                  <Text fw={500} size="base">{campaignName}</Text>
                </div>
              </Group>
            </Card>
          )}

          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '20px 32px',
            zIndex: 100,
          }}>
            <Group justify="flex-end" gap="md" style={{ maxWidth: '1240px', margin: '0 auto' }}>
              <Button variant="default" onClick={() => {
                if (currentStep > 0) {
                  setCurrentStep(currentStep - 1);
                } else {
                  navigate('/qa/campaigns');
                  setCurrentStep(0);
                }
              }}>
                {currentStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              <Button
                color="brand"
                onClick={() => {
                  if (currentStep < 2) {
                    // Continue to next step (conversations and evaluator)
                    setCurrentStep(currentStep + 1);
                  } else if (currentStep === 2) {
                    // Step 2 (evaluator) is required - create campaign
                    handleSaveCampaign();
                  }
                }}
                disabled={
                  (currentStep === 0 && !selectedCMXCampaign) ||
                  (currentStep === 1 && selectedConversations.size === 0) ||
                  (currentStep === 2 && Object.values(analysisServices).filter(Boolean).length === 0)
                }
              >
                {currentStep === 2 ? 'Create Campaign' : 'Next'}
              </Button>
            </Group>
          </div>
        </Stack>
      </Container>
    );
  }
  if (step === 'external-form') {
    return (
      <>
      <Container size="xl" px="lg" style={{ paddingTop: '48px', paddingBottom: '120px' }}>
        <Stack gap="lg">
          <ExternalCampaignProgress currentStep="form" />

          <Group>
            <ActionIcon variant="subtle" onClick={() => navigate('/qa/campaigns')} title="Back">
              <IconArrowLeft size={18} />
            </ActionIcon>
            <div style={{ flex: 1 }}>
              <Title order={2} style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                External Campaign Information
              </Title>
              <Text size="sm" c="dimmed">Provide details for your external campaign</Text>
            </div>
          </Group>

          <Card shadow="sm" padding="lg" radius="lg" withBorder>
            <Stack gap="md">
              <div>
                <Text fw={600} mb="xs">Campaign Name</Text>
                <TextInput
                  placeholder="e.g., Q2 Sales Campaign"
                  value={externalCampaignForm.campaignName}
                  onChange={(e) => setExternalCampaignForm({ ...externalCampaignForm, campaignName: e.currentTarget.value })}
                />
              </div>

              <div>
                <Text fw={600} mb="xs">Campaign Type</Text>
                <Select
                  placeholder="Select campaign type"
                  data={[
                    { value: 'sales', label: 'Sales' },
                    { value: 'accounts-receivable', label: 'Accounts Receivable' },
                    { value: 'retention', label: 'Retention' },
                    { value: 'localization', label: 'Localization' },
                  ]}
                  value={externalCampaignForm.type}
                  onChange={(val) => setExternalCampaignForm({ ...externalCampaignForm, type: val || 'sales' })}
                />
              </div>

              <div>
                <Text fw={600} mb="xs">Call Direction</Text>
                <Select
                  placeholder="Select call direction"
                  data={[
                    { value: 'inbound', label: 'Inbound' },
                    { value: 'outbound', label: 'Outbound' },
                    { value: 'mixed', label: 'Mixed' },
                  ]}
                  value={externalCampaignForm.callDirection}
                  onChange={(val) => setExternalCampaignForm({ ...externalCampaignForm, callDirection: (val as 'inbound' | 'outbound' | 'mixed') || 'inbound' })}
                />
              </div>

              <div>
                <Text fw={600} mb="xs">Description</Text>
                <Textarea
                  placeholder="Brief description of this campaign"
                  value={externalCampaignForm.description}
                  onChange={(e) => setExternalCampaignForm({ ...externalCampaignForm, description: e.currentTarget.value })}
                  rows={3}
                />
              </div>
            </Stack>
          </Card>
        </Stack>
      </Container>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 24px',
        zIndex: 100,
      }}>
        <Group justify="flex-end" style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <Button variant="default" onClick={() => navigate('/qa/campaigns')}>
            Back
          </Button>
          <Button
            color="brand"
            onClick={() => {
              setCampaignName(externalCampaignForm.campaignName);
              setStep('external-upload');
            }}
            disabled={!externalCampaignForm.campaignName}
          >
            Next
          </Button>
        </Group>
      </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 3: EXTERNAL CAMPAIGN UPLOAD VIEW
  // ═══════════════════════════════════════════════════════════════════
  if (step === 'external-upload') {
    return (
      <>
      <Container size="xl" px="lg" style={{ paddingTop: '48px', paddingBottom: '120px' }}>
        <Stack gap="lg">
          <ExternalCampaignProgress currentStep="upload" />

          <Group>
            <ActionIcon variant="subtle" onClick={() => setStep('external-form')} title="Back">
              <IconArrowLeft size={18} />
            </ActionIcon>
            <div style={{ flex: 1 }}>
              <Title order={2} style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                Upload Campaign Files
              </Title>
              <Text size="sm" c="dimmed">Upload audio files to create your campaign (Optional - You can upload files later)</Text>
            </div>
          </Group>

          {uploadedFiles.length === 0 && !isExtracting ? (
            <Card shadow="sm" padding="xl" radius="lg" withBorder style={{ backgroundColor: '#f7f8fa' }}>
              <Stack gap="lg" align="center" justify="center" py="xl">
                <IconUpload size={56} style={{ color: 'var(--nt-green-500)', opacity: 0.7 }} />
                <div style={{ textAlign: 'center' }}>
                  <Title order={4} style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Drag files here or click to upload
                  </Title>
                  <Text size="sm" c="dimmed" mb="lg">
                    Support for MP3, WAV, and other audio formats. Upload up to 100+ files at once.
                    <br />
                    <Text component="span" size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                      (Optional - You can create the campaign and upload files later)
                    </Text>
                  </Text>
                </div>
                <FileInput
                  multiple
                  accept="audio/*"
                  placeholder="Click to select audio files"
                  onChange={handleFilesSelect}
                  style={{ width: '100%' }}
                />
              </Stack>
            </Card>
          ) : null}

          {isExtracting && (
            <Card shadow="sm" padding="lg" radius="lg" withBorder style={{ backgroundColor: '#f7f8fa' }}>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={600} mb="xs">Extracting information from calls</Text>
                    <Text size="sm" c="dimmed">Processing {uploadedFiles.length + Math.ceil(extractionProgress)} files...</Text>
                  </div>
                </Group>
                <Progress value={extractionProgress} color="brand" />
              </Stack>
            </Card>
          )}

          {uploadedFiles.length > 0 && (
            <Card shadow="sm" padding="lg" radius="lg" withBorder>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={600} mb="xs">Uploaded Files</Text>
                    <Text size="sm" c="dimmed">{uploadedFiles.length} files ready</Text>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <Button variant="light" color="brand" size="sm" onClick={() => handleFilesSelect([])}>
                      Add More Files
                    </Button>
                  )}
                </Group>

                <ScrollArea>
                <Table striped highlightOnHover style={{ minWidth: '100%' }}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Filename</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Duration</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Format</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Agent</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Campaign ID</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                    <Table.Tbody>
                      {uploadedFiles.map((file) => (
                        <Table.Tr key={file.id}>
                          <Table.Td>
                            <Text size="sm" fw={500} truncate>
                              {file.name}
                            </Text>
                          </Table.Td>
                          <Table.Td align="center">
                            <Text size="sm">{file.duration}</Text>
                          </Table.Td>
                          <Table.Td align="center">
                            <Badge color="gray" variant="light" size="sm">
                              {file.format}
                            </Badge>
                          </Table.Td>
                          <Table.Td align="center">
                            <Text size="sm">{file.agentName}</Text>
                          </Table.Td>
                          <Table.Td align="center">
                            <Text size="sm" c="dimmed">{file.campaignId}</Text>
                          </Table.Td>
                          <Table.Td align="right">
                            <ActionIcon
                              size="sm"
                              color="red"
                              variant="subtle"
                              onClick={() => handleRemoveFile(file.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Stack>
            </Card>
          )}
        </Stack>
      </Container>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 24px',
        zIndex: 100,
      }}>
        <Group justify="flex-end" gap="xs" style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <Button variant="default" onClick={() => setStep('external-form')}>
            Back
          </Button>
          {uploadedFiles.length === 0 && (
            <Button
              variant="light"
              color="brand"
              onClick={() => setStep('evaluation')}
              disabled={isExtracting}
            >
              Skip and Continue
            </Button>
          )}
          {uploadedFiles.length > 0 && (
            <Button
              variant="light"
              onClick={handleSaveCampaign}
              disabled={isExtracting}
            >
              Upload Later
            </Button>
          )}
          {uploadedFiles.length > 0 && (
            <Button
              color="brand"
              onClick={() => setStep('evaluation')}
              disabled={isExtracting}
            >
              Continue
            </Button>
          )}
        </Group>
      </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 4: EVALUATION SELECTION & MODIFICATION VIEW
  // ═══════════════════════════════════════════════════════════════════
  if (step === 'evaluation') {
    // If no evaluation selected yet, show selection table
    if (!selectedEvaluation) {
      return (
        <Container size="xl" px="lg" style={{ paddingTop: '48px', paddingBottom: '120px' }}>
          <Stack gap="lg">
            <ExternalCampaignProgress currentStep="evaluation" />

            <Group>
              <ActionIcon
                variant="subtle"
                onClick={() => {
                  if (selectedCMXCampaign) {
                    setStep('local');
                  } else {
                    setStep('external-upload');
                  }
                  setSelectedEvaluations(new Set());
                  setSelectedEvaluation(null);
                  setModifiedEvaluation(null);
                }}
                title="Back"
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
              <div style={{ flex: 1 }}>
                <Title order={2} style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                  Select Evaluations
                </Title>
                <Text size="sm" c="dimmed">Choose one or more evaluations to assign to this campaign</Text>
              </div>
            </Group>

            <Card shadow="sm" padding="lg" radius="lg" withBorder>
              <Stack gap="md">
                <Group grow align="flex-end">
                  <TextInput
                    placeholder="Search by test name or creator..."
                    leftSection={<IconSearch size={16} />}
                    value={qaTestSearchQuery}
                    onChange={(e) => setQaTestSearchQuery(e.currentTarget.value)}
                  />
                  <Select
                    placeholder="Filter by QA Type"
                    data={[
                      { value: 'sales', label: 'Sales' },
                      { value: 'localization', label: 'Localization' },
                      { value: 'retention', label: 'Retention' },
                      { value: 'activation', label: 'Activation' },
                      { value: 'accounts-receivable', label: 'Accounts Receivable' },
                    ]}
                    value={qaTypeFilter}
                    onChange={setQaTypeFilter}
                    clearable
                    searchable
                  />
                </Group>

                <ScrollArea>
                  <Table striped highlightOnHover style={{ minWidth: '100%' }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th></Table.Th>
                        <Table.Th>Test Name</Table.Th>
                        <Table.Th>QA Type</Table.Th>
                        <Table.Th>Created Date</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Created By</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredQATests.map((test) => {
                        const typeConfig = qaTypeConfig[test.qaType];
                        return (
                          <Table.Tr
                            key={test.id}
                            style={{
                              cursor: 'pointer',
                              backgroundColor: selectedEvaluations.has(test.id) ? 'rgba(27, 181, 74, 0.05)' : 'transparent',
                            }}
                            onClick={() => {
                              const newSelected = new Set(selectedEvaluations);
                              if (newSelected.has(test.id)) {
                                newSelected.delete(test.id);
                              } else {
                                newSelected.add(test.id);
                              }
                              setSelectedEvaluations(newSelected);
                            }}
                          >
                            <Table.Td>
                              <Checkbox
                                checked={selectedEvaluations.has(test.id)}
                                onChange={() => {
                                  const newSelected = new Set(selectedEvaluations);
                                  if (newSelected.has(test.id)) {
                                    newSelected.delete(test.id);
                                  } else {
                                    newSelected.add(test.id);
                                  }
                                  setSelectedEvaluations(newSelected);
                                }}
                                color="brand"
                                style={{ cursor: 'pointer' }}
                              />
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm" fw={600} style={{ color: 'var(--nt-blue-500)' }}>{test.name}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={typeConfig.color} variant="light">{typeConfig.label}</Badge>
                            </Table.Td>
                            <Table.Td>{test.createdDate}</Table.Td>
                            <Table.Td>
                              <Badge color={test.status === 'draft' ? 'yellow' : 'green'} variant="light">
                                {test.status === 'draft' ? 'Draft' : 'Ready'}
                              </Badge>
                            </Table.Td>
                            <Table.Td>{test.createdBy}</Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>

                {filteredQATests.length === 0 && (
                  <Stack align="center" py="lg">
                    <Text c="dimmed">No tests found matching your criteria</Text>
                  </Stack>
                )}
              </Stack>
            </Card>

            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              padding: '16px 24px',
              zIndex: 100,
            }}>
              <Group justify="flex-end" gap="xs" style={{ maxWidth: '1240px', margin: '0 auto' }}>
                <Button
                  variant="default"
                  onClick={() => {
                    setSelectedEvaluations(new Set());
                    setSelectedEvaluation(null);
                    setModifiedEvaluation(null);
                  }}
                >
                  Back
                </Button>
                {selectedEvaluations.size === 0 && (
                  <Button
                    variant="light"
                    color="brand"
                    onClick={() => {
                      const campaignId = Date.now().toString();

                      const campaignConfig = {
                        id: campaignId,
                        name: externalCampaignForm.campaignName,
                        type: externalCampaignForm.type,
                        callDirection: externalCampaignForm.callDirection,
                        description: externalCampaignForm.description,
                        uploadedFiles,
                        selectedTests: [],
                        createdAt: new Date().toISOString(),
                        source: 'external' as const,
                      };

                      addCampaign(campaignConfig);

                      console.log('Creating campaign without evaluations:', campaignConfig);
                      notifySuccess('Campaign created successfully');
                      navigate(`/qa/campaigns/${campaignId}`);
                    }}
                  >
                    Skip and Continue
                  </Button>
                )}
                {selectedEvaluations.size > 0 && (
                  <Button
                    color="brand"
                    onClick={() => {
                      const campaignId = Date.now().toString();

                      const selectedTests = Array.from(selectedEvaluations)
                        .map(id => {
                          const test = filteredQATests.find(t => t.id === id);
                          return test ? {
                            id: test.id,
                            name: test.name,
                            qaType: test.qaType,
                            status: test.status,
                            createdDate: test.createdDate,
                            createdBy: test.createdBy,
                          } : null;
                        })
                        .filter(Boolean) as any[];

                      const campaignConfig = {
                        id: campaignId,
                        name: externalCampaignForm.campaignName,
                        type: externalCampaignForm.type,
                        callDirection: externalCampaignForm.callDirection,
                        description: externalCampaignForm.description,
                        uploadedFiles,
                        selectedTests,
                        createdAt: new Date().toISOString(),
                        source: 'external' as const,
                      };

                      addCampaign(campaignConfig);

                      console.log('Creating campaign with evaluations:', campaignConfig);
                      notifySuccess('Campaign created successfully');
                      navigate(`/qa/campaigns/${campaignId}`);
                    }}
                  >
                    Create Campaign ({selectedEvaluations.size} selected)
                  </Button>
                )}
              </Group>
            </div>
          </Stack>
        </Container>
      );
    }

    // Show evaluation modification view
    return (
      <Container size="xl" px="lg" style={{ paddingTop: '48px', paddingBottom: '32px' }}>
        <Stack gap="lg">
          <Group>
            <ActionIcon
              variant="subtle"
              onClick={() => {
                setSelectedEvaluation(null);
                setModifiedEvaluation(null);
              }}
              title="Back"
            >
              <IconArrowLeft size={18} />
            </ActionIcon>
            <div style={{ flex: 1 }}>
              <Title order={2} style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                {modifiedEvaluation?.name}
              </Title>
              <Text size="sm" c="dimmed">Configure evaluation aspects for this campaign</Text>
            </div>
          </Group>

          {/* Campaign Info */}
          <Card shadow="sm" padding="lg" radius="lg" withBorder style={{ backgroundColor: '#f7f8fa' }}>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} mb="xs">
                  CAMPAIGN
                </Text>
                <Text fw={500}>{campaignName}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" fw={600} mb="xs">
                  EVALUATION
                </Text>
                <Text fw={500}>{modifiedEvaluation?.name}</Text>
              </div>
            </Group>
          </Card>

          {/* QA Test Editor */}
          {modifiedEvaluation && (
            <QATestEditor
              aspects={modifiedAspects.length > 0 ? modifiedAspects : ((modifiedEvaluation.aspects as any) || [])}
              onChange={setModifiedAspects}
            />
          )}

          {/* Actions */}
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setSelectedEvaluation(null)}>
              Back
            </Button>
            <Button
              color="brand"
              onClick={handleAssignmentOptions}
              disabled={(modifiedAspects.length === 0 && (!modifiedEvaluation?.aspects || modifiedEvaluation.aspects.length === 0))}
            >
              Assign Evaluation
            </Button>
          </Group>
        </Stack>

        {/* Assignment Options Modal */}
        <Modal
          opened={showAssignmentOptions}
          onClose={() => {
            if (!isEvaluating && !evaluationComplete) {
              setShowAssignmentOptions(false);
            }
          }}
          title={evaluationComplete ? "Evaluation Complete" : isEvaluating ? "Assuring Quality" : "How would you like to proceed?"}
          centered
          closeButtonProps={{ disabled: isEvaluating || evaluationComplete }}
        >
          {evaluationComplete ? (
            <Stack gap="lg" align="center">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
                <Text size="sm" fw={600} mb="xs">Quality Assurance Complete</Text>
                <Text size="sm" c="dimmed">
                  Evaluation has been completed successfully. The results are ready for review.
                </Text>
              </div>
              <Button
                color="brand"
                fullWidth
                onClick={handleViewEvaluation}
              >
                View Evaluation Results
              </Button>
            </Stack>
          ) : isEvaluating ? (
            <Center>
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <div style={{ textAlign: 'center' }}>
                  <Text size="sm" fw={500} mb="xs">Assuring quality in campaigns...</Text>
                  <Text size="xs" c="dimmed">This process may take a few moments. Please stand by.</Text>
                </div>
              </Stack>
            </Center>
          ) : (
            <Stack gap="lg">
              <Stack gap="sm">
                <Text size="sm" fw={500}>Choose how to proceed with this evaluation:</Text>
                <Text size="sm" c="dimmed">
                  Start evaluation immediately to begin quality assurance, or assign for later and schedule evaluation at your convenience.
                </Text>
              </Stack>
              <Group justify="flex-end">
                <Button variant="default" onClick={() => setShowAssignmentOptions(false)}>
                  Cancel
                </Button>
                <Button
                  variant="light"
                  color="brand"
                  onClick={handleAssignAndEvaluateLater}
                >
                  Assign for Later
                </Button>
                <Button
                  color="brand"
                  onClick={handleStartEvaluationImmediately}
                >
                  Start Evaluation Now
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Container>
    );
  }

  return null;
}
