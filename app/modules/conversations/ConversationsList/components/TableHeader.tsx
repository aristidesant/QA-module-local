import { Table, Group, Text, ActionIcon, Tooltip } from "@mantine/core";
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";
import type { Header } from "@tanstack/react-table";
import type { ConversationTableModel } from "~/models/ConversationsModels";
import styles from "./TableHeader.module.css";

interface TableHeaderProps {
  headers: Header<ConversationTableModel, unknown>[];
}

export function TableHeader({ headers }: TableHeaderProps) {
  return (
    <Table.Thead>
      <Table.Tr>
        {headers.map((header) => {
          const canSort = header.column.getCanSort();
          const sortDirection = header.column.getIsSorted();
          const columnClassName =
            (header.column.columnDef.meta as any)?.className || "";

          return (
            <Table.Th
              key={header.id}
              className={`${styles.headerCell} ${columnClassName}`}
              data-cansort={canSort}
              onClick={
                canSort ? header.column.getToggleSortingHandler() : undefined
              }
            >
              <Group
                className={styles.headerGroup}
                gap="xs"
                justify="space-between"
              >
                <Text
                  className={styles.headerText}
                  size="xs"
                  fw={600}
                  tt="uppercase"
                >
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
