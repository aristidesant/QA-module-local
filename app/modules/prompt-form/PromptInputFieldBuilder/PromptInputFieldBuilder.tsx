import { ActionIcon, Button, TextInput } from "@mantine/core";
import styles from "./PromptInputFieldBuilder.module.css";
import React from "react";
import type { PromptGeneratorFormField } from "~/config/prompt-generator/generatorForm";
import { IconPlus } from "@tabler/icons-react";

type PromptInputFieldBuilderProps = {
  onSave: (field: PromptGeneratorFormField) => void;
  field?: PromptGeneratorFormField; // Optional, for editing
};

export default function PromptInputFieldBuilder({
  onSave,
  field,
}: PromptInputFieldBuilderProps) {
  const [activeField, setActiveField] = React.useState<
    Partial<PromptGeneratorFormField>
  >({});

  // Update state when editing a new field
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

  const handleSave = () => {
    // If editing, preserve the original name; otherwise, generate from label
    const name =
      field?.name || activeField.label?.toLowerCase().replace(/\s+/g, "_");
    const fieldToSave: Partial<PromptGeneratorFormField> = {
      ...activeField,
      name,
    };
    if (activeField) {
      onSave(fieldToSave as PromptGeneratorFormField);
      setActiveField({}); // Reset after saving
    }
  };

  return (
    <div className={styles.fieldBuilderRow}>
      <div className={styles.sectionTitle}>
        {field ? "Edit Field" : "Add New Field"}
      </div>
      <div
        style={{
          display: "flex",
          gap: "1.25rem",
          alignItems: "flex-end",
          width: "100%",
        }}
      >
        <TextInput
          className={styles.inputFlex}
          label="Label"
          name="label"
          value={activeField?.label ?? ""}
          onChange={handleInputChange}
        />
        <TextInput
          className={styles.inputFlex}
          label="Description"
          name="description"
          value={activeField?.description ?? ""}
          onChange={handleInputChange}
        />
        <TextInput
          className={styles.inputFlex}
          label="Placeholder"
          name="placeholder"
          value={activeField?.placeholder ?? ""}
          onChange={handleInputChange}
        />
      </div>
      <ActionIcon
        className={styles.saveButton}
        variant="filled"
        size="lg"
        color="blue"
        onClick={handleSave}
        aria-label={field ? "Save changes" : "Add field"}
      >
        <IconPlus />
      </ActionIcon>
    </div>
  );
}
