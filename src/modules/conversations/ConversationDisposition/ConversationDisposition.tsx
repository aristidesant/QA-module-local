import type { FC } from "react";
import {
  Paper,
  Group,
  Stack,
  Text,
  Badge,
  Skeleton,
  Anchor,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useCallDispositionByConversationId } from "~/queries/callDispositionQueries";
import type { CallDispositionModel } from "~/models/CallDispositionModel";
import styles from "./ConversationDisposition.module.css";

type ConversationDispositionProps = {
  conversationId: string | number;
  compact?: boolean;
};

const ConversationDisposition: FC<ConversationDispositionProps> = ({
  conversationId,
  compact,
}) => {
  const { data, isLoading, isError, error, refetch } =
    useCallDispositionByConversationId(conversationId);

  if (isLoading) {
    return (
      <Paper p={compact ? "sm" : "md"} className={styles.paper}>
        <Group className={styles.header} justify="space-between">
          <Text size="sm" fw={600} className={styles.darkText}>
            Disposition
          </Text>
          <IconInfoCircle size={16} className={styles.lightText} />
        </Group>
        <Skeleton height={12} mt={6} radius="sm" />
        <Skeleton height={12} mt={6} width="60%" radius="sm" />
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper p={compact ? "sm" : "md"} className={styles.paper}>
        <Group className={styles.header} justify="space-between">
          <Text size="sm" fw={600} className={styles.darkText}>
            Disposition
          </Text>
          <IconInfoCircle size={16} className={styles.lightText} />
        </Group>
        <Stack gap={4}>
          <Text size="sm" className={styles.darkText}>
            Could not load disposition
          </Text>
          <Text size="xs" className={styles.lightText}>
            {error instanceof Error ? error.message : "Unknown error"}
          </Text>
          {refetch && (
            <Anchor component="button" size="xs" onClick={() => refetch()}>
              Retry
            </Anchor>
          )}
        </Stack>
      </Paper>
    );
  }

  const disposition = data as CallDispositionModel | undefined;
  const name = disposition?.dispositionName || "No disposition";
  const notes = disposition?.notes;
  const updatedAt = disposition?.updatedAt || disposition?.createdAt;

  return (
    <Paper p={compact ? "sm" : "md"} className={styles.paper}>
      <Group className={styles.header} justify="space-between">
        <Text size="sm" fw={600} className={styles.darkText}>
          Disposition
        </Text>
        {updatedAt ? (
          <Badge variant="light" radius="sm" size="sm" className={styles.badge}>
            Updated {new Date(updatedAt).toLocaleString()}
          </Badge>
        ) : (
          <Badge variant="light" radius="sm" size="sm" className={styles.badge}>
            Not updated
          </Badge>
        )}
      </Group>

      <Stack gap="xs">
        <Text fw={700} className={styles.darkText}>
          {name}
        </Text>
        {notes ? (
          <Text size="sm" className={styles.lightText}>
            {notes}
          </Text>
        ) : (
          <Text size="sm" className={styles.lightText}>
            No notes provided
          </Text>
        )}
      </Stack>
    </Paper>
  );
};

export default ConversationDisposition;
