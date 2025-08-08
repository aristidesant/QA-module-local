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
import RightSection from "~/components/RightSection";

type ConversationDispositionProps = {
  conversationId: string | number;
  compact?: boolean;
};

const ConversationDisposition: FC<ConversationDispositionProps> = ({
  conversationId,
  compact,
}) => {
  const { data, isLoading, isError, refetch } =
    useCallDispositionByConversationId(conversationId);

  if (isLoading) {
    return (
      <Paper p={compact ? "sm" : "md"} className={styles.paper}>
        <RightSection
          title="Disposition"
          description={
            <Text size="xs" c="dimmed">
              Fetching latest status…
            </Text>
          }
        >
          <Skeleton height={12} mt={6} radius="sm" />
          <Skeleton height={12} mt={6} width="60%" radius="sm" />
        </RightSection>
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper p={compact ? "sm" : "md"} className={styles.paper}>
        <RightSection
          title="Disposition"
          description={
            <Group gap="xs" align="center">
              <IconInfoCircle size={14} className={styles.lightText} />
              <Text size="xs" c="dimmed">
                Trouble loading disposition
              </Text>
            </Group>
          }
        >
          <Stack gap={4}>
            <Text size="sm" className={styles.darkText}>
              We couldn’t display the disposition right now.
            </Text>
            <Text size="xs" className={styles.lightText}>
              Please try again in a moment.
            </Text>
            {refetch && (
              <Anchor component="button" size="xs" onClick={() => refetch()}>
                Try again
              </Anchor>
            )}
          </Stack>
        </RightSection>
      </Paper>
    );
  }

  const disposition = data as CallDispositionModel | undefined;
  const name = disposition?.dispositionName || "No disposition";
  const notes = disposition?.notes;
  const updatedAt = disposition?.updatedAt || disposition?.createdAt;

  return (
    <Paper p={compact ? "sm" : "md"} className={styles.paper}>
      <RightSection
        title="Disposition"
        description={
          updatedAt ? (
            <Badge
              variant="light"
              radius="sm"
              size="sm"
              className={styles.badge}
            >
              Updated {new Date(updatedAt).toLocaleString()}
            </Badge>
          ) : (
            <Badge
              variant="light"
              radius="sm"
              size="sm"
              className={styles.badge}
            >
              Not updated
            </Badge>
          )
        }
      >
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
      </RightSection>
    </Paper>
  );
};

export default ConversationDisposition;
