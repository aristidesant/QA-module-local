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

  const normalizeStatus = (raw?: string) => {
    const v = (raw || "").toString().trim().toUpperCase();
    if (v.includes("POS")) return "POSITIVE" as const;
    if (v.includes("NEG")) return "NEGATIVE" as const;
    if (v.includes("NEU")) return "NEUTRAL" as const;
    return "NEUTRAL" as const;
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
      <Paper p={compact ? "xs" : "sm"} className={styles.paper}>
        <RightSection
          title="Disposition"
          description={
            <Text size="xs" c="dimmed">
              Fetching latest status…
            </Text>
          }
        >
          <Stack gap={6} className={styles.skeletonStack}>
            <Skeleton height={10} mt={2} radius="sm" />
            <Skeleton height={10} mt={2} width="70%" radius="sm" />
          </Stack>
        </RightSection>
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper p={compact ? "xs" : "sm"} className={styles.paper}>
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
          <Stack gap={6} className={styles.errorStack}>
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
      p={compact ? "xs" : "sm"}
      className={`${styles.paper} ${compact ? styles.compact : ""}`}
      style={{ borderColor: statusView.borderColorVar }}
    >
      <RightSection
        title="Disposition"
        description={
          updatedAt ? (
            <Badge
              variant="light"
              radius="sm"
              size="xs"
              className={styles.badge}
            >
              Updated {new Date(updatedAt).toLocaleString()}
            </Badge>
          ) : (
            <Badge
              variant="light"
              radius="sm"
              size="xs"
              className={styles.badge}
            >
              Not updated
            </Badge>
          )
        }
      >
        <Stack gap={6} className={styles.contentStack}>
          <Group
            className={styles.headerRow}
            align="center"
            gap={8}
            wrap="nowrap"
          >
            <Group
              gap={8}
              align="center"
              className={styles.titleGroup}
              wrap="nowrap"
            >
              <Badge
                color={statusView.color}
                variant="filled"
                radius="sm"
                className={styles.statusBadge}
              >
                {statusView.label}
              </Badge>
            </Group>

            <Group gap={6} className={styles.rightFlags}>
              {isFinal && (
                <Badge size="xs" variant="outline" color="gray" radius="sm">
                  Final
                </Badge>
              )}
              {isVoiceMail && (
                <Badge size="xs" variant="outline" color="gray" radius="sm">
                  Voicemail
                </Badge>
              )}
            </Group>
          </Group>
          <Text fw={700} className={styles.name} title={name}>
            {name}
          </Text>

          {description && (
            <Text size="xs" c="dimmed" className={styles.description}>
              {description}
            </Text>
          )}

          {(requiresReschedule || isInvalidatesNumber) && <Divider my={6} />}

          {requiresReschedule && (
            <Group gap="xs" align="flex-start">
              <ThemeIcon size="sm" radius="sm" variant="light" color="blue">
                <IconClock size={16} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text size="xs" fw={600}>
                  Follow-up required
                </Text>
                <Text size="xs" c="dimmed">
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
                <Text size="xs" fw={600}>
                  Number invalidated
                </Text>
                <Text size="xs" c="dimmed">
                  This phone number has been marked invalid and will no longer
                  be dialed.
                </Text>
              </Stack>
            </Group>
          )}

          <Divider my={6} />

          <div className={styles.notes}>
            {notes ? (
              <Text size="xs" className={styles.lightText} title={notes}>
                {notes}
              </Text>
            ) : (
              <Text size="xs" className={styles.lightText}>
                No notes provided
              </Text>
            )}
          </div>
        </Stack>
      </RightSection>
    </Paper>
  );
};

export default ConversationDisposition;
