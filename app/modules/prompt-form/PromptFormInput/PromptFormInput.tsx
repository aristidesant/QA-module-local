import React from "react";
import {
  Button,
  Group,
  Paper,
  Tooltip,
  Collapse,
  Badge,
  Text,
  Divider,
  Flex,
} from "@mantine/core";
import { IconPlus, IconInfoCircle } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { PromptGeneratorFormField } from "~/config/prompt-generator/generatorForm";
import type { PromptForm } from "~/models/PromptFormMOdel";
import PromptInputFieldBuilder from "../PromptInputFieldBuilder/PromptInputFieldBuilder";
import styles from "./PromptFormInput.module.css";
import type { PromptInstructionType } from "~/config/prompt-generator/useForm";

type PromptFormInputProps = {
  form: UseFormReturnType<Partial<PromptForm>>;
  type: PromptInstructionType;
};

export default function PromptFormInput({ form, type }: PromptFormInputProps) {
  const [showFieldBuilder, setShowFieldBuilder] = React.useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = React.useState<
    number | null
  >(null);

  const fields = form.values.form?.fields ?? [];

  const handleAddField = () => {
    setEditingFieldIndex(null);
    setShowFieldBuilder((prev) => !prev);
  };

  const handleEditField = (index: number) => {
    setEditingFieldIndex(index);
    setShowFieldBuilder(true);
  };

  const handleSaveField = (field: PromptGeneratorFormField) => {
    if (!form.values.form) {
      form.setFieldValue("form", {
        type: type,
        fields: [field],
      });
    } else if (editingFieldIndex !== null) {
      // Edit existing field
      const updatedFields = [...fields];
      updatedFields[editingFieldIndex] = field;
      form.setFieldValue("form.fields", updatedFields);
    } else {
      // Add new field
      form.setFieldValue("form.fields", [...(fields ?? []), field]);
    }
    setShowFieldBuilder(false);
    setEditingFieldIndex(null);
  };

  return (
    <div className={styles.fieldsContainer}>
      <Divider label="Fields" mt="xl" />
      <div className={styles.addButtonGroup}>
        <Tooltip
          label={
            showFieldBuilder
              ? editingFieldIndex !== null
                ? "Hide field editor"
                : "Hide field builder"
              : "Add new field"
          }
          withArrow
          position="left"
        >
          <Button
            leftSection={<IconPlus size={16} />}
            variant={
              showFieldBuilder && editingFieldIndex === null
                ? "light"
                : "filled"
            }
            color="blue"
            size="compact-md"
            radius="md"
            className={styles.addButton}
            onClick={handleAddField}
          >
            {showFieldBuilder && editingFieldIndex === null
              ? "Cancel"
              : "Add field"}
          </Button>
        </Tooltip>
      </div>
      <Collapse
        in={showFieldBuilder}
        transitionDuration={180}
        transitionTimingFunction="ease"
      >
        <PromptInputFieldBuilder
          onSave={handleSaveField}
          field={
            editingFieldIndex !== null ? fields[editingFieldIndex] : undefined
          }
        />
      </Collapse>
      {fields.length === 0 && (
        <Paper
          className={styles.noFieldsPaper}
          radius="md"
          shadow="xs"
          withBorder
        >
          <Group gap="xs" align="center" justify="center">
            <IconInfoCircle size={18} color="#228be6" />
            <Text size="sm" c="dimmed">
              No fields defined yet. Start by adding your first field.
            </Text>
          </Group>
        </Paper>
      )}
      <div className={styles.fieldsListGrid}>
        {fields.map((field: PromptGeneratorFormField, index: number) => (
          <Paper
            key={index}
            className={styles.fieldPaper}
            radius="md"
            shadow="xs"
            withBorder
            onClick={() => handleEditField(index)}
            style={{ cursor: "pointer" }}
          >
            <Flex
              direction={"column"}
              align="start"
              className={styles.fieldHeader}
            >
              <Text className={styles.fieldName}>{field.label}</Text>
              <Text fz={"xs"} c="dimmed">
                {field.name}
              </Text>
            </Flex>
            {field.description && (
              <Text size="xs" c="dimmed" className={styles.fieldDescription}>
                {field.description}
              </Text>
            )}
            {field.placeholder && (
              <Text size="xs" c="gray.6" className={styles.fieldPlaceholder}>
                Placeholder: {field.placeholder}
              </Text>
            )}
          </Paper>
        ))}
      </div>
    </div>
  );
}
