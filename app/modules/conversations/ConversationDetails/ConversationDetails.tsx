import { Box, Text, Group, Stack, Badge, Divider, Paper, Title, Avatar, Tabs, Center, Loader } from '@mantine/core';
import { IconPhoneCall, IconUser, IconClock, IconCalendar, IconInfoCircle, IconAnalyze, IconFileText, IconReportAnalytics } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import type { ConversationsModel, TranscriptContent } from '~/models/ConversationsModels';
import type AgentListObject from '~/models/AgentListObject';
import type { Campaign } from '~/models/CampaignsModel';
import type { Contact } from '~/models/ContactModel';
import { TranscriptViewer } from '~/modules/conversations/TranscriptViewer';
import { AnalysisPanel } from '~/modules/conversations/AnalysisPanel';
import { MetadataPanel } from '~/modules/conversations/MetadataPanel';
import styles from './ConversationDetails.module.css';

// Components are now imported from their respective modules

// Define a separate props interface that doesn't extend ConversationsModel
export interface ConversationDetailsProps {
  id?: number | string;
  identifier?: string;
  agentId?: string;
  campaignId?: number;
  contactId?: number | null;
  status?: string;
  startDate?: string;
  endDate?: string | null;
  userId?: number;
  clientId?: number;
  transcriptContent?: TranscriptContent | null;
  transcriptUrl?: string | null;
  transcriptVoiceUrl?: string | null;
  voiceFileId?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  agent?: AgentListObject | null;
  campaign?: Campaign | null;
  contact?: Contact | null;
}

export function ConversationDetails({
  id,
  identifier,
  agentId,
  campaignId,
  contactId,
  status,
  startDate,
  endDate,
  userId,
  clientId,
  transcriptContent,
  transcriptUrl,
  transcriptVoiceUrl,
  voiceFileId,
  createdAt,
  updatedAt,
  deletedAt,
  agent,
  campaign,
  contact,
}: ConversationDetailsProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const duration = useMemo(() => {
    if (transcriptContent?.metadata?.call_duration_secs) {
      return transcriptContent.metadata.call_duration_secs;
    }
    return undefined;
  }, [transcriptContent]);

  const statusDisplay = useMemo(() => {
    if (!status) return 'unknown';
    return status.toLowerCase();
  }, [status]);

  const contactName = contact?.name || 'Unknown Contact';
  const contactPhone = contact?.phoneNumber || 'No phone number';
  const agentName = agent?.name || 'Unassigned';
  const campaignName = campaign?.name || 'N/A';

  return (
    <Box p="md" className={styles.container}>
      <Group justify="space-between" mb="lg">
        <Title order={3}>
          {contactName}
        </Title>
        <Badge 
          color={statusDisplay === 'completed' ? 'green' : statusDisplay === 'in_progress' ? 'blue' : 'gray'} 
          variant="light"
        >
          {statusDisplay}
        </Badge>
      </Group>

      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconInfoCircle size={16} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="transcript" leftSection={<IconFileText size={16} />}>Transcript</Tabs.Tab>
          <Tabs.Tab value="analysis" leftSection={<IconAnalyze size={16} />}>Analysis</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Stack gap="md">
            {/* Contact & Agent Info */}
            <Paper p="md" withBorder className={styles.paper}>
              <Group justify="space-between" mb="sm">
                <Text size="sm" fw={500}>Contact Information</Text>
                <IconInfoCircle size={16} />
              </Group>
              
              <Group gap="sm" mb="md">
                <Avatar color="blue" radius="xl">
                  <IconUser size={16} />
                </Avatar>
                <div>
                  <Text fw={500}>{contactName}</Text>
                  <Group gap={4} mt={2}>
                    <IconPhoneCall size={14} />
                    <Text size="sm" c="dimmed">{contactPhone}</Text>
                  </Group>
                </div>
              </Group>

              <Divider my="sm" />

              <Group justify="space-between" mt="md">
                <Stack gap={4}>
                  <Text size="xs" c="dimmed">Agent</Text>
                  <Group gap="xs">
                    <Avatar size="sm" radius="xl" />
                    <Text size="sm">{agentName}</Text>
                  </Group>
                </Stack>

                <Stack gap={4}>
                  <Text size="xs" c="dimmed">Campaign</Text>
                  <Text size="sm">{campaignName}</Text>
                </Stack>

                <Stack gap={4}>
                  <Text size="xs" c="dimmed">Duration</Text>
                  <Text size="sm">{formatDuration(duration)}</Text>
                </Stack>
              </Group>
            </Paper>

            {/* Timeline */}
            <Paper p="md" withBorder className={styles.paper}>
              <Group justify="space-between" mb="md">
                <Text size="sm" fw={500}>Timeline</Text>
                <IconClock size={16} />
              </Group>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm">Created</Text>
                  <Text size="sm">{formatDate(createdAt)}</Text>
                </Group>
                
                <Group justify="space-between">
                  <Text size="sm">Started</Text>
                  <Text size="sm">{formatDate(startDate)}</Text>
                </Group>
                
                {endDate && (
                  <Group justify="space-between">
                    <Text size="sm">Ended</Text>
                    <Text size="sm">{formatDate(endDate)}</Text>
                  </Group>
                )}
                
                {updatedAt && (
                  <Group justify="space-between">
                    <Text size="sm">Last Updated</Text>
                    <Text size="sm">{formatDate(updatedAt)}</Text>
                  </Group>
                )}
              </Stack>
            </Paper>

            {/* Summary */}
            {transcriptContent?.analysis?.transcript_summary && (
              <Paper p="md" withBorder className={styles.paper}>
                <Group justify="space-between" mb="md">
                  <Text size="sm" fw={500}>Summary</Text>
                  <IconReportAnalytics size={16} />
                </Group>
                <Text size="sm">{transcriptContent.analysis.transcript_summary}</Text>
              </Paper>
            )}

            {/* Media Links */}
            {(transcriptUrl || transcriptVoiceUrl) && (
              <Paper p="md" withBorder className={styles.paper}>
                <Text size="sm" fw={500} mb="md">Media</Text>
                <Stack gap="xs">
                  {transcriptUrl && (
                    <Text component="a" href={transcriptUrl} target="_blank" rel="noopener noreferrer" size="sm" c="blue">
                      View Transcript File
                    </Text>
                  )}
                  {transcriptVoiceUrl && (
                    <Text component="a" href={transcriptVoiceUrl} target="_blank" rel="noopener noreferrer" size="sm" c="blue">
                      Listen to Recording
                    </Text>
                  )}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="transcript" pt="md">
          {transcriptContent?.transcript ? (
            <TranscriptViewer transcript={transcriptContent.transcript} />
          ) : (
            <Paper p="md" withBorder>
              <Text>No transcript available</Text>
            </Paper>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="analysis" pt="md">
          <Stack gap="md">
            {transcriptContent?.analysis ? (
              <AnalysisPanel analysis={transcriptContent.analysis} />
            ) : (
              <Paper p="md" withBorder>
                <Text>No analysis available</Text>
              </Paper>
            )}
            
            {transcriptContent?.metadata && (
              <MetadataPanel metadata={transcriptContent.metadata} />
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

export default ConversationDetails;