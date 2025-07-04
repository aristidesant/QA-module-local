import { Group, Text, Button, Select, Pagination } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
import type { ConversationsModel } from "~/models/ConversationsModels";

interface TablePaginationProps {
  table: Table<ConversationsModel>;
  totalRows: number;
  pageSizeOptions: number[];
}

export function TablePagination({
  table,
  totalRows,
  pageSizeOptions,
}: TablePaginationProps) {
  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  // Calculate the range of items being displayed
  const startItem = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <Group
      justify="space-between"
      p="md"
      style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
    >
      {/* Results info */}
      <Group gap="md">
        <Text size="sm" c="dimmed">
          Showing {startItem}-{endItem} of {totalRows}
        </Text>

        {/* Page size selector */}
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Show:
          </Text>
          <Select
            size="xs"
            w={70}
            data={pageSizeOptions.map((size) => ({
              value: size.toString(),
              label: size.toString(),
            }))}
            value={pageSize.toString()}
            onChange={(value) => {
              if (value) {
                table.setPageSize(parseInt(value));
              }
            }}
          />
        </Group>
      </Group>

      {/* Navigation controls */}
      <Group gap="xs">
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconChevronLeft size={14} />}
          disabled={!canPreviousPage}
          onClick={() => table.previousPage()}
        >
          Previous
        </Button>

        <Pagination
          total={pageCount}
          value={pageIndex + 1}
          onChange={(page) => table.setPageIndex(page - 1)}
          size="sm"
          siblings={1}
          boundaries={1}
        />

        <Button
          variant="subtle"
          size="xs"
          rightSection={<IconChevronRight size={14} />}
          disabled={!canNextPage}
          onClick={() => table.nextPage()}
        >
          Next
        </Button>
      </Group>
    </Group>
  );
}
