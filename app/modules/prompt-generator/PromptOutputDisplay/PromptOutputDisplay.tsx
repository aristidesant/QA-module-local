// PromptOutputDisplay.tsx
import React from "react";
import { Paper, Title, Textarea } from "@mantine/core";
import { type UseFormReturnType } from "@mantine/form";
import styles from "./PromptOutputDisplay.module.css";

interface PromptOutputDisplayProps {
  form: UseFormReturnType<any>; // swap `any` for your form type
}

export const PromptOutputDisplay: React.FC<PromptOutputDisplayProps> = ({
  form,
}) => (
  <Paper className={styles.outputPaper} withBorder>
    <Title order={4} className={styles.outputTitle}>
      Generated Prompt
    </Title>

    <Textarea
      placeholder="Your AI-crafted prompt will appear here…"
      {...form.getInputProps("generatedPrompt")}
      readOnly
      autosize
      minRows={20}
      variant="filled"
      className={styles.outputPromptWrapper}
      classNames={{ input: styles.outputPromptInput }}
    />
  </Paper>
);
