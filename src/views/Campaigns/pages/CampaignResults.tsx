import { useState } from 'react';
import { Container, Title, Stack, Button, Group, Card, Text, Table, Badge, Select, Slider, Grid, Progress } from '@mantine/core';
import { IconArrowLeft, IconDownload } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

interface CallEvaluationResult {
  id: string;
  callId: string;
  filename: string;
  agentName: string;
  aiScore: number;
  finalScore: number;
  delta: number;
  overridden: boolean;
  mode: 'manual' | 'auto';
  evaluatorModel: string;
  evaluatedAt: string;
}

const mockResults: CallEvaluationResult[] = [
  {
    id: '1',
    callId: 'CALL-001',
    filename: 'call_001.mp3',
    agentName: 'John Smith',
    aiScore: 85,
    finalScore: 88,
    delta: 3,
    overridden: true,
    mode: 'auto',
    evaluatorModel: 'claude-sonnet-4-6',
    evaluatedAt: '2026-06-22 14:30',
  },
  {
    id: '2',
    callId: 'CALL-002',
    filename: 'call_002.mp3',
    agentName: 'Sarah Jones',
    aiScore: 92,
    finalScore: 92,
    delta: 0,
    overridden: false,
    mode: 'auto',
    evaluatorModel: 'claude-sonnet-4-6',
    evaluatedAt: '2026-06-22 14:35',
  },
  {
    id: '3',
    callId: 'CALL-003',
    filename: 'call_003.mp3',
    agentName: 'Mike Wilson',
    aiScore: 0,
    finalScore: 78,
    delta: 78,
    overridden: true,
    mode: 'manual',
    evaluatorModel: 'manual',
    evaluatedAt: '2026-06-22 15:00',
  },
  {
    id: '4',
    callId: 'CALL-004',
    filename: 'call_004.mp3',
    agentName: 'John Smith',
    aiScore: 76,
    finalScore: 76,
    delta: 0,
    overridden: false,
    mode: 'auto',
    evaluatorModel: 'claude-sonnet-4-6',
    evaluatedAt: '2026-06-22 15:10',
  },
  {
    id: '5',
    callId: 'CALL-005',
    filename: 'call_005.mp3',
    agentName: 'Sarah Jones',
    aiScore: 88,
    finalScore: 85,
    delta: -3,
    overridden: true,
    mode: 'auto',
    evaluatorModel: 'claude-sonnet-4-6',
    evaluatedAt: '2026-06-22 15:20',
  },
];

export default function CampaignResults() {
  const navigate = useNavigate();

  const [results] = useState<CallEvaluationResult[]>(mockResults);
  const [filterMode, setFilterMode] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState<string | null>(null);
  const [scoreRange] = useState<number[]>([0, 100]);

  // Filtered results
  const filteredResults = results.filter((r) => {
    if (filterMode && r.mode !== filterMode) return false;
    if (filterAgent && r.agentName !== filterAgent) return false;
    if (r.finalScore < scoreRange[0] || r.finalScore > scoreRange[1]) return false;
    return true;
  });

  // Calculations
  const aiAvgScore = (results.reduce((sum, r) => sum + r.aiScore, 0) / results.length).toFixed(1);
  const finalAvgScore = (results.reduce((sum, r) => sum + r.finalScore, 0) / results.length).toFixed(1);
  const passRate = ((results.filter((r) => r.finalScore >= 80).length / results.length) * 100).toFixed(1);
  const aiAccuracy = ((results.filter((r) => !r.overridden).length / results.length) * 100).toFixed(1);

  const agents = [...new Set(results.map((r) => r.agentName))];
  const modes = [...new Set(results.map((r) => r.mode))];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const rows = filteredResults.map((result) => (
    <Table.Tr key={result.id}>
      <Table.Td>
        <Text size="sm" fw={600}>{result.callId}</Text>
        <Text size="xs" c="dimmed">{result.filename}</Text>
      </Table.Td>
      <Table.Td>{result.agentName}</Table.Td>
      <Table.Td align="center">
        <Badge color="blue" variant="light">{result.aiScore}</Badge>
      </Table.Td>
      <Table.Td align="center">
        <Badge color={getScoreColor(result.finalScore)} variant="light">
          {result.finalScore}
        </Badge>
      </Table.Td>
      <Table.Td align="center">
        <Text size="sm" fw={600} c={result.delta > 0 ? 'green' : result.delta < 0 ? 'red' : 'gray'}>
          {result.delta > 0 ? '+' : ''}{result.delta}
        </Text>
      </Table.Td>
      <Table.Td align="center">
        {result.overridden ? (
          <Badge color="orange" variant="light">⚠ Overridden</Badge>
        ) : (
          <Badge color="gray" variant="light">—</Badge>
        )}
      </Table.Td>
      <Table.Td>{result.mode === 'auto' ? 'AI' : 'Manual'}</Table.Td>
      <Table.Td>{result.evaluatorModel}</Table.Td>
      <Table.Td>{result.evaluatedAt}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" px="lg" style={{ paddingTop: '48px', paddingBottom: '32px' }}>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group>
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => navigate(-1)}
            >
              Back to Campaign
            </Button>
            <div>
              <Title order={2}>QA Results</Title>
              <Text size="sm" c="dimmed">Campaign evaluation results with dual scoring (AI vs Human)</Text>
            </div>
          </Group>
          <Button
            leftSection={<IconDownload size={18} />}
            variant="light"
            onClick={() => {
              const csv = 'Call ID,Agent,AI Score,Final Score,Delta,Overridden,Mode,Model,Date\n' +
                filteredResults.map(r => `${r.callId},${r.agentName},${r.aiScore},${r.finalScore},${r.delta},${r.overridden ? 'Yes' : 'No'},${r.mode},${r.evaluatorModel},${r.evaluatedAt}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'qa-results.csv';
              a.click();
            }}
          >
            Export CSV
          </Button>
        </Group>

        {/* Metrics Grid */}
        <Grid gap="lg">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="lg" withBorder>
              <Stack gap="md">
                <Text size="xs" fw={600} c="dimmed">AI Average Score</Text>
                <div>
                  <Title order={2}>{aiAvgScore}%</Title>
                </div>
                <Progress value={parseFloat(aiAvgScore)} color={getScoreColor(parseFloat(aiAvgScore))} />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="lg" withBorder>
              <Stack gap="md">
                <Text size="xs" fw={600} c="dimmed">Human Final Score</Text>
                <div>
                  <Title order={2}>{finalAvgScore}%</Title>
                </div>
                <Progress value={parseFloat(finalAvgScore)} color={getScoreColor(parseFloat(finalAvgScore))} />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="lg" withBorder>
              <Stack gap={0}>
                <Text size="xs" fw={600} c="dimmed" mb="xs">Pass Rate</Text>
                <Title order={3}>{passRate}%</Title>
                <Text size="xs" c="dimmed">Calls scoring ≥80%</Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="lg" withBorder>
              <Stack gap={0}>
                <Text size="xs" fw={600} c="dimmed" mb="xs">AI Accuracy</Text>
                <Title order={3}>{aiAccuracy}%</Title>
                <Text size="xs" c="dimmed">No human override</Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="lg" withBorder>
          <Stack gap="md">
            <Text fw={600} size="sm">Filters</Text>
            <Group grow>
              <Select
                placeholder="Filter by mode..."
                data={modes.map((m) => ({ value: m, label: m === 'auto' ? 'Automatic QA' : 'Manual QA' }))}
                value={filterMode}
                onChange={setFilterMode}
                searchable
                clearable
              />
              <Select
                placeholder="Filter by agent..."
                data={agents.map((a) => ({ value: a, label: a }))}
                value={filterAgent}
                onChange={setFilterAgent}
                searchable
                clearable
              />
            </Group>
            <div>
              <Text size="sm" fw={600} mb="xs">Score Range</Text>
              <Slider
                min={0}
                max={100}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' },
                ]}
              />
            </div>
          </Stack>
        </Card>

        {/* Results Table */}
        <Card shadow="sm" padding="lg" radius="lg" withBorder>
          <Stack gap="md">
            <Text fw={600}>
              Call Results ({filteredResults.length} of {results.length})
            </Text>
            <div style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Call</Table.Th>
                    <Table.Th>Agent</Table.Th>
                    <Table.Th align="center">AI Score</Table.Th>
                    <Table.Th align="center">Final Score</Table.Th>
                    <Table.Th align="center">Delta</Table.Th>
                    <Table.Th align="center">Override</Table.Th>
                    <Table.Th>Mode</Table.Th>
                    <Table.Th>Model</Table.Th>
                    <Table.Th>Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </div>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
