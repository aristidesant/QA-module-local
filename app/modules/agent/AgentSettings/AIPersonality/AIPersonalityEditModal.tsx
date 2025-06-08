// AIPersonalityEditModal.tsx
import React, { useState } from "react";
import { Modal, Textarea, Button, Stack } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import PromptTemplateSelect from "../../../../components/PromptTemplateSelect";
import styles from "./AIPersonality.module.css";

interface AIPersonalityEditModalProps {
  opened: boolean;
  initialPrompt: string;
  onClose: () => void;
  onSave: (prompt: string) => void;
}

const AIPersonalityEditModal: React.FC<AIPersonalityEditModalProps> = ({
  opened,
  initialPrompt,
  onClose,
  onSave,
}) => {
  const [prompt, setPrompt] = useState<string | null>(initialPrompt);

  return (
    <Stack>
      <PromptTemplateSelect
        value={prompt}
        onChange={setPrompt}
        description="Choose from existing prompt templates to quickly configure your agent"
        placeholder="Select a prompt template"
        clearable
        searchable
      />
      <div className={styles.promptContainer}>
        <Textarea
          label="Custom Prompt"
          placeholder="Define your agent's personality, knowledge, and behavior..."
          rows={12}
          value={prompt ?? ""}
          onChange={(e) => setPrompt(e.target.value)}
          description="Write detailed instructions about how your agent should behave, what it knows, and how it should respond"
          className={styles.promptTextarea}
        />
        <div className={styles.promptCounter}>{prompt?.length} characters</div>
      </div>
      <Button
        leftSection={<IconDeviceFloppy size={18} />}
        onClick={() => {
          onSave(prompt ?? "");
          onClose();
        }}
        fullWidth
        mt="md"
      >
        Save
      </Button>
    </Stack>
  );
};

export default AIPersonalityEditModal;
