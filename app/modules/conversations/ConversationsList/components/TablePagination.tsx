import {
  Group,
  Text,
  Button,
  Select,
  Pagination,
  Stack,
  Center,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import type { Table } from "@tanstack/react-table";
import type { ConversationTableModel } from "~/models/ConversationsModels";

interface TablePaginationProps {
  table: Table<ConversationTableModel>;
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
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 992px)");

  // Calculate the range of items being displayed
  const startItem = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalRows);

  const paginationStyle = {
    borderTop: "1px solid var(--mantine-color-gray-3)",
    padding: isMobile
      ? "var(--mantine-spacing-sm)"
      : "var(--mantine-spacing-md)",
    backgroundColor: "var(--mantine-color-gray-0)",
  };

  if (isMobile) {
    return (
      <Stack gap="sm" style={paginationStyle}>
        {/* Results info and page size selector */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {startItem}-{endItem} of {totalRows}
          </Text>

          <Group gap="xs">
            <Text size="sm" c="dimmed">
              Show:
            </Text>
            <Select
              size="xs"
              w={60}
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
        <Center>
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
              siblings={0}
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
        </Center>
      </Stack>
    );
  }

  if (isTablet) {
    return (
      <Stack gap="sm" style={paginationStyle}>
        {/* Results info and page size selector */}
        <Group justify="space-between">
          <Group gap="md">
            <Text size="sm" c="dimmed">
              Showing {startItem}-{endItem} of {totalRows}
            </Text>

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
        </Group>

        {/* Navigation controls */}
        <Center>
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
        </Center>
      </Stack>
    );
  }

  return (
    <Group justify="space-between" style={paginationStyle}>
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
