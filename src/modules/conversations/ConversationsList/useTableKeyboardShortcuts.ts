import { useHotkeys } from "@mantine/hooks";
import type { Table } from "@tanstack/react-table";
import type { ConversationsModel } from "~/models/ConversationsModels";

interface UseTableKeyboardShortcutsProps {
  table: Table<ConversationsModel>;
  onClearFilters: () => void;
  onRefresh?: () => void;
}

export function useTableKeyboardShortcuts({
  table,
  onClearFilters,
  onRefresh,
}: UseTableKeyboardShortcutsProps) {
  // Define keyboard shortcuts
  useHotkeys([
    // Clear filters with Cmd/Ctrl + K
    ["mod+k", () => onClearFilters()],

    // Refresh data with Cmd/Ctrl + R (prevent default browser refresh)
    [
      "mod+r",
      (event) => {
        event.preventDefault();
        onRefresh?.();
      },
    ],

    // Next page with Cmd/Ctrl + Right Arrow
    [
      "mod+ArrowRight",
      () => {
        if (table.getCanNextPage()) {
          table.nextPage();
        }
      },
    ],

    // Previous page with Cmd/Ctrl + Left Arrow
    [
      "mod+ArrowLeft",
      () => {
        if (table.getCanPreviousPage()) {
          table.previousPage();
        }
      },
    ],

    // First page with Cmd/Ctrl + Home
    [
      "mod+Home",
      () => {
        table.setPageIndex(0);
      },
    ],

    // Last page with Cmd/Ctrl + End
    [
      "mod+End",
      () => {
        table.setPageIndex(table.getPageCount() - 1);
      },
    ],
  ]);

  return {
    shortcuts: [
      { key: "Cmd/Ctrl + K", description: "Clear all filters" },
      { key: "Cmd/Ctrl + R", description: "Refresh data" },
      { key: "Cmd/Ctrl + →", description: "Next page" },
      { key: "Cmd/Ctrl + ←", description: "Previous page" },
      { key: "Cmd/Ctrl + Home", description: "First page" },
      { key: "Cmd/Ctrl + End", description: "Last page" },
    ],
  };
}
