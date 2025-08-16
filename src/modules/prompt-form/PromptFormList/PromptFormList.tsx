import React, { useMemo } from "react";
import {
  useCreatePromptForm,
  useDeletePromptForm,
  useGetAllPromptForms,
  useUpdatePromptForm,
} from "../../../queries/promptFormQueries";
import {
  Loader,
  Center,
  Text,
  Group,
  ActionIcon,
  Badge,
  Stack,
  Button,
} from "@mantine/core";
import { IconPlus, IconAlertCircle } from "@tabler/icons-react";
import styles from "./PromptFormList.module.css";
import { modals } from "@mantine/modals";
import { PromptFormForm } from "../PromptFormForm";
import SectionCard from "~/components/SectionCard";
import type { PromptForm } from "~/models/PromptFormModel";
import usePromptFormStore from "../usePromptFormStore";
import BaseTable from "~/components/BaseTable";
import type { ColumnDef } from "@tanstack/react-table";

export const PromptFormList: React.FC = () => {
  const { data, isLoading, isError } = useGetAllPromptForms();
  const { setRightComponent } = usePromptFormStore((state) => state);
  const { mutateAsync: createPromptForm } = useCreatePromptForm();
  const { mutateAsync: updatePromptForm } = useUpdatePromptForm();
  const { mutateAsync: deletePromptForm } = useDeletePromptForm();

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
        <Text c="red">Failed to load prompt forms.</Text>
      </Center>
    );
  }

  const handleOnCreate = async (values: PromptForm) => {
    try {
      await createPromptForm(values);
      setRightComponent(null);
    } catch (error) {
      console.error("Error creating prompt form:", error);
    }
  };
  const handleOnUpdate = async (values: PromptForm) => {
    try {
      await updatePromptForm({
        id: `${values.id}`,
        data: values,
      });
      setRightComponent(null);
    } catch (error) {
      console.error("Error updating prompt form:", error);
    }
  };

  const handleOnDelete = async (id: string) => {
    try {
      modals.openConfirmModal({
        title: "Delete Prompt Form",
        children: (
          <Text>
            Are you sure you want to delete this prompt form? This action is
            irreversible.
          </Text>
        ),
        labels: { confirm: "Delete", cancel: "Cancel" },
        confirmProps: { color: "red" },
        onConfirm: async () => {
          await deletePromptForm(id);
        },
      });
    } catch (error) {
      console.error("Error deleting prompt form:", error);
    }
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md">
          <IconAlertCircle size={40} color="var(--mantine-color-red-6)" />
          <Text c="red" size="lg" fw={500}>
            Failed to load prompt forms
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <SectionCard
      title="List of forms"
      description="Thi is a list of all the forms created by the user."
      headerActions={
        <ActionIcon
          onClick={() => {
            setRightComponent(
              <PromptFormForm onSubmit={handleOnCreate} initialValues={{}} />
            );
          }}
        >
          <IconPlus />
        </ActionIcon>
      }
    >
      {data && data.length > 0 ? (
        <BaseTable<PromptForm>
          data={data}
          columns={useMemo<ColumnDef<PromptForm>[]>(
            () => [
              {
                id: "nameCreated",
                header: "Name / Created",
                cell: ({ row }) => (
                  <div className={styles.nameCell}>
                    <span className={styles.formName}>{row.original.name}</span>
                    <Text c="dimmed" fz="xs">
                      {new Date(row.original.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </Text>
                  </div>
                ),
              },
              {
                id: "type",
                header: () => <span className={styles.typeHeader}>Type</span>,
                cell: ({ row }) => (
                  <Badge variant="light" color="blue" radius="sm">
                    {row.original.type?.name || "N/A"}
                  </Badge>
                ),
              },
              {
                id: "actions",
                header: () => <div style={{ width: 180 }}>Actions</div>,
                cell: ({ row }) => (
                  <Group gap="xs" justify="flex-end" className={styles.actions}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRightComponent(
                          <PromptFormForm
                            onSubmit={handleOnUpdate}
                            initialValues={row.original}
                          />
                        );
                      }}
                      variant="light"
                      color="blue"
                      size="xs"
                      className={styles.actionButton}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOnDelete(`${row.original.id}`);
                      }}
                      variant="light"
                      color="red"
                      size="xs"
                      className={styles.actionButton}
                    >
                      Delete
                    </Button>
                  </Group>
                ),
                enableSorting: false,
              },
            ],
            []
          )}
          onRowClick={(row) =>
            setRightComponent(
              <PromptFormForm onSubmit={handleOnUpdate} initialValues={row} />
            )
          }
          className={styles.table}
        />
      ) : (
        <div className={styles.emptyState}>
          <IconAlertCircle size={24} style={{ marginBottom: 12 }} />
          <Text size="sm">No prompt forms found</Text>
          <Text size="xs" c="dimmed" mt={4}>
            Create your first prompt form to get started
          </Text>
        </div>
      )}
    </SectionCard>
  );
};
