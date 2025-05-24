import React from "react";
import {
  Paper,
  Title,
  Select,
  TextInput,
  Button,
  Flex,
  Group,
} from "@mantine/core";
import styles from "./PromptFormForm.module.css";
import type { PromptForm } from "~/models/PromptFormMOdel";
import { useForm } from "@mantine/form";
import { useGetAllPromptTypes } from "~/queries/promptTypesQueries";
import type { PromptType } from "~/models/PromptTypeModel";
import PromptFormInput from "../PromptFormInput";
import { IconDeviceFloppy } from "@tabler/icons-react";
import type { PromptInstructionType } from "~/config/prompt-generator/useForm";
import type { PromptCategory } from "~/models/PromptCategoryModel";
import { useGetAllPromptCategories } from "~/queries/promptCategoryQueries";

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

  React.useEffect(() => {
    if (promptTypes && promptTypes.length > 0 && !form.values.typeId) {
      const typeId = promptTypes[0].id;
      form.setFieldValue("typeId", typeId);
    }
  }, [promptTypes, form]);

  return (
    <div className={styles.container}>
      <Paper
        className={styles.formWrapper}
        shadow="0"
        radius="md"
        component="form"
        onSubmit={form.onSubmit((values) => onSubmit?.(values as PromptForm))}
      >
        <Group grow mb={"xs"}>
          <Select
            placeholder="Select a category"
            label="Select Category"
            value={categoryId}
            onChange={(value) => {
              if (value) {
                setCategoryId(value);
              }
            }}
            data={
              promptCategories?.map((category) => ({
                value: `${category.id}`,
                label: category.name,
              })) ?? []
            }
          />
          <Select
            placeholder="Select a prompt type"
            label="Select Prompt Type"
            {...form.getInputProps("typeId")}
            data={
              promptTypes?.map((type) => ({
                value: `${type.id}`,
                label: type.name,
              })) ?? []
            }
            value={form.values.typeId?.toString()}
            onChange={(value) => {
              if (value) {
                form.setFieldValue("typeId", Number(value));
              }
            }}
          />
          <TextInput {...form.getInputProps("name")} label="Prompt Name" />
        </Group>
        <PromptFormInput
          type={
            promptTypes?.find((type) => type.id === form.values?.typeId)
              ?.name as PromptInstructionType
          }
          form={form}
        />
        <Button
          rightSection={<IconDeviceFloppy />}
          type="submit"
          style={{ marginTop: 24 }}
        >
          {submitLabel}
        </Button>
      </Paper>
    </div>
  );
};
