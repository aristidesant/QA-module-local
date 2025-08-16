import React from "react";
import {
  Paper,
  Select,
  TextInput,
  Button,
  Stack,
  Box,
  Divider,
} from "@mantine/core";
import styles from "./PromptFormForm.module.css";
import { useForm } from "@mantine/form";
import { useGetAllPromptTypes } from "~/queries/promptTypesQueries";
import PromptFormInput from "../PromptFormInput";
import { IconDeviceFloppy } from "@tabler/icons-react";
import type { PromptInstructionType } from "~/config/prompt-generator/useForm";
import { useGetAllPromptCategories } from "~/queries/promptCategoryQueries";
import type { PromptForm } from "~/models/PromptFormModel";

export type PromptFormFormProps = {
  initialValues?: Partial<PromptForm>;
  onSubmit?: (values: PromptForm) => void;
  submitLabel?: string;
};

export const PromptFormForm: React.FC<PromptFormFormProps> = ({
  initialValues,
  onSubmit,
  submitLabel = "Save",
}) => {
  const form = useForm<Partial<PromptForm>>({
    initialValues: initialValues || {},
  });
  const [categoryId, setCategoryId] = React.useState<string | undefined>();

  const { data: promptCategories } = useGetAllPromptCategories();
  const { data: promptTypes } = useGetAllPromptTypes({
    ...(categoryId ? { categoryId } : {}),
  });

  // When category changes, reset selected type to first available type in that category
  React.useEffect(() => {
    if (promptTypes && promptTypes.length > 0) {
      // If current typeId is not in the fetched list, reset to first
      const current = form.values.typeId;
      const exists = promptTypes.some((t) => t.id === current);
      if (!exists) {
        form.setFieldValue("typeId", promptTypes[0].id);
      }
    } else {
      // No types available, clear typeId
      if (form.values.typeId) form.setFieldValue("typeId", undefined as any);
    }
  }, [promptTypes]);

  // Ensure initialValues hydrate the form correctly when editing
  React.useEffect(() => {
    if (initialValues) {
      form.setValues(initialValues);
      // If editing an existing prompt that has a type with a category,
      // set the categoryId state so the prompt types for that category
      // will be fetched and the type Select can display the current type.
      if (initialValues.type?.categoryId != null) {
        setCategoryId(String(initialValues.type.categoryId));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.id]);

  return (
    <div className={styles.container}>
      <Box
        component="form"
        aria-label="Prompt form"
        onSubmit={form.onSubmit((values) => {
          onSubmit?.(values as PromptForm);
          setCategoryId(undefined);
        })}
      >
        <Paper className={styles.card} p="md" mb="md" radius="md" withBorder>
          <Stack gap="md">
            <div
              className={styles.row}
              role="group"
              aria-label="Prompt basic info"
            >
              <Select
                placeholder="Select a category"
                label="Select Category"
                nothingFoundMessage="No categories"
                value={categoryId}
                onChange={(value) => {
                  setCategoryId(value || undefined);
                  // Reset typeId so it aligns with the new category list
                  form.setFieldValue("typeId", undefined as any);
                }}
                disabled={!promptCategories || promptCategories.length === 0}
                data={
                  promptCategories?.map((category) => ({
                    value: `${category.id}`,
                    label: category.name,
                  })) ?? []
                }
              />

              {(() => {
                const typeInput = form.getInputProps("typeId");
                return (
                  <Select
                    placeholder="Select a prompt type"
                    label="Select Prompt Type"
                    nothingFoundMessage={
                      categoryId
                        ? "No types for this category"
                        : "Select a category first"
                    }
                    data={
                      promptTypes?.map((type) => ({
                        value: `${type.id}`,
                        label: type.name,
                      })) ?? []
                    }
                    disabled={
                      !categoryId || !promptTypes || promptTypes.length === 0
                    }
                    value={
                      form.values.typeId != null
                        ? String(form.values.typeId)
                        : null
                    }
                    onChange={(value) => {
                      form.setFieldValue(
                        "typeId",
                        value != null ? Number(value) : (undefined as any)
                      );
                    }}
                    // pass through validation error from the form
                    error={typeInput.error as any}
                  />
                );
              })()}
            </div>

            <TextInput {...form.getInputProps("name")} label="Prompt Name" />
          </Stack>
        </Paper>

        <div className={styles.sectionHeader}>
          <Divider className={styles.divider} />
          <div className={styles.sectionTitle}>Fields</div>
          <Button
            variant="filled"
            size="sm"
            className={styles.newButton}
            type="button"
            aria-label="Add new field"
            onClick={() => {
              // Emit a custom event that child components can listen for to add a new field
              const e = new CustomEvent("promptform:add-field");
              window.dispatchEvent(e);
            }}
          >
            + New
          </Button>
        </div>

        <PromptFormInput
          type={
            promptTypes?.find((type) => type.id === form.values?.typeId)
              ?.name as PromptInstructionType
          }
          form={form}
        />

        <div className={styles.actions}>
          <Button
            rightSection={<IconDeviceFloppy />}
            type="submit"
            className={styles.saveButton}
          >
            {submitLabel}
          </Button>
        </div>
      </Box>
    </div>
  );
};
