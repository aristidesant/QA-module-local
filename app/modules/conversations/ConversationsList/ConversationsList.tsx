import { useMemo } from "react";
import {
  Box,
  Table,
  Text,
  Badge,
  rem,
  type MantineStyleProp,
  Loader,
  Center,
  Stack,
} from "@mantine/core";
import { useGetConversations } from "~/queries/conversationsQueries";
import { useConversationStore } from "~/stores/useConversationStore";
import {
  format,
  parseISO,
  differenceInSeconds,
  intervalToDuration,
} from "date-fns";
import { IconPhoneCall, IconCheck, IconX, IconUser } from "@tabler/icons-react";
import { ConversationDetails } from "../ConversationDetails/ConversationDetails";
import type { ConversationsModel } from "~/models/ConversationsModels";
import styles from "./ConversationsList.module.css";
import SectionCard from "~/components/SectionCard";

// Define the styles as MantineStyleProp objects
const tableStyles: MantineStyleProp = {
  backgroundColor: "var(--mantine-color-white)",
  borderRadius: "var(--mantine-radius-md)",
  boxShadow: "var(--mantine-shadow-sm)",
  overflow: "hidden",
};

const headerStyles: MantineStyleProp = {
  backgroundColor: "var(--mantine-color-gray-0)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontWeight: 600,
  fontSize: "var(--mantine-font-size-xs)",
  color: "var(--mantine-color-gray-6)",
  padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
  height: rem(40),
};

const rowStyles = (isSelected: boolean): MantineStyleProp => ({
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  fontSize: "var(--mantine-font-size-sm)",
  "&:hover": {
    backgroundColor: "var(--mantine-color-gray-0)",
  },
  ...(isSelected && {
    backgroundColor: "var(--mantine-color-blue-0)",
    borderLeft: `${rem(2)} solid var(--mantine-color-blue-6)`,
  }),
  "& td": {
    padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
    height: rem(48),
    verticalAlign: "middle",
  },
});

const statusBadgeStyles: MantineStyleProp = {
  textTransform: "none",
  letterSpacing: "0.02em",
  fontSize: "var(--mantine-font-size-xs)",
  padding: "0 var(--mantine-spacing-xs)",
  height: rem(24),
  display: "inline-flex",
  alignItems: "center",
  gap: rem(4),
};

const phoneNumberStyles: MantineStyleProp = {
  display: "flex",
  alignItems: "center",
  gap: rem(8),
  fontWeight: 500,
  color: "var(--mantine-color-gray-8)",
};

const textStyles: MantineStyleProp = {
  fontSize: "var(--mantine-font-size-sm)",
  color: "var(--mantine-color-gray-7)",
};

const formatDuration = (seconds: number): string => {
  // Handle invalid or negative duration
  if (isNaN(seconds) || seconds < 0) {
    return "--";
  }

  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  const parts: string[] = [];

  if (duration.hours && duration.hours > 0) {
    parts.push(`${duration.hours}h`);
  }

  if (duration.minutes || parts.length > 0) {
    parts.push(`${duration.minutes || 0}m`);
  }

  parts.push(`${duration.seconds || 0}s`);

  return parts.join(" ");
};

const isValidDuration = (startDate: string, endDate: string): boolean => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return start <= end;
  } catch {
    return false;
  }
};

export function ConversationsList() {
  const { data: conversations, isLoading } = useGetConversations();
  const { selectedId, setSelection } = useConversationStore();

  const typedConversations = conversations as ConversationsModel[] | undefined;

  const rows = useMemo(() => {
    if (!typedConversations) return [];

    return typedConversations.map((conversation) => {
      const contactName = conversation.contact?.name || "Unknown";
      const contactPhone = conversation.contact?.phoneNumber || "N/A";
      const agentName = conversation.agent?.name || "N/A";
      const statusDisplay = conversation.status?.toLowerCase() || "unknown";
      const isActive =
        statusDisplay === "in_progress" || statusDisplay === "active";
      const isCompleted =
        statusDisplay === "completed" || statusDisplay === "done";

      return (
        <Table.Tr
          key={conversation.id}
          style={rowStyles(selectedId === conversation.id)}
          onClick={() => {
            setSelection(
              conversation.id,
              <ConversationDetails conversation={conversation} />
            );
          }}
        >
          <Table.Td>
            <Text style={textStyles} fw={500}>
              {String(contactName || "Unknown")}
            </Text>
          </Table.Td>
          <Table.Td>
            <Box style={phoneNumberStyles}>
              <IconPhoneCall size={14} color="var(--mantine-color-gray-6)" />
              <Text size="sm" c="dimmed">
                {String(contactPhone || "N/A")}
              </Text>
            </Box>
          </Table.Td>
          <Table.Td>
            <Badge
              color={isActive ? "blue" : isCompleted ? "green" : "gray"}
              variant="light"
              style={statusBadgeStyles}
              leftSection={
                isCompleted ? <IconCheck size={12} /> : <IconX size={12} />
              }
            >
              {statusDisplay}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Text style={textStyles} c="dimmed">
              {agentName}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text style={textStyles}>
              {conversation.startDate
                ? format(parseISO(conversation.startDate), "MM-dd-yy h:mm a")
                : "N/A"}
            </Text>
          </Table.Td>
          <Table.Td>
            {conversation.startDate &&
            conversation.endDate &&
            isValidDuration(conversation.startDate, conversation.endDate) ? (
              <Text style={textStyles}>
                {formatDuration(
                  differenceInSeconds(
                    parseISO(conversation.endDate),
                    parseISO(conversation.startDate)
                  )
                )}
              </Text>
            ) : (
              <Text c="dimmed" size="sm">
                --
              </Text>
            )}
          </Table.Td>
        </Table.Tr>
      );
    });
  }, [typedConversations, selectedId, setSelection]);

  if (isLoading) {
    return (
      <Center p="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (!typedConversations || typedConversations.length === 0) {
    return (
      <Center p="xl">
        <Text c="dimmed">No conversations found</Text>
      </Center>
    );
  }

  return (
    <SectionCard
      title="Conversations"
      description="Click on a conversation to view details"
    >
      <Table
        highlightOnHover
        withTableBorder
        verticalSpacing={"xs"}
        horizontalSpacing="md"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Contact</Table.Th>
            <Table.Th>Phone Number</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Agent</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Duration</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </SectionCard>
  );
}

export default ConversationsList;
