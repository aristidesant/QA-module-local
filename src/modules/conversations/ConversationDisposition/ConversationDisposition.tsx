import type { FC } from "react";
import {
  Paper,
  Group,
  Stack,
  Text,
  Badge,
  Skeleton,
  Anchor,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import { IconInfoCircle, IconClock, IconPhoneOff } from "@tabler/icons-react";
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

  // Helpers
  const normalizeStatus = (raw?: string) => {
    const v = (raw || "").toString().trim().toUpperCase();
    if (v.includes("POS")) return "POSITIVE" as const;
    if (v.includes("NEG")) return "NEGATIVE" as const;
    if (v.includes("NEU")) return "NEUTRAL" as const;
    return "NEUTRAL" as const; // default safe
  };

  const getStatusPresentation = (
    status: ReturnType<typeof normalizeStatus>
  ) => {
    switch (status) {
      case "POSITIVE":
        return {
          color: "green" as const,
          borderColorVar: "var(--mantine-color-green-5)",
          label: "Positive",
        };
      case "NEGATIVE":
        return {
          color: "red" as const,
          borderColorVar: "var(--mantine-color-red-5)",
          label: "Negative",
        };
      case "NEUTRAL":
      default:
        return {
          color: "gray" as const,
          borderColorVar: "var(--mantine-color-gray-4)",
          label: "Neutral",
        };
    }
  };

  const formatDuration = (totalSeconds?: number) => {
    if (!totalSeconds || totalSeconds <= 0) return "as soon as possible";
    const minutesTotal = Math.floor(totalSeconds / 60);
    const days = Math.floor(minutesTotal / (60 * 24));
    const hours = Math.floor((minutesTotal % (60 * 24)) / 60);
    const minutes = minutesTotal % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
    if (hours) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    if (minutes)
      parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
    if (!parts.length) return "less than a minute";
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
    return `${parts[0]}, ${parts[1]} and ${parts[2]}`;
  };

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
  const description = disposition?.dispositionDescription;
  const notes = disposition?.notes;
  const status = normalizeStatus(
    disposition?.callStatus || disposition?.dispositionName
  );
  const statusView = getStatusPresentation(status);
  const updatedAt = disposition?.updatedAt || disposition?.createdAt;
  const requiresReschedule = Boolean(disposition?.requiresReschedule);
  const rescheduleTimeSec = disposition?.rescheduleTime;
  const isInvalidatesNumber = Boolean(disposition?.isInvalidatesNumber);
  const isFinal = Boolean(disposition?.isFinal);
  const isVoiceMail = Boolean(disposition?.isVoiceMail);

  return (
    <Paper
      p={compact ? "sm" : "md"}
      className={styles.paper}
      style={{ borderColor: statusView.borderColorVar }}
    >
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
        <Stack gap={compact ? 6 : "sm"}>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap="xs" align="center">
              <Badge color={statusView.color} variant="filled" radius="sm">
                {statusView.label}
              </Badge>
              <Text fw={700} className={styles.darkText}>
                {name}
              </Text>
            </Group>
            <Group gap={6} visibleFrom="sm">
              {isFinal && (
                <Badge size="sm" variant="outline" color="gray" radius="sm">
                  Final
                </Badge>
              )}
              {isVoiceMail && (
                <Badge size="sm" variant="outline" color="gray" radius="sm">
                  Voicemail
                </Badge>
              )}
            </Group>
          </Group>

          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}

          {(requiresReschedule || isInvalidatesNumber) && (
            <Divider my={compact ? 6 : 8} />
          )}

          {requiresReschedule && (
            <Group gap="xs" align="flex-start">
              <ThemeIcon size="sm" radius="sm" variant="light" color="blue">
                <IconClock size={16} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text size="sm" fw={600}>
                  Follow-up required
                </Text>
                <Text size="sm" c="dimmed">
                  Call the contact back in {formatDuration(rescheduleTimeSec)}.
                </Text>
              </Stack>
            </Group>
          )}

          {isInvalidatesNumber && (
            <Group gap="xs" align="flex-start">
              <ThemeIcon size="sm" radius="sm" variant="light" color="red">
                <IconPhoneOff size={16} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text size="sm" fw={600}>
                  Number invalidated
                </Text>
                <Text size="sm" c="dimmed">
                  This phone number has been marked invalid and will no longer
                  be dialed.
                </Text>
              </Stack>
            </Group>
          )}

          <Divider my={compact ? 6 : 8} />

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
