// AIPersonalityEditModal.tsx
import React, { useState } from "react";
import { Modal, Textarea, Button, Stack } from "@mantine/core";
import { IconDeviceFloppy, IconPencil, IconX } from "@tabler/icons-react";
import PromptTemplateSelect from "~/components/PromptTemplateSelect/PromptTemplateSelect";
import { useGetAllPrompts } from "~/modules/prompt-generator/queries/promptGeneratorQueries";
import styles from "./AIPersonality.module.css";

interface AIPersonalityEditModalProps {
  initialPrompt: string;
  onClose: () => void;
  onSave: (prompt: string) => void;
}

const AIPersonalityEditModal: React.FC<AIPersonalityEditModalProps> = ({
  initialPrompt,
  onClose,
  onSave,
}) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [editing, setEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>(initialPrompt);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  // Fetch all prompt templates
  const { data: prompts } = useGetAllPrompts();

  // Handle template selection
  const handleTemplateChange = (value: string | null) => {
    setSelectedTemplateId(value);
    if (!value) return;
    const template = prompts?.find((item) => item.id === Number(value));
    if (template?.generatedPrompt) {
      if (editing) {
        setDraft(template.generatedPrompt);
      } else {
        setPrompt(template.generatedPrompt);
        setDraft(template.generatedPrompt);
      }
    }
  };

  const handleEdit = () => {
    setDraft(prompt);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(prompt);
    setEditing(false);
  };

  const handleSave = () => {
    setPrompt(draft);
    onSave(draft);
    onClose();
  };

  return (
    <Stack>
      <PromptTemplateSelect
        value={selectedTemplateId}
        withPreview={false}
        onChange={handleTemplateChange}
        description="Choose a template to auto-fill the prompt. This will overwrite the current prompt."
        clearable
        searchable
      />
      <div className={styles.promptContainer}>
        {editing ? (
          <>
            <Textarea
              label="Custom Prompt"
              placeholder="Define your agent's personality, knowledge, and behavior..."
              rows={12}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              description="Write detailed instructions about how your agent should behave, what it knows, and how it should respond"
              className={styles.promptTextarea}
              autoFocus
            />
            <div className={styles.promptCounter}>
              {draft.length} characters
            </div>
          </>
        ) : (
          <>
            <label className={styles.promptLabel}>Custom Prompt</label>
            <div
              className={styles.promptDisplay}
              title={prompt}
              tabIndex={0}
              aria-label="Prompt"
            >
              {prompt || (
                <span className={styles.promptPlaceholder}>
                  Define your agent's personality, knowledge, and behavior...
                </span>
              )}
            </div>
            <div className={styles.promptCounter}>
              {prompt.length} characters
            </div>
          </>
        )}
      </div>
      <div className={styles.actionRow}>
        <Button
          color="red"
          variant="light"
          onClick={onClose}
          leftSection={<IconX size={18} />}
        >
          Close
        </Button>
        {!editing ? (
          <Button
            onClick={handleEdit}
            leftSection={<IconPencil size={18} />}
            variant="filled"
            className={styles.editButton}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              leftSection={<IconX size={18} />}
              variant="default"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={handleSave}
              variant="filled"
              color="blue"
            >
              Save
            </Button>
          </>
        )}
      </div>
    </Stack>
  );
};

export default AIPersonalityEditModal;
