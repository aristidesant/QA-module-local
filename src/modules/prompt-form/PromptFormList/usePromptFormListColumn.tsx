import { useMemo } from "react";
import { Text, Badge, Group, Button } from "@mantine/core";
import type { ColumnDef } from "@tanstack/react-table";
import type { PromptForm } from "~/models/PromptFormModel";
import styles from "./PromptFormList.module.css";
import { PromptFormForm } from "../PromptFormForm";
import { modals } from "@mantine/modals";
import usePromptFormStore from "../usePromptFormStore";
import {
  useDeletePromptForm,
  useUpdatePromptForm,
} from "../../../queries/promptFormQueries";

export default function usePromptFormListColumn() {
  const { setRightComponent } = usePromptFormStore((s) => s);
  const { mutateAsync: updatePromptForm } = useUpdatePromptForm();
  const { mutateAsync: deletePromptForm } = useDeletePromptForm();

  const handleOnUpdate = async (values: PromptForm) => {
    try {
      await updatePromptForm({ id: String(values.id), data: values });
      setRightComponent(null);
    } catch (error) {
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error("Error deleting prompt form:", error);
    }
  };

  const columns = useMemo<ColumnDef<PromptForm>[]>(
    () => [
      {
        id: "nameCreated",
        header: "Name / Type / Created",
        cell: ({ row }) => (
          <div className={styles.nameCell}>
            <span className={styles.formName}>{row.original.name}</span>
            {row.original.type?.name && (
              <Badge
                variant="light"
                color="blue"
                radius="sm"
                size="xs"
                className={styles.inlineTypeBadge}
              >
                {row.original.type.name}
              </Badge>
            )}
            <Text c="dimmed" fz="xs" className={styles.smallText}>
              {new Date(row.original.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => (
          <div
            className={styles.smallColumn}
            style={{ width: 180, textAlign: "right" }}
          >
            Actions
          </div>
        ),
        cell: ({ row }) => (
          <Group
            gap="xs"
            justify="flex-end"
            className={`${styles.actions} ${styles.smallColumn}`}
          >
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
        meta: {
          headerClassName: styles.smallColumn,
          cellClassName: styles.smallColumn,
        },
      },
    ],
    [setRightComponent, handleOnUpdate, handleOnDelete]
  );

  const openEditForm = (values: PromptForm) => {
    setRightComponent(
      <PromptFormForm onSubmit={handleOnUpdate} initialValues={values} />
    );
  };

  return { columns, openEditForm };
}
