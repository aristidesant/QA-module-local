import React from "react";
import { Group, Paper, Text, Stack } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { PromptGeneratorFormField } from "~/config/prompt-generator/generatorForm";
import PromptInputFieldModal from "../PromptInputFieldBuilder";
import FieldCard from "./FieldCard";
import styles from "./PromptFormInput.module.css";
import type { PromptInstructionType } from "~/config/prompt-generator/useForm";
import type { PromptForm } from "~/models/PromptFormModel";

type PromptFormInputProps = {
  form: UseFormReturnType<Partial<PromptForm>>;
  type: PromptInstructionType;
};

export default function PromptFormInput({ form, type }: PromptFormInputProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = React.useState<
    number | null
  >(null);

  const fields = form.values.form?.fields ?? [];

  const handleAddField = () => {
    setEditingFieldIndex(null);
    setModalOpen(true);
  };

  const handleEditField = (index: number) => {
    setEditingFieldIndex(index);
    setModalOpen(true);
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
    setModalOpen(false);
    setEditingFieldIndex(null);
  };

  const handleDeleteField = (index: number) => {
    if (!form.values.form) return;
    const updatedFields = fields.filter((_, i) => i !== index);
    form.setFieldValue("form.fields", updatedFields);
    // If editing the deleted field, close modal
    if (editingFieldIndex === index) {
      setModalOpen(false);
      setEditingFieldIndex(null);
    }
  };

  // Listen to a global event so the parent New button can open the add-field modal
  React.useEffect(() => {
    const onAdd = () => handleAddField();
    window.addEventListener("promptform:add-field", onAdd);
    return () => window.removeEventListener("promptform:add-field", onAdd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  return (
    <Stack gap={"xs"}>
      {/* Parent component renders the Fields header and New button. This component
          listens for the global `promptform:add-field` event to open the modal. */}
      <PromptInputFieldModal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingFieldIndex(null);
        }}
        onSave={handleSaveField}
        field={
          editingFieldIndex !== null ? fields[editingFieldIndex] : undefined
        }
      />
      {fields.length === 0 && (
        <Paper
          className={styles.noFieldsPaper}
          radius="md"
          withBorder
          p="md"
          mb="md"
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
          <FieldCard
            key={index}
            field={field}
            onEdit={() => handleEditField(index)}
            onDelete={() => handleDeleteField(index)}
          />
        ))}
      </div>
    </Stack>
  );
}
