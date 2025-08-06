import React from "react";
import { Modal, Button, Group, Title } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import PromptInputFieldBuilder from "./PromptInputFieldBuilder";
import type { PromptGeneratorFormField } from "~/config/prompt-generator/generatorForm";
import styles from "./PromptInputFieldBuilder.module.css";

interface PromptInputFieldModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (field: PromptGeneratorFormField) => void;
  field?: PromptGeneratorFormField;
}

export default function PromptInputFieldModal({
  opened,
  onClose,
  onSave,
  field,
}: PromptInputFieldModalProps) {
  const handleSave = (f: PromptGeneratorFormField) => {
    onSave(f);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title
          order={5}
          className={styles.sectionTitle}
          style={{ marginBottom: 0 }}
        >
          {field ? "Edit Field" : "Add New Field"}
        </Title>
      }
      centered
      radius="lg"
      padding="lg"
      withCloseButton
      classNames={{ title: styles.headerRow }}
    >
      <PromptInputFieldBuilder
        onSave={handleSave}
        onCancel={onClose}
        field={field}
      />
      <Group justify="flex-end" mt="sm" className={styles.buttonRow}>
        <Button
          leftSection={<IconPlus size={18} />}
          color="blue"
          variant="filled"
          onClick={() => {
            // Forward save from child
            const event = new CustomEvent("submit-prompt-field");
            window.dispatchEvent(event);
          }}
          size="sm"
          aria-label={field ? "Save changes" : "Add field"}
        >
          {field ? "Save" : "Add"}
        </Button>
        <Button
          leftSection={<IconX size={18} />}
          color="gray"
          variant="outline"
          onClick={onClose}
          className={styles.cancelButton}
          size="sm"
          aria-label="Cancel"
        >
          Cancel
        </Button>
      </Group>
    </Modal>
  );
}
