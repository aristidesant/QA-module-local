import { Table, Center, Text } from "@mantine/core";
import type { Row } from "@tanstack/react-table";
import type { ConversationsModel } from "~/models/ConversationsModels";
import { TableRow } from "./TableRow";

interface TableBodyProps {
  rows: Row<ConversationsModel>[];
  getRowProps: (row: Row<ConversationsModel>) => {
    key: string;
    style: React.CSSProperties;
    onClick: () => void;
  };
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function TableBody({
  rows,
  getRowProps,
  isLoading,
  isEmpty,
}: TableBodyProps) {
  if (isLoading) {
    return (
      <Table.Tbody>
        <Table.Tr>
          <Table.Td colSpan={6}>
            <Center p="xl">
              <Text c="dimmed">Loading...</Text>
            </Center>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    );
  }

  if (isEmpty) {
    return (
      <Table.Tbody>
        <Table.Tr>
          <Table.Td colSpan={6}>
            <Center p="xl">
              <Text c="dimmed">No conversations found</Text>
            </Center>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    );
  }

  return (
    <Table.Tbody>
      {rows.map((row) => {
        const props = getRowProps(row);
        return (
          <TableRow
            key={props.key}
            row={row}
            style={props.style}
            onClick={props.onClick}
          />
        );
      })}
    </Table.Tbody>
  );
}
