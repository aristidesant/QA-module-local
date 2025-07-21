import { Group, Paper, Text, Avatar, Stack, Badge } from "@mantine/core";
import {
  IconPhoneCall,
  IconUser,
  IconInfoCircle,
  IconClock,
  IconCalendar,
} from "@tabler/icons-react";
import type { ConversationsModel } from "~/models/ConversationsModels";
import styles from "./ConversationOverview.module.css";
import ConversationPlayer from "../ConversationPlayer";

interface ConversationOverviewProps {
  conversation: ConversationsModel;
  status?: string; // Optional override for status
  duration?: number; // Optional override for duration
}

export function ConversationOverview({
  conversation,
  status: statusOverride,
  duration: durationOverride,
}: ConversationOverviewProps) {
  const {
    contact,
    agent,
    campaign,
    status = "unknown",
    startDate,
    endDate,
    transcriptContent,
  } = conversation;

  // Use overrides if provided, otherwise calculate from conversation data
  const displayStatus = statusOverride || status;
  const displayDuration =
    durationOverride || transcriptContent?.metadata?.call_duration_secs || 0;
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const statusDisplay = displayStatus.toLowerCase();
  const contactName = conversation?.externalPhoneNumber
    ? "Demo"
    : contact?.name
    ? String(contact.name)
    : "Unknown Contact";
  const contactPhone = contact?.phoneNumber
    ? String(contact.phoneNumber)
    : conversation?.externalPhoneNumber ?? "No phone number";
  const agentName = agent?.name ? String(agent.name) : "Unassigned";
  const campaignName = campaign?.name ? String(campaign.name) : "N/A";

  // Helper function to safely render text content
  const renderText = (content: React.ReactNode) => (content ? content : null);

  const getStatusClass = (status: string) => {
    if (status.includes("done")) return "completed";
    if (status.includes("progress")) return "in_progress";
    if (status.includes("failed") || status.includes("error")) return "failed";
    return "pending";
  };

  const statusClass = getStatusClass(displayStatus);

  return (
    <Stack gap="md">
      {/* Contact & Agent Info */}
      <Paper p="md" className={styles.paper}>
        <Group className={styles.header} justify="space-between">
          <Text size="sm" fw={600} className={styles.darkText}>
            Contact Information
          </Text>
          <IconInfoCircle size={16} className={styles.lightText} />
        </Group>

        <Group gap="sm" mb="md">
          <Avatar color="blue" radius="xl">
            <IconUser size={16} />
          </Avatar>
          <div>
            <Text fw={600} className={styles.darkText}>
              {contactName}
            </Text>
            <Group gap={4} mt={2}>
              <IconPhoneCall size={14} className={styles.lightText} />
              <Text size="sm" className={styles.lightText}>
                {contactPhone}
              </Text>
            </Group>
          </div>
        </Group>

        <Group gap="md" mt="xs">
          <Group gap={4}>
            <IconCalendar size={14} className={styles.lightText} />
            <Text size="xs" className={styles.lightText}>
              {formatDate(startDate)}
            </Text>
          </Group>
          <Group gap={4}>
            <IconClock size={14} className={styles.lightText} />
            <Text size="xs" className={styles.lightText}>
              {formatDuration(displayDuration as number)}
            </Text>
          </Group>
        </Group>
      </Paper>

      {/* Agent & Campaign Info */}
      <Paper p="md" className={styles.paper}>
        <Group className={styles.header} justify="space-between">
          <Text size="sm" fw={600} className={styles.darkText}>
            Agent & Campaign
          </Text>
          <Group gap="xs" align="center">
            <span className={`${styles.statusDot} ${styles[statusClass]}`} />
            <Badge
              variant="light"
              className={`${styles.statusBadge} ${styles[statusClass]}`}
              size="sm"
              radius="sm"
            >
              {displayStatus.replace(/_/g, " ")}
            </Badge>
          </Group>
        </Group>

        <Group gap="sm">
          <Avatar color="blue" radius="xl">
            <IconUser size={16} />
          </Avatar>
          <div>
            <Text fz="xs" fw={600} className={styles.darkText}>
              {agentName}
            </Text>
            <Text fz="xs" c="dimmed">
              {campaignName}
            </Text>
          </div>
        </Group>
      </Paper>
      <ConversationPlayer voiceFile={conversation?.voiceFile} />
    </Stack>
  );
}

export default ConversationOverview;
