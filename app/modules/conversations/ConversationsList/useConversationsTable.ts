import { useState, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  type PaginationState,
} from "@tanstack/react-table";
import type { ConversationsModel } from "~/models/ConversationsModels";
import { useConversationColumns } from "./useConversationColumns";

interface UseConversationsTableOptions {
  data: ConversationsModel[] | undefined;
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

  // Create the table instance
  const [filtering, setFiltering] = useState(globalFilter);

  // Update local filter state when globalFilter prop changes
  useEffect(() => {
    setFiltering(globalFilter);
  }, [globalFilter]);

  const table = useReactTable({
    data: data || [], // Ensure data is always an array
    columns,
    state: {
      pagination,
      globalFilter: filtering,
    },
    onGlobalFilterChange: (value) => {
      setFiltering(value);
      onGlobalFilterChange(value);
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Helper function for row click handling
  const handleRowClick = useCallback((conversation: ConversationsModel) => {
    onRowClick?.(conversation);
  }, [onRowClick]);

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
