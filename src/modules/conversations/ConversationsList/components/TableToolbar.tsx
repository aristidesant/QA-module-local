import { Group, ActionIcon, Tooltip, TextInput, Stack } from "@mantine/core";
import { IconRefresh, IconSearch } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import type { Table } from "@tanstack/react-table";
import type { ConversationTableModel } from "~/models/ConversationsModels";

interface TableToolbarProps {
  table: Table<ConversationTableModel>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onRefresh?: () => void;
}

export function TableToolbar({
  globalFilter,
  onGlobalFilterChange,
  onRefresh,
}: TableToolbarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toolbarStyle = {
    borderBottom: "1px solid var(--mantine-color-gray-3)",
    backgroundColor: "var(--mantine-color-gray-0)",
    padding: isMobile
      ? "var(--mantine-spacing-sm)"
      : "var(--mantine-spacing-md)",
  };

  const searchInputStyle = {
    width: isMobile ? "100%" : "300px",
    minWidth: isMobile ? "auto" : "250px",
  };

  if (isMobile) {
    return (
      <Stack gap="sm" style={toolbarStyle}>
        <TextInput
          placeholder="Search conversations..."
          value={globalFilter ?? ""}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          leftSection={<IconSearch size={16} />}
          style={searchInputStyle}
        />

        {onRefresh && (
          <Group justify="center">
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
          </Group>
        )}
      </Stack>
    );
  }

  return (
    <Group justify="space-between" style={toolbarStyle}>
      <TextInput
        placeholder="Search conversations..."
        value={globalFilter ?? ""}
        onChange={(e) => onGlobalFilterChange(e.target.value)}
        leftSection={<IconSearch size={16} />}
        style={searchInputStyle}
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
