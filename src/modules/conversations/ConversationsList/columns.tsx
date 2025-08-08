import { createColumnHelper } from "@tanstack/react-table";
import { Box, Text } from "@mantine/core";
import { IconPhoneCall } from "@tabler/icons-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import type { ConversationTableModel } from "~/models/ConversationsModels";
import styles from "./ConversationsList.module.css";

dayjs.extend(duration);

const columnHelper = createColumnHelper<ConversationTableModel>();

// Status sorting function - extracted to prevent re-renders
const statusSortingFn = (rowA: any, rowB: any) => {
  const statusOrder = {
    in_progress: 4,
    active: 4,
    completed: 3,
    done: 3,
    failed: 2,
    error: 2,
    pending: 1,
    unknown: 0,
  };

  const statusA = rowA.original.status?.toLowerCase() || "unknown";
  const statusB = rowB.original.status?.toLowerCase() || "unknown";

  return (
    (statusOrder[statusA as keyof typeof statusOrder] || 0) -
    (statusOrder[statusB as keyof typeof statusOrder] || 0)
  );
};

// Status filter function - extracted to prevent re-renders
const statusFilterFn = (row: any, id: string, value: string[]) => {
  if (!value || value.length === 0) return true;
  const status = row.getValue(id) as string;
  return value.includes(status?.toLowerCase());
};

// Date sorting function - extracted to prevent re-renders
const dateSortingFn = (rowA: any, rowB: any) => {
  const dateA = rowA.original.startDate
    ? dayjs(rowA.original.startDate)
    : dayjs(0);
  const dateB = rowB.original.startDate
    ? dayjs(rowB.original.startDate)
    : dayjs(0);
  return dateA.unix() - dateB.unix();
};

// Duration sorting function - extracted to prevent re-renders
const durationSortingFn = (rowA: any, rowB: any) => {
  const durationA = rowA.getValue("duration") as number | null;
  const durationB = rowB.getValue("duration") as number | null;

  if (durationA === null && durationB === null) return 0;
  if (durationA === null) return 1;
  if (durationB === null) return -1;

  return durationA - durationB;
};

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return "--";
  }

  const durationObj = dayjs.duration(seconds, "seconds");
  const parts: string[] = [];

  const hours = Math.floor(durationObj.asHours());
  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  const minutes = durationObj.minutes();
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }

  const remainingSeconds = durationObj.seconds();
  parts.push(`${remainingSeconds}s`);

  return parts.join(" ") || "0s";
};

// Text styles
const textStyles = {
  fontSize: "var(--mantine-font-size-sm)",
  color: "var(--mantine-color-gray-7)",
};

export const conversationColumns = [
  columnHelper.accessor(
    (row) => {
      return row.externalPhoneNumber ? "Demo" : row.contactName || "Unknown";
    },
    {
      id: "contact",
      header: "Contact",
      cell: (info) => (
        <Text style={textStyles} fw={500}>
          {String(info.getValue())}
        </Text>
      ),
      sortingFn: "alphanumeric",
      enableSorting: true,
      enableColumnFilter: true,
      filterFn: "includesString",
      meta: {
        className: "",
      },
    }
  ),

  columnHelper.accessor((row) => row.externalPhoneNumber || "N/A", {
    id: "phoneNumber",
    header: "Phone",
    cell: (info) => {
      const value = info.getValue() as string;
      return (
        <Box style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <IconPhoneCall size={14} color="var(--mantine-color-gray-6)" />
          <Text
            size="xs"
            className={styles.textEllipsis}
            style={{ maxWidth: "120px" }}
          >
            {value || "--"}
          </Text>
        </Box>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: "includesString",
    size: 150,
    meta: {
      className: styles.columnHideSmall,
    },
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = (info.getValue()?.toString() || "unknown").toLowerCase();

      type StatusInfo = {
        className: string;
        label: string;
      };

      const statusMap: Record<string, StatusInfo> = {
        completed: { className: "statusCompleted", label: "Completed" },
        done: { className: "statusCompleted", label: "Done" },
        in_progress: { className: "statusInitiated", label: "In Progress" },
        active: { className: "statusInitiated", label: "Active" },
        failed: { className: "statusFailed", label: "Failed" },
        error: { className: "statusFailed", label: "Error" },
        pending: { className: "statusInitiated", label: "Pending" },
        unknown: { className: "statusInitiated", label: "Unknown" },
      };

      const statusInfo = statusMap[status] || {
        className: "statusInitiated",
        label: status,
      };

      return (
        <Box
          className={`${styles.statusBadge} ${
            styles[statusInfo.className as keyof typeof styles]
          }`}
        >
          {statusInfo.label}
        </Box>
      );
    },
    sortingFn: statusSortingFn,
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: statusFilterFn,
    size: 120,
    meta: {
      className: "",
    },
  }),

  columnHelper.accessor((row) => row.agentName || "N/A", {
    id: "agent",
    header: "Agent",
    cell: (info) => (
      <Text style={textStyles} c="dimmed">
        {String(info.getValue() || "N/A")}
      </Text>
    ),
    sortingFn: "alphanumeric",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: "includesString",
    meta: {
      className: styles.columnHideTablet,
    },
  }),

  columnHelper.accessor("startDate", {
    id: "date",
    header: "Date",
    cell: (info) => {
      const startDate = info.getValue();
      if (!startDate)
        return (
          <Text size="xs" className={styles.textEllipsis}>
            --
          </Text>
        );

      const date = dayjs(startDate);
      // Use shorter format on smaller screens
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const isTablet = window.matchMedia("(max-width: 992px)").matches;

      let format = "MMM D, YYYY h:mm A";
      if (isMobile) {
        format = "MM/DD h:mm A";
      } else if (isTablet) {
        format = "MMM D h:mm A";
      }

      return (
        <Text
          size="xs"
          className={styles.textEllipsis}
          title={date.format("MMM D, YYYY h:mm A")}
        >
          {date.format(format)}
        </Text>
      );
    },
    sortingFn: dateSortingFn,
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: "includesString",
    size: 180,
    meta: {
      className: "",
    },
  }),

  columnHelper.accessor(
    (row) => {
      if (row.startDate && row.endDate) {
        return dayjs(row.endDate).diff(dayjs(row.startDate), "seconds");
      }
      return null;
    },
    {
      id: "duration",
      header: "Duration",
      cell: (info) => {
        const duration = info.getValue();
        return (
          <Text size="xs" className={styles.textEllipsis}>
            {duration !== null ? formatDuration(duration) : "--"}
          </Text>
        );
      },
      sortingFn: durationSortingFn,
      enableSorting: true,
      enableColumnFilter: false,
      size: 100,
      meta: {
        className: styles.columnHideMobile,
      },
    }
  ),
];
