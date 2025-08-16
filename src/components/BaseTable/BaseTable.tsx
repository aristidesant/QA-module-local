import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Table } from "@mantine/core";
import styles from "./BaseTable.module.css";

export type BaseTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  initialSort?: SortingState;
  onRowClick?: (row: TData) => void;
  className?: string;
  density?: "default" | "compact";
};

function BaseTable<TData>({
  data,
  columns,
  initialSort = [],
  onRowClick,
  className,
  density = "default",
}: BaseTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSort);

  const table = useReactTable<TData>({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={`${styles.root} ${className ?? ""}`}>
      <Table className={styles.table} striped highlightOnHover>
        <thead className={styles.thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={[
                    styles.th,
                    density === "compact" ? styles.compactTh : "",
                    header.column.getCanSort() ? styles.sortable : "",
                    // Allow column-level header className via meta
                    (header.column.columnDef.meta as any)?.headerClassName ||
                      "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : (
                    <div>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc"
                        ? " 🔼"
                        : header.column.getIsSorted() === "desc"
                        ? " 🔽"
                        : ""}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} onClick={() => onRowClick?.(row.original)}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={[
                    styles.td,
                    density === "compact" ? styles.compactTd : "",
                    (cell.column.columnDef.meta as any)?.cellClassName || "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default BaseTable;
