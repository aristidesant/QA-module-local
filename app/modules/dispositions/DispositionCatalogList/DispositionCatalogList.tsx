import type { FC } from "react";
import { useMemo, useState } from "react";
import { Loader, Center, Text, Button, Group } from "@mantine/core";
import {
  useDispositionCatalogs,
  useCreateDispositionCatalog,
  useUpdateDispositionCatalog,
} from "~/queries/dispositionCatalogQueries";
import { useDispositionRightComponentStore } from "../dispositionRightComponentStore";
import DispositionCatalogForm from "../DispositionCatalogForm";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import type { DispositionCatalogModel } from "~/models/DispositionCatalogModels";
import styles from "./DispositionCatalogList.module.css";

const DispositionCatalogList: FC = () => {
  const { data, isLoading, isError } = useDispositionCatalogs();
  const setRightComponent = useDispositionRightComponentStore(
    (s) => s.setRightComponent
  );
  const createMutation = useCreateDispositionCatalog();
  const updateMutation = useUpdateDispositionCatalog();

  // Table columns definition
  const columns = useMemo<ColumnDef<DispositionCatalogModel>[]>(
    () => [
      {
        id: "nameAndDescription",
        header: "Name",
        cell: ({ row }) => {
          const name = row.original.name;
          const description = row.original.description;
          return (
            <div>
              <div style={{ fontWeight: 600 }}>{name}</div>
              {description && (
                <div
                  style={{
                    color: "var(--mantine-color-gray-6)",
                    fontSize: "13px",
                    marginTop: 2,
                  }}
                >
                  {description}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue() as string).toLocaleString()
            : "-",
      },
    ],
    []
  );

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Table instance
  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: false,
  });

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center>
        <Text c="red">Failed to load disposition catalogs.</Text>
      </Center>
    );
  }

  // Handler for create
  const handleCreate = () => {
    setRightComponent(
      <DispositionCatalogForm
        mode="create"
        loading={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
          setRightComponent(null);
        }}
      />
    );
  };

  // Handler for edit
  const handleEdit = (catalog: DispositionCatalogModel) => {
    setRightComponent(
      <DispositionCatalogForm
        key={catalog.id}
        mode="edit"
        initialValues={catalog}
        loading={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync({
            id: catalog.id,
            data: { ...values, isDefault: !!values.isDefault },
          });
          setRightComponent(null);
        }}
      />
    );
  };

  return (
    <div className={styles.root}>
      <Group justify="space-between" mb="md">
        <Text fw={700} size="lg">
          Disposition Catalogs
        </Text>
        <Button onClick={handleCreate} size="sm">
          Add New Catalog
        </Button>
      </Group>
      {!data || data.length === 0 ? (
        <Center>
          <Text>No disposition catalogs found.</Text>
        </Center>
      ) : (
        <div className={styles.table}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        cursor: header.column.getCanSort()
                          ? "pointer"
                          : undefined,
                        userSelect: "none",
                        padding: "8px",
                        borderBottom: "1px solid var(--mantine-color-gray-3)",
                        background: "var(--mantine-color-gray-0)",
                        fontWeight: 600,
                        fontSize: "14px",
                        textAlign: "left",
                      }}
                      onClick={header.column.getToggleSortingHandler?.()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted()
                        ? header.column.getIsSorted() === "asc"
                          ? " ▲"
                          : " ▼"
                        : null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEdit(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        padding: "8px",
                        borderBottom: "1px solid var(--mantine-color-gray-2)",
                        fontSize: "14px",
                        background: "var(--mantine-color-white)",
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DispositionCatalogList;
