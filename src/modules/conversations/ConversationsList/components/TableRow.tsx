import { Table, rem } from "@mantine/core";
import { flexRender, type Row } from "@tanstack/react-table";
import type { ConversationTableModel } from "~/models/ConversationsModels";

interface TableRowProps {
  row: Row<ConversationTableModel>;
  style?: React.CSSProperties;
  onClick: () => void;
}

export function TableRow({ row, style, onClick }: TableRowProps) {
  const baseStyles = {
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    fontSize: "var(--mantine-font-size-sm)",
    "&:hover": {
      backgroundColor: "var(--mantine-color-gray-0)",
    },
  };

  const cellStyles = {
    padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
    height: rem(48),
    verticalAlign: "middle" as const,
  };

  return (
    <Table.Tr style={{ ...baseStyles, ...style }} onClick={onClick}>
      {row.getVisibleCells().map((cell) => {
        const columnClassName =
          (cell.column.columnDef.meta as any)?.className || "";
        return (
          <Table.Td
            key={cell.id}
            style={cellStyles}
            className={columnClassName}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </Table.Td>
        );
      })}
    </Table.Tr>
  );
}
