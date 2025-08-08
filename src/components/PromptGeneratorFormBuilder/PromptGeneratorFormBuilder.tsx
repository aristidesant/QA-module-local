import { useForm } from "@mantine/form";
import {
  Button,
  TextInput,
  Checkbox,
  Select,
  Group,
  Title,
  Divider,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import styles from "./PromptGeneratorFormBuilder.module.css";
import type {
  PromptGeneratorForm,
  PromptGeneratorFormField,
} from "~/config/prompt-generator/generatorForm";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
];

export type PromptGeneratorFormBuilderProps = {
  onSubmit: (form: PromptGeneratorForm) => void;
  defaultType: string;
};

export const PromptGeneratorFormBuilder = ({
  onSubmit,
  defaultType,
}: PromptGeneratorFormBuilderProps) => {
  const form = useForm<PromptGeneratorForm>({
    initialValues: {
      type: defaultType as any,
      fields: [
        {
          label: "",
          name: "",
          placeholder: "",
          required: false,
          description: "",
          type: "text",
        },
      ],
    },
  });

  const handleAddField = () => {
    form.setFieldValue("fields", [
      ...form.values.fields,
      {
        label: "",
        name: "",
        placeholder: "",
        required: false,
        description: "",
        type: "text",
      },
    ]);
  };

  const handleRemoveField = (idx: number) => {
    form.setFieldValue(
      "fields",
      form.values.fields.filter((_, i) => i !== idx)
    );
  };

  const onFormSubmit = (values: PromptGeneratorForm) => {
    onSubmit(values);
    form.setValues({
      type: defaultType as any,
      fields: [
        {
          label: "",
          name: "",
          placeholder: "",
          required: false,
          description: "",
          type: "text",
        },
      ],
    });
    form.resetDirty();
  };

  return (
    <form className={styles.container} onSubmit={form.onSubmit(onFormSubmit)}>
      <Title order={3}>Prompt Generator Form Builder</Title>
      <Divider />
      {form.values.fields.map((_: PromptGeneratorFormField, idx: number) => (
        <Group key={idx} className={styles.fieldGroup}>
          <TextInput
            label="Label"
            placeholder="Field label"
            required
            className={styles.input}
            {...form.getInputProps(`fields.${idx}.label`)}
          />
          <TextInput
            label="Name"
            placeholder="field_name"
            required
            className={styles.input}
            {...form.getInputProps(`fields.${idx}.name`)}
          />
          <TextInput
            label="Placeholder"
            placeholder="Placeholder text"
            className={styles.input}
            {...form.getInputProps(`fields.${idx}.placeholder`)}
          />
          <TextInput
            label="Description"
            placeholder="Description"
            className={styles.input}
            {...form.getInputProps(`fields.${idx}.description`)}
          />
          <Select
            label="Type"
            data={FIELD_TYPES}
            required
            className={styles.input}
            {...form.getInputProps(`fields.${idx}.type`)}
          />
          <Checkbox
            label="Required"
            className={styles.checkbox}
            checked={form.values.fields[idx].required}
            {...form.getInputProps(`fields.${idx}.required`, {
              type: "checkbox",
            })}
          />
          <Button
            variant="subtle"
            color="red"
            className={styles.removeButton}
            onClick={() => handleRemoveField(idx)}
            leftSection={<IconTrash size={16} />}
            type="button"
            aria-label="Remove field"
          >
            Remove
          </Button>
        </Group>
      ))}
      <Button
        className={styles.addButton}
        leftSection={<IconPlus size={18} />}
        variant="light"
        onClick={handleAddField}
        type="button"
      >
        Add Field
      </Button>
      <Button
        className={styles.submitButton}
        type="submit"
        variant="filled"
        color="blue"
      >
        Save Form
      </Button>
    </form>
  );
};
