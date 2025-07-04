import { Group, ActionIcon, Tooltip, TextInput } from "@mantine/core";
import { IconRefresh, IconSearch } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
import type { ConversationsModel } from "~/models/ConversationsModels";

interface TableToolbarProps {
  table: Table<ConversationsModel>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onRefresh?: () => void;
}

export function TableToolbar({
  table,
  globalFilter,
  onGlobalFilterChange,
  onRefresh,
}: TableToolbarProps) {
  return (
    <Group
      justify="space-between"
      p="md"
      style={{
        borderBottom: "1px solid var(--mantine-color-gray-3)",
        backgroundColor: "var(--mantine-color-gray-0)",
      }}
    >
      <TextInput
        placeholder="Search conversations..."
        value={globalFilter ?? ""}
        onChange={(e) => onGlobalFilterChange(e.target.value)}
        leftSection={<IconSearch size={16} />}
        style={{ width: 300 }}
      />

      <Group gap="xs">
        {onRefresh && (
          <Tooltip label="Refresh data">
            <ActionIcon
              variant="subtle"
              size="lg"
              color="gray"
              onClick={onRefresh}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Group>
  );
}
