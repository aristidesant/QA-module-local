import type { FC } from "react";
import { useMemo, useState } from "react";
import {
  Loader,
  Center,
  Text,
  Button,
  Group,
  ActionIcon,
  Tooltip,
  Pagination,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  useDispositionCatalogs,
  useCreateDispositionCatalog,
  useUpdateDispositionCatalog,
  useDeleteDispositionCatalog,
} from "~/queries/dispositionCatalogQueries";
import DispositionCatalogForm from "../DispositionCatalogForm";
import { type ColumnDef } from "@tanstack/react-table";
import type { DispositionCatalogModel } from "~/models/DispositionCatalogModels";
import styles from "./DispositionCatalogList.module.css";
import { useDispositionStore } from "../dispositionRightComponentStore";
import BaseTable from "~/components/BaseTable";

const DispositionCatalogList: FC = () => {
  const { data, isLoading, isError } = useDispositionCatalogs();
  const { setRightComponent, setCatalog, clearCatalog } = useDispositionStore(
    (s) => s
  );
  const createMutation = useCreateDispositionCatalog();
  const updateMutation = useUpdateDispositionCatalog();
  const deleteMutation = useDeleteDispositionCatalog();

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
            <div className={styles.nameCell}>
              <div className={styles.nameText}>{name}</div>
              {description && (
                <div className={styles.descriptionText}>{description}</div>
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
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Group gap={4}>
            <Tooltip label="Delete" withArrow>
              <ActionIcon
                color="red"
                variant="subtle"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row.original);
                }}
                loading={
                  deleteMutation.isPending &&
                  deleteMutation.variables?.id === row.original.id
                }
                aria-label="Delete"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
        enableSorting: false,
      },
    ],
    [deleteMutation.isPending, deleteMutation.variables]
  );
  // Handler for delete
  const handleDelete = (catalog: DispositionCatalogModel) => {
    deleteMutation.mutate(
      { id: catalog.id },
      {
        onSuccess: () => {
          notifications.show({
            title: "Catalog deleted",
            message: "Disposition catalog was deleted successfully.",
            color: "teal",
          });
        },
        onError: (error: any) => {
          notifications.show({
            title: "Delete failed",
            message: error?.message || "Failed to delete disposition catalog.",
            color: "red",
          });
        },
      }
    );
  };

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Paginated data
  const paginatedData = useMemo<DispositionCatalogModel[]>(() => {
    if (!data) return [];
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page]);

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
    clearCatalog();
    setRightComponent(
      <DispositionCatalogForm
        mode="create"
        loading={createMutation.isPending}
        onSubmit={async (values) => {
          try {
            await createMutation.mutateAsync(values);
            notifications.show({
              title: "Catalog created",
              message: "Disposition catalog was created successfully.",
              color: "teal",
            });
            setRightComponent(null);
          } catch (error: any) {
            notifications.show({
              title: "Create failed",
              message:
                error?.message || "Failed to create disposition catalog.",
              color: "red",
            });
          }
        }}
      />
    );
  };

  // Handler for edit
  const handleEdit = (catalog: DispositionCatalogModel) => {
    setCatalog(catalog);
    setRightComponent(
      <DispositionCatalogForm
        key={catalog.id}
        mode="edit"
        initialValues={catalog}
        loading={updateMutation.isPending}
        onSubmit={async (values) => {
          try {
            await updateMutation.mutateAsync({
              id: catalog.id,
              data: { ...values, isDefault: !!values.isDefault },
            });
            notifications.show({
              title: "Catalog updated",
              message: "Disposition catalog was updated successfully.",
              color: "teal",
            });
            setRightComponent(null);
          } catch (error: any) {
            notifications.show({
              title: "Update failed",
              message:
                error?.message || "Failed to update disposition catalog.",
              color: "red",
            });
          }
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
        <>
          <div className={styles.table}>
            <BaseTable
              data={paginatedData}
              columns={columns}
              onRowClick={(row) => handleEdit(row)}
              className={styles.table}
            />
          </div>
          {data.length > pageSize && (
            <Center mt="md">
              <Pagination
                total={Math.ceil(data.length / pageSize)}
                value={page}
                onChange={setPage}
                size="sm"
                withEdges
              />
            </Center>
          )}
        </>
      )}
    </div>
  );
};

export default DispositionCatalogList;
