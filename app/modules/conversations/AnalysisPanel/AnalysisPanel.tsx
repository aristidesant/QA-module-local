import { Accordion, Box, Group, Paper, Stack, Text } from '@mantine/core';
import { IconChartBar, IconCheck, IconX } from '@tabler/icons-react';
import type { Analysis } from '~/models/ConversationsModels';
import styles from './AnalysisPanel.module.css';

interface AnalysisPanelProps {
  analysis: Analysis;
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const { call_successful, transcript_summary, data_collection_results, evaluation_criteria_results } = analysis;
  
  return (
    <Stack gap="md">
      <Paper p="md" withBorder className={styles.paper}>
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={500}>Call Status</Text>
          <Group gap="xs">
            {call_successful === 'true' ? (
              <>
                <IconCheck size={16} color="var(--mantine-color-green-6)" />
                <Text size="sm" c="green">Successful</Text>
              </>
            ) : (
              <>
                <IconX size={16} color="var(--mantine-color-red-6)" />
                <Text size="sm" c="red">Unsuccessful</Text>
              </>
            )}
          </Group>
        </Group>
        
        {transcript_summary && (
          <Box mt="md">
            <Text size="xs" c="dimmed" mb="xs">Summary</Text>
            <Text size="sm">{transcript_summary}</Text>
          </Box>
        )}
      </Paper>
      
      {Object.keys(data_collection_results || {}).length > 0 && (
        <Paper p="md" withBorder className={styles.paper}>
          <Text size="sm" fw={500} mb="md">Data Collection Results</Text>
          <Accordion variant="separated">
            {Object.entries(data_collection_results).map(([key, value]) => (
              <Accordion.Item key={key} value={key}>
                <Accordion.Control>
                  <Text size="sm" transform="capitalize">
                    {key.replace(/_/g, ' ')}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <DisplayValue value={value} />
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Paper>
      )}
      
      {Object.keys(evaluation_criteria_results || {}).length > 0 && (
        <Paper p="md" withBorder className={styles.paper}>
          <Text size="sm" fw={500} mb="md">Evaluation Criteria Results</Text>
          <Accordion variant="separated">
            {Object.entries(evaluation_criteria_results).map(([key, value]) => (
              <Accordion.Item key={key} value={key}>
                <Accordion.Control>
                  <Text size="sm" transform="capitalize">
                    {key.replace(/_/g, ' ')}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <DisplayValue value={value} />
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Paper>
      )}
    </Stack>
  );
}

function DisplayValue({ value }: { value: unknown }): JSX.Element {
  if (value === null || value === undefined) {
    return <Text size="sm" c="dimmed">No data</Text>;
  }
  
  if (typeof value === 'boolean') {
    return (
      <Group gap="xs">
        {value ? (
          <>
            <IconCheck size={16} color="var(--mantine-color-green-6)" />
            <Text size="sm">Yes</Text>
          </>
        ) : (
          <>
            <IconX size={16} color="var(--mantine-color-red-6)" />
            <Text size="sm">No</Text>
          </>
        )}
      </Group>
    );
  }
  
  if (typeof value === 'object') {
    return (
      <Stack gap="xs">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <Group key={k} position="apart">
            <Text size="sm" fw={500} transform="capitalize">{k.replace(/_/g, ' ')}:</Text>
            <DisplayValue value={v} />
          </Group>
        ))}
      </Stack>
    );
  }
  
  return <Text size="sm">{String(value)}</Text>;
}

export default AnalysisPanel;
