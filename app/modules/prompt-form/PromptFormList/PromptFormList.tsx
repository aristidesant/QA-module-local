import React from "react";
import {
  useCreatePromptForm,
  useDeletePromptForm,
  useGetAllPromptForms,
  useUpdatePromptForm,
} from "../../../queries/promptFormQueries";
import {
  Table,
  Loader,
  Center,
  Text,
  Group,
  ActionIcon,
  Badge,
  Stack,
} from "@mantine/core";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconPlus,
  IconAlertCircle,
} from "@tabler/icons-react";
import styles from "./PromptFormList.module.css";
import { modals } from "@mantine/modals";
import { PromptFormForm } from "../PromptFormForm";
import type { PromptForm } from "~/models/PromptFormMOdel";
import SectionCard from "~/components/SectionCard";

export const PromptFormList: React.FC = () => {
  const { data, isLoading, isError } = useGetAllPromptForms();

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
      modals.close("create-prompt-form");
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
      modals.close("create-prompt-form");
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
            modals.open({
              modalId: "create-prompt-form",
              size: "90%",
              title: "Create New Prompt Form",
              children: (
                <PromptFormForm onSubmit={handleOnCreate} initialValues={{}} />
              ),
              onClose: () => {
                modals.close("create-prompt-form");
              },
            });
          }}
        >
          <IconPlus />
        </ActionIcon>
      }
    >
      <Table className={styles.table} highlightOnHover withTableBorder>
        <Table.Thead className={styles.tableHeader}>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th className={styles.typeHeader}>Type</Table.Th>
            <Table.Th className={styles.dateHeader}>Created</Table.Th>
            <Table.Th style={{ width: "180px" }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data && data.length > 0 ? (
            data.map((form: PromptForm) => (
              <Table.Tr key={form.id} className={styles.row}>
                <Table.Td className={styles.nameCell}>{form.name}</Table.Td>
                <Table.Td className={styles.typeCell}>
                  <Badge variant="light" color="blue" radius="sm">
                    {form.type?.name || "N/A"}
                  </Badge>
                </Table.Td>
                <Table.Td className={styles.dateCell}>
                  {new Date(form.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end" className={styles.actions}>
                    <ActionIcon
                      variant="light"
                      color="gray"
                      size="md"
                      className={styles.actionButton}
                      aria-label="View form"
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => {
                        modals.open({
                          modalId: "create-prompt-form",
                          size: "90%",
                          title: "Edit Prompt Form",
                          children: (
                            <PromptFormForm
                              onSubmit={handleOnUpdate}
                              initialValues={form}
                            />
                          ),
                          onClose: () => {
                            modals.close("create-prompt-form");
                          },
                        });
                      }}
                      variant="light"
                      color="blue"
                      size="md"
                      className={styles.actionButton}
                      aria-label="Edit form"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => handleOnDelete(`${form.id}`)}
                      variant="light"
                      color="red"
                      size="md"
                      className={styles.actionButton}
                      aria-label="Delete form"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <div className={styles.emptyState}>
                  <IconAlertCircle size={24} style={{ marginBottom: 12 }} />
                  <Text size="sm">No prompt forms found</Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Create your first prompt form to get started
                  </Text>
                </div>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </SectionCard>
  );
};
