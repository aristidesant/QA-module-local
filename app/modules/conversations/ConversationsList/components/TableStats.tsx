import { Group, Text, Paper, ThemeIcon } from "@mantine/core";
import { IconTable, IconFilter, IconSortAscending } from "@tabler/icons-react";

interface TableStatsProps {
  totalRows: number;
  filteredRows: number;
  sortedColumns: number;
  activeFilters: number;
}

export function TableStats({
  totalRows,
  filteredRows,
  sortedColumns,
  activeFilters,
}: TableStatsProps) {
  return (
    <Paper
      withBorder
      p="xs"
      radius="md"
      style={{ backgroundColor: "var(--mantine-color-gray-0)" }}
    >
      <Group gap="md" justify="center">
        <Group gap="xs">
          <ThemeIcon variant="light" size="sm" color="blue">
            <IconTable size={14} />
          </ThemeIcon>
          <Text size="xs" c="dimmed">
            {filteredRows} of {totalRows} rows
          </Text>
        </Group>

        {activeFilters > 0 && (
          <Group gap="xs">
            <ThemeIcon variant="light" size="sm" color="orange">
              <IconFilter size={14} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">
              {activeFilters} filter{activeFilters !== 1 ? "s" : ""}
            </Text>
          </Group>
        )}

        {sortedColumns > 0 && (
          <Group gap="xs">
            <ThemeIcon variant="light" size="sm" color="green">
              <IconSortAscending size={14} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">
              {sortedColumns} sort{sortedColumns !== 1 ? "s" : ""}
            </Text>
          </Group>
        )}
      </Group>
    </Paper>
  );
}
