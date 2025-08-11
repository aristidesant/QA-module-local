import { useState, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  type PaginationState,
} from "@tanstack/react-table";
import type {
  ConversationsModel,
  ConversationTableModel,
} from "~/models/ConversationsModels";
import { useConversationColumns } from "./useConversationColumns";

interface UseConversationsTableOptions {
  data: ConversationTableModel[] | undefined;
  onRowClick?: (conversation: ConversationsModel) => void;
  selectedRowId?: number | null;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export function useConversationsTable({
  data,
  onRowClick,
  selectedRowId,
  globalFilter = "",
  onGlobalFilterChange = () => {},
}: UseConversationsTableOptions) {
  // Simple pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  // Get columns
  const columns = useConversationColumns();

  // Memoize data to avoid creating a new array each render when undefined
  const memoData = useMemo(() => data ?? [], [data]);

  const table = useReactTable({
    data: memoData, // Ensure data is always an array, memoized
    columns,
    state: {
      pagination,
      globalFilter,
    },
    // Forward table-originated global filter changes to the parent, avoiding redundant updates
    onGlobalFilterChange: (value) => {
      // Some table versions pass the resolved value directly
      const nextValue = value as unknown as string;
      if (nextValue !== globalFilter) {
        onGlobalFilterChange(nextValue);
      }
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Helper function for row click handling
  const handleRowClick = useCallback(
    (conversation: ConversationsModel) => {
      onRowClick?.(conversation);
    },
    [onRowClick]
  );

  // Row properties for the table
  const getRowProps = useCallback(
    (row: any) => ({
      key: row.id,
      style: {
        cursor: "pointer",
        transition: "background-color 0.15s ease",
        fontSize: "var(--mantine-font-size-sm)",
        backgroundColor:
          selectedRowId === row.original.id
            ? "var(--mantine-color-blue-0)"
            : undefined,
        borderLeft:
          selectedRowId === row.original.id
            ? "2px solid var(--mantine-color-blue-6)"
            : undefined,
      },
      onClick: () => handleRowClick(row.original),
    }),
    [handleRowClick, selectedRowId]
  );

  // Page size options
  const pageSizeOptions = [15, 25, 50, 100];

  return {
    table,
    pagination,
    setPagination,
    getRowProps,
    pageSizeOptions,
    totalRows: data?.length || 0,
    pageCount: table.getPageCount(),
    canPreviousPage: table.getCanPreviousPage(),
    canNextPage: table.getCanNextPage(),
    currentPageRows: table.getRowModel().rows,
  };
}
