import { Box, Group, Paper, Stack, Text, Progress, Badge } from "@mantine/core";
import {
  IconClock,
  IconCoin,
  IconThumbUp,
  IconThumbDown,
  IconInfoCircle,
} from "@tabler/icons-react";
import type { Metadata } from "~/models/ConversationsModels";
import styles from "./MetadataPanel.module.css";

interface MetadataPanelProps {
  metadata: Metadata;
}

export function MetadataPanel({ metadata }: MetadataPanelProps) {
  const {
    cost,
    feedback,
    call_duration_secs,
    termination_reason,
    start_time_unix_secs,
  } = metadata;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
  };

  const formatDate = (unixSeconds: number) => {
    try {
      const date = new Date(unixSeconds * 1000);
      return date.toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  // Helper function to render a metadata item
  const renderMetadataItem = (
    icon: React.ReactNode,
    label: string,
    value: React.ReactNode,
    isLast = false
  ) => (
    <Box className={`${styles.metadataItem} ${isLast ? styles.lastItem : ""}`}>
      <Group justify="space-between">
        <Group gap="xs">
          {icon}
          <Text size="sm" className={styles.darkText} fw={500}>
            {label}
          </Text>
        </Group>
        {typeof value === "string" || typeof value === "number" ? (
          <Text size="sm" className={styles.darkText}>
            {value}
          </Text>
        ) : (
          value
        )}
      </Group>
    </Box>
  );

  return (
    <Paper p="md" className={styles.paper}>
      <Text
        size="sm"
        fw={600}
        className={`${styles.darkText} ${styles.header}`}
      >
        Call Metadata
      </Text>

      <Stack gap="xs">
        {/* Duration */}
        {renderMetadataItem(
          <IconClock size={16} />,
          "Duration",
          formatDuration(call_duration_secs)
        )}

        {/* Start Time */}
        {start_time_unix_secs &&
          renderMetadataItem(
            <IconClock size={16} />,
            "Start Time",
            formatDate(start_time_unix_secs)
          )}

        {/* Cost */}
        {renderMetadataItem(<IconCoin size={16} />, "Cost", formatCost(cost))}

        {/* Termination Reason */}
        {renderMetadataItem(
          <IconInfoCircle size={16} />,
          "Termination Reason",
          <Badge color="gray" variant="light">
            {termination_reason || "Unknown"}
          </Badge>
        )}

        {/* Feedback */}
        {feedback && (
          <Box mt="sm">
            <Text size="sm" fw={600} className={styles.darkText} mb="xs">
              Feedback
            </Text>
            <Box pl="md">
              <Stack gap="xs">
                {renderMetadataItem(
                  <IconThumbUp size={16} />,
                  "Likes",
                  feedback.likes.toString(),
                  !feedback.overall_score
                )}

                {renderMetadataItem(
                  <IconThumbDown size={16} />,
                  "Dislikes",
                  feedback.dislikes.toString(),
                  !feedback.overall_score
                )}

                {feedback.overall_score !== null && (
                  <Box>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" className={styles.darkText} fw={500}>
                        Overall Score
                      </Text>
                      <Text size="sm" className={styles.darkText} fw={600}>
                        {(feedback.overall_score * 100).toFixed(1)}%
                      </Text>
                    </Group>
                    <Progress
                      value={feedback.overall_score * 100}
                      size="sm"
                      color="blue"
                      style={{ height: 6 }}
                      classNames={{ root: styles.progressRoot }}
                    />
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

export default MetadataPanel;
