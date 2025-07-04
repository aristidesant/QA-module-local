import { Table, Group, Text, ActionIcon, Tooltip } from "@mantine/core";
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";
import type { Header } from "@tanstack/react-table";
import type { ConversationsModel } from "~/models/ConversationsModels";

interface TableHeaderProps {
  headers: Header<ConversationsModel, unknown>[];
}

export function TableHeader({ headers }: TableHeaderProps) {
  return (
    <Table.Thead>
      <Table.Tr>
        {headers.map((header) => {
          const canSort = header.column.getCanSort();
          const sortDirection = header.column.getIsSorted();

          return (
            <Table.Th
              key={header.id}
              style={{
                backgroundColor: "var(--mantine-color-gray-0)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 600,
                fontSize: "var(--mantine-font-size-xs)",
                color: "var(--mantine-color-gray-6)",
                padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
                height: "40px",
                cursor: canSort ? "pointer" : "default",
                userSelect: "none",
              }}
              onClick={
                canSort ? header.column.getToggleSortingHandler() : undefined
              }
            >
              <Group gap="xs" justify="space-between">
                <Text size="xs" fw={600} tt="uppercase">
                  {header.isPlaceholder
                    ? null
                    : typeof header.column.columnDef.header === "string"
                    ? header.column.columnDef.header
                    : "Column"}
                </Text>

                {canSort && (
                  <Tooltip
                    label={
                      sortDirection === "asc"
                        ? "Click to sort descending"
                        : sortDirection === "desc"
                        ? "Click to remove sorting"
                        : "Click to sort ascending"
                    }
                  >
                    <ActionIcon
                      variant="transparent"
                      size="xs"
                      color="gray"
                      style={{ minWidth: "16px" }}
                    >
                      {sortDirection === "asc" ? (
                        <IconChevronUp size={12} />
                      ) : sortDirection === "desc" ? (
                        <IconChevronDown size={12} />
                      ) : (
                        <IconSelector size={12} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Table.Th>
          );
        })}
      </Table.Tr>
    </Table.Thead>
  );
}
