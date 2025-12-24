import { Group, ActionIcon, Tooltip, TextInput, Loader } from "@mantine/core";
import {
  IconRefresh,
  IconSearch,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { Table } from "@tanstack/react-table";
import type { ConversationTableModel } from "~/models/ConversationsModels";
import { useState } from "react";
import ExportToExcelModal from "./ExportToExcelModal";

interface TableToolbarProps {
  table: Table<ConversationTableModel>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function TableToolbar({
  globalFilter,
  onGlobalFilterChange,
  onRefresh,
  isLoading = false,
}: TableToolbarProps) {
  const { t } = useTranslation();
  const [exportOpen, setExportOpen] = useState(false);

  const toolbarStyle = {
    borderBottom: "1px solid var(--mantine-color-gray-3)",
    backgroundColor: "var(--mantine-color-gray-0)",
    padding: "var(--mantine-spacing-md)",
  };

  const searchInputStyle = {
    width: "300px",
    minWidth: "250px",
  } as const;

  return (
    <Group justify="space-between" style={toolbarStyle}>
      <TextInput
        placeholder={t("conversationsList.searchPlaceholder")}
        value={globalFilter ?? ""}
        onChange={(e) => onGlobalFilterChange(e.target.value)}
        leftSection={<IconSearch size={16} />}
        style={searchInputStyle}
      />

      <Group gap="xs">
        {isLoading && (
          <Tooltip label={t("conversationsList.loadingData")}>
            <ActionIcon
              variant="subtle"
              size="lg"
              color="gray"
              aria-label="loading"
            >
              <Loader size={18} color="gray" />
            </ActionIcon>
          </Tooltip>
        )}
        {onRefresh && (
          <Tooltip label={t("conversationsList.refreshData")}>
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

        <Tooltip label={t("conversationsList.exportToExcel")}>
          <ActionIcon
            variant="subtle"
            size="lg"
            color="gray"
            onClick={() => setExportOpen(true)}
          >
            <IconFileSpreadsheet size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <ExportToExcelModal
        opened={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </Group>
  );
}
