import { Avatar, Box, Group, Paper, Stack, Text } from "@mantine/core";
import { IconRobot, IconUser } from "@tabler/icons-react";
import type { TranscriptEntry } from "~/models/ConversationsModels";
import styles from "./TranscriptViewer.module.css";

interface TranscriptViewerProps {
  transcript: TranscriptEntry[];
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  if (!transcript || transcript.length === 0) {
    return (
      <Paper
        p="md"
        withBorder
        radius="md"
        className={styles.transcriptContainer}
      >
        <Text>No transcript entries available</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="sm" className={styles.transcriptContainer}>
      {transcript.map((entry, index) => {
        const isAgent = entry.role.toLowerCase() === "agent";
        const isUser =
          entry.role.toLowerCase() === "user" ||
          entry.role.toLowerCase() === "human";
        const isSystem = !isAgent && !isUser;

        return (
          <Box
            key={`transcript-${index}`}
            className={
              `${styles.messageRow} ` +
              (isSystem
                ? styles.centerAligned
                : isAgent
                ? styles.rightAligned
                : styles.leftAligned)
            }
          >
            {isSystem ? (
              <Paper
                withBorder
                radius="xl"
                p="xs"
                className={styles.systemBanner}
              >
                <Text size="xs" c="dimmed">
                  {entry.message}
                  {entry.time_in_call_secs !== undefined && (
                    <> • {formatTime(entry.time_in_call_secs)}</>
                  )}
                </Text>
              </Paper>
            ) : (
              <Box className={styles.messageGroup}>
                {/* Bubble with embedded avatar and meta */}
                <Box
                  className={`${styles.messageBubble} ${
                    isAgent ? styles.agentBubble : styles.userBubble
                  }`}
                >
                  <Group justify="space-between" className={styles.meta}>
                    <Group gap={6} align="center">
                      <Avatar
                        size={18}
                        radius="xl"
                        color={isAgent ? "blue" : "green"}
                      >
                        {isAgent ? (
                          <IconRobot size={14} />
                        ) : (
                          <IconUser size={14} />
                        )}
                      </Avatar>
                      <Text size="xs" fw={600} c="dimmed">
                        {isAgent ? "Agent" : "User"}
                      </Text>
                    </Group>
                    {entry.time_in_call_secs !== undefined && (
                      <Text size="xs" c="dimmed">
                        {formatTime(entry.time_in_call_secs)}
                      </Text>
                    )}
                  </Group>

                  <Text size="sm" className={styles.message}>
                    {entry.message}
                  </Text>

                  {entry.interrupted && (
                    <Text size="xs" c="dimmed" className={styles.interrupted}>
                      Interrupted
                    </Text>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default TranscriptViewer;
