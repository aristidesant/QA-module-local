import {
  Avatar,
  Box,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { IconRobot, IconUser } from "@tabler/icons-react";
import type { TranscriptEntry } from "~/models/ConversationsModels";
import styles from "./TranscriptViewer.module.css";

interface TranscriptViewerProps {
  transcript: TranscriptEntry[];
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  if (!transcript || transcript.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text>No transcript entries available</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {transcript.map((entry, index) => {
        const isAgent = entry.role.toLowerCase() === "agent";
        const isUser =
          entry.role.toLowerCase() === "user" ||
          entry.role.toLowerCase() === "human";

        return (
          <Box
            key={`transcript-${index}`}
            className={`${styles.messageContainer} ${
              isAgent
                ? styles.agentMessage
                : isUser
                ? styles.userMessage
                : styles.systemMessage
            }`}
          >
            <Group align="flex-start" gap="sm">
              <Avatar
                color={isAgent ? "blue" : isUser ? "green" : "gray"}
                radius="xl"
              >
                {isAgent ? (
                  <IconRobot size={20} />
                ) : isUser ? (
                  <IconUser size={20} />
                ) : null}
              </Avatar>

              <Box className={styles.messageContent}>
                <Group justify="space-between" mb={4}>
                  <Text size="sm" fw={500}>
                    {isAgent ? "Agent" : isUser ? "User" : entry.role}
                  </Text>
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
                  <Text size="xs" c="dimmed" mt={4}>
                    (Interrupted)
                  </Text>
                )}
              </Box>
            </Group>
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
