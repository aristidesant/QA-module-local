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
  Paper,
  Group,
  Button,
  ActionIcon,
  Flex,
} from "@mantine/core";
import { IconEye, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import styles from "./PromptFormList.module.css";
import { modals } from "@mantine/modals";
import { PromptFormForm } from "../PromptFormForm";
import { useGetAllPromptTypes } from "~/queries/promptTypesQueries";
import type { PromptForm } from "~/models/PromptFormMOdel";

export const PromptFormList: React.FC = () => {
  const { data, isLoading, isError } = useGetAllPromptForms();
  const { mutateAsync: createPromptForm } = useCreatePromptForm();
  const { mutateAsync: updatePromptForm } = useUpdatePromptForm();
  const { mutateAsync: deletePromptForm } = useDeletePromptForm();
  const { data: promptTypes } = useGetAllPromptTypes();
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

  return (
    <Paper
      className={styles.container}
      shadow="xs"
      p="md"
      radius="md"
      withBorder
    >
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th colSpan={4}>
              <Flex justify={"end"}>
                <ActionIcon
                  onClick={() => {
                    modals.open({
                      modalId: "create-prompt-form",
                      size: "90%",
                      title: "Create New Prompt Form",
                      children: (
                        <PromptFormForm
                          promptTypes={promptTypes ?? []}
                          onSubmit={handleOnCreate}
                          initialValues={{}}
                        />
                      ),
                      onClose: () => {
                        modals.close("create-prompt-form");
                      },
                    });
                  }}
                  color="blue"
                  variant="filled"
                  radius="xl"
                  style={{ marginLeft: "auto" }}
                >
                  <IconPlus />
                </ActionIcon>
              </Flex>
            </Table.Th>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Created</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data && data.length > 0 ? (
            data.map((form: PromptForm) => (
              <Table.Tr key={form.id}>
                <Table.Td>{form.name}</Table.Td>
                <Table.Td>{form.type?.name}</Table.Td>
                <Table.Td>
                  {new Date(form.createdAt).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button variant="subtle" size="xs">
                      <IconEye size={18} />
                    </Button>
                    <Button
                      onClick={() => {
                        modals.open({
                          modalId: "create-prompt-form",
                          size: "90%",
                          title: "Edit Prompt Form",
                          children: (
                            <PromptFormForm
                              promptTypes={promptTypes ?? []}
                              onSubmit={handleOnUpdate}
                              initialValues={form}
                            />
                          ),
                          onClose: () => {
                            modals.close("create-prompt-form");
                          },
                        });
                      }}
                      variant="subtle"
                      size="xs"
                      color="blue"
                    >
                      <IconEdit size={18} />
                    </Button>
                    <Button
                      onClick={() => {
                        handleOnDelete(`${form.id}`);
                      }}
                      variant="subtle"
                      size="xs"
                      color="red"
                    >
                      <IconTrash size={18} />
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text ta="center" c="dimmed">
                  No prompt forms found.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
