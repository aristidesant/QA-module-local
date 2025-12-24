// PromptOutputDisplayMantineTextarea.tsx
import React from "react";
import { Textarea, Paper, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import styles from "./PromptOutputDisplay.module.css";

export interface PromptOutputDisplayProps {
  prompt?: string;
  title?: string;
}

export const PromptOutputDisplay: React.FC<PromptOutputDisplayProps> = ({
  prompt,
  title,
}) => {
  const { t } = useTranslation();
  return (
    <Paper className={styles.outputPaper} shadow="sm" radius="md" withBorder>
      <Title order={4} className={styles.outputTitle}>
        {title || t("promptGenerator.createdPromptColon")}
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
