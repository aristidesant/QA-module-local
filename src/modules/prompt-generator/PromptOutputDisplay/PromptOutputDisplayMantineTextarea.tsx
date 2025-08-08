// PromptOutputDisplayMantineTextarea.tsx
import React from "react";
import { Textarea, Paper, Title } from "@mantine/core";
import styles from "./PromptOutputDisplay.module.css";

export interface PromptOutputDisplayProps {
  prompt?: string;
  title?: string;
}

export const PromptOutputDisplay: React.FC<PromptOutputDisplayProps> = ({
  prompt,
  title = "Created Prompt:",
}) => {
  return (
    <Paper className={styles.outputPaper} shadow="sm" radius="md" withBorder>
      <Title order={4} className={styles.outputTitle}>
        {title}
      </Title>
      <Textarea
        className={styles.outputPromptInput}
        value={prompt}
        minRows={10}
        maxRows={20}
        readOnly
        autosize
        variant="filled"
        spellCheck={false}
      />
    </Paper>
  );
};
