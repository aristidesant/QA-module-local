import {
  Group,
  Paper,
  Text,
  Avatar,
  Stack,
  ActionIcon,
  Tooltip,
  Divider,
  CopyButton,
  SimpleGrid,
} from "@mantine/core";
import {
  IconPhoneCall,
  IconUser,
  IconInfoCircle,
  IconCalendar,
  IconCopy,
  IconCheck,
  IconCoin,
  IconAlertCircle,
} from "@tabler/icons-react";
import type { ConversationsModel } from "~/models/ConversationsModels";
import styles from "./ConversationOverview.module.css";
import ConversationPlayer from "../ConversationPlayer";
import ConversationDisposition from "../ConversationDisposition";
import RightSection from "~/components/RightSection";

interface ConversationOverviewProps {
  conversation: ConversationsModel;
  status?: string; // Optional override for status
  duration?: number; // Optional override for duration
}

// get value or empty
const getValueOrEmpty = (value: string | undefined | unknown) => {
  return value || "";
};

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

  const formatDateShort = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
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

  const contactName = conversation?.externalPhoneNumber
    ? "Demo"
    : `${getValueOrEmpty(contact?.firstName)} ${getValueOrEmpty(
        contact?.lastName
      )}`;
  const contactPhone = String(
    contact?.phoneNumber ||
      conversation?.contactPhoneNumber ||
      conversation?.externalPhoneNumber ||
      "No phone number"
  );
  const agentName = agent?.name ? String(agent.name) : "Unassigned";
  const campaignName = campaign?.name ? String(campaign.name) : "N/A";

  // Extract metadata values
  const metadata = transcriptContent?.metadata;
  const cost = metadata?.cost;
  const terminationReason = metadata?.termination_reason;

  const formatTermination = (reason?: string | null) => {
    if (!reason) return "Unknown";
    const r = reason.toLowerCase();
    if (r.includes("terminated_by") || r.includes("terminated"))
      return "Terminated";
    if (r.includes("client") && r.includes("disconnect"))
      return "Client Disconnected";
    if (r.includes("hangup")) return "Hangup";
    if (r.includes("timeout")) return "Timeout";
    if (r.includes("error")) return "Error";
    // Fallback: capitalize first letter
    return reason.charAt(0).toUpperCase() + reason.slice(1);
  };

  // Helper function to safely render text content

  const getStatusClass = (status: string) => {
    if (status.includes("done")) return "completed";
    if (status.includes("progress")) return "in_progress";
    if (status.includes("failed") || status.includes("error")) return "failed";
    return "pending";
  };

  const statusClass = getStatusClass(displayStatus);
  const transcriptSummary =
    transcriptContent?.analysis?.transcript_summary || "";

  return (
    <Stack gap="md" className={styles.container}>
      {/* Contact & Quick Overview */}
      <Paper p="md" className={`${styles.paper} ${styles[statusClass]}`}>
        <RightSection
          title="Conversation Overview"
          description="Define the conversation key details."
        >
          <Group gap="md" wrap="wrap" className={styles.topRow}>
            <Avatar
              radius="xl"
              size={42}
              className={styles.avatar}
              color="blue"
            >
              <IconUser size={20} />
            </Avatar>
            <Stack gap={2} className={styles.identity}>
              <Text
                fw={800}
                size="sm"
                className={`${styles.darkText} ${styles.truncate}`}
                title={contactName}
              >
                {contactName}
              </Text>
              <Group gap={6} align="center" wrap="nowrap">
                <IconPhoneCall size={14} className={styles.lightText} />
                <Text
                  size="sm"
                  className={`${styles.phone} ${styles.truncate}`}
                  title={contactPhone}
                >
                  {contactPhone}
                </Text>
                <CopyButton value={String(contactPhone)} timeout={1200}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Copied" : "Copy"}>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        aria-label="Copy phone number"
                        onClick={copy}
                        className={styles.copyBtn}
                      >
                        {copied ? (
                          <IconCheck size={14} />
                        ) : (
                          <IconCopy size={14} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </Stack>
            <div className={styles.metaRight} />
          </Group>

          <Divider my="sm" />

          <SimpleGrid
            cols={{ base: 1 }}
            spacing="md"
            className={styles.statGrid}
          >
            <Group gap={8} className={styles.statItem} wrap="nowrap">
              <IconCalendar size={18} className={styles.icon} />
              <div>
                <Text size="xs" className={styles.statLabel}>
                  Conversation date
                </Text>
                <Group align="center" gap={"xs"}>
                  <Text
                    size="sm"
                    fw={700}
                    className={`${styles.darkText} ${styles.truncate}`}
                    title={formatDate(startDate)}
                  >
                    {formatDateShort(startDate)}
                  </Text>
                  <Text
                    size="xs"
                    c="dimmed"
                    className={`${styles.darkText} ${styles.truncate}`}
                  >
                    ({formatDuration(displayDuration as number)})
                  </Text>
                </Group>
              </div>
            </Group>

            <Group gap={8} className={styles.statItem} wrap="nowrap">
              <IconUser size={18} className={styles.icon} />
              <div>
                <Text size="xs" className={styles.statLabel}>
                  Agent
                </Text>
                <Text
                  size="sm"
                  fw={700}
                  className={`${styles.darkText} ${styles.truncate}`}
                  title={agentName}
                >
                  {agentName}
                </Text>
              </div>
            </Group>
            <Group gap={8} className={styles.statItem} wrap="nowrap">
              <IconInfoCircle size={18} className={styles.icon} />
              <div className={styles.statContent}>
                <Text size="xs" className={styles.statLabel}>
                  Campaign
                </Text>
                <Text
                  size="sm"
                  fw={700}
                  className={styles.darkText}
                  title={campaignName}
                >
                  {campaignName}
                </Text>
              </div>
            </Group>

            {/* Cost */}
            {typeof cost === "number" && (
              <Group gap={8} className={styles.statItem} wrap="nowrap">
                <IconCoin size={18} className={styles.icon} />
                <div>
                  <Text size="xs" className={styles.statLabel}>
                    Cost
                  </Text>
                  <Text size="sm" fw={700} className={styles.darkText}>
                    {`$${cost.toFixed(4)}`}
                  </Text>
                </div>
              </Group>
            )}

            {/* Termination Reason */}
            {terminationReason !== undefined && (
              <Group gap={8} className={styles.statItem} wrap="nowrap">
                <IconAlertCircle size={18} className={styles.icon} />
                <div>
                  <Text size="xs" className={styles.statLabel}>
                    Termination Reason
                  </Text>
                  <Text
                    size="sm"
                    fw={700}
                    className={styles.darkText}
                    title={terminationReason}
                  >
                    {formatTermination(terminationReason)}
                  </Text>
                </div>
              </Group>
            )}
          </SimpleGrid>
        </RightSection>
      </Paper>
      <ConversationDisposition
        key={conversation?.id}
        conversationId={String(conversation?.id)}
      />
      {/* Conversation Summary */}
      {transcriptSummary && (
        <Paper p="md" className={styles.paper}>
          <RightSection
            title="Conversation Summary"
            description={
              <Text size="xs" c="dimmed">
                Auto-generated from the call transcript
              </Text>
            }
          >
            <Text size="sm" className={styles.darkText}>
              {transcriptSummary}
            </Text>
          </RightSection>
        </Paper>
      )}

      <ConversationPlayer
        voiceFile={conversation?.voiceFile}
        title="Recording"
        description="Listen to the call recording"
      />
    </Stack>
  );
}

export default ConversationOverview;
