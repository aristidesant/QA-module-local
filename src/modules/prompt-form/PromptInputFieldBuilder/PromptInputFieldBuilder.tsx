import { Stack, TextInput } from "@mantine/core";
import styles from "./PromptInputFieldBuilder.module.css";
import React from "react";
import type { PromptGeneratorFormField } from "~/config/prompt-generator/generatorForm";

interface PromptInputFieldBuilderProps {
  onSave: (field: PromptGeneratorFormField) => void;
  onCancel?: () => void;
  field?: PromptGeneratorFormField; // Optional, for editing
}

export default function PromptInputFieldBuilder({
  onSave,
  field,
}: PromptInputFieldBuilderProps) {
  const [activeField, setActiveField] = React.useState<
    Partial<PromptGeneratorFormField>
  >({});

  React.useEffect(() => {
    if (field) {
      setActiveField(field);
    } else {
      setActiveField({});
    }
  }, [field]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setActiveField((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Expose save via custom event for modal button
  React.useEffect(() => {
    const handler = () => {
      handleSave();
    };
    window.addEventListener("submit-prompt-field", handler);
    return () => window.removeEventListener("submit-prompt-field", handler);
    // eslint-disable-next-line
  }, [activeField, field]);

  const handleSave = () => {
    const name =
      field?.name || activeField.label?.toLowerCase().replace(/\s+/g, "_");
    const fieldToSave: Partial<PromptGeneratorFormField> = {
      ...activeField,
      name,
    };
    if (activeField) {
      onSave(fieldToSave as PromptGeneratorFormField);
      setActiveField({});
    }
  };

  return (
    <Stack gap={8} className={styles.inputsStack} style={{ width: "100%" }}>
      <TextInput
        className={styles.inputFlex}
        label="Label"
        name="label"
        value={activeField?.label ?? ""}
        onChange={handleInputChange}
        size="md"
        radius="md"
        required
        autoComplete="off"
        styles={{
          input: { fontSize: 16, padding: "0.75rem 1rem" },
          label: { fontWeight: 600, fontSize: 15 },
        }}
      />
      <TextInput
        className={styles.inputFlex}
        label="Description"
        name="description"
        value={activeField?.description ?? ""}
        onChange={handleInputChange}
        size="md"
        radius="md"
        autoComplete="off"
        styles={{
          input: { fontSize: 15, padding: "0.7rem 1rem" },
          label: { fontWeight: 500, fontSize: 14 },
        }}
      />
      <TextInput
        className={styles.inputFlex}
        label="Placeholder"
        name="placeholder"
        value={activeField?.placeholder ?? ""}
        onChange={handleInputChange}
        size="md"
        radius="md"
        autoComplete="off"
        styles={{
          input: { fontSize: 15, padding: "0.7rem 1rem" },
          label: { fontWeight: 500, fontSize: 14 },
        }}
      />
    </Stack>
  );
}
