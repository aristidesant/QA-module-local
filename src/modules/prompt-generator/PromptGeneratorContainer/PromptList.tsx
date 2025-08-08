import React from "react";
import { Paper, Title, Group, Text, Button } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useFetcher } from "react-router";
import styles from "./PromptGeneratorContainer.module.css";

interface PromptListProps {
  prompts: any[];
}

export const PromptList: React.FC<PromptListProps> = ({ prompts }) => {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state === "submitting";

  return (
    <Paper className={styles.promptListPaper} withBorder>
      <Title order={4} className={styles.outputTitle}>
        Saved Prompts
      </Title>
      {prompts.length === 0 ? (
        <Text>No prompts found.</Text>
      ) : (
        <ul className={styles.promptListUl}>
          {prompts.map((prompt, idx) => (
            <li key={idx} className={styles.promptListItem}>
              <div className={styles.promptListContent}>
                <Text fw={600}>
                  {prompt.context || prompt.productDescription}
                </Text>
                <Text size="sm" c="dimmed">
                  {prompt.toneStyle} | {prompt.status}
                </Text>
              </div>
              <Group gap="xs">
                <fetcher.Form method="delete">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={prompt.id} />
                  <Button
                    type="submit"
                    variant="subtle"
                    color="red"
                    size="xs"
                    leftSection={<IconTrash size={16} />}
                    loading={isDeleting}
                  >
                    Delete
                  </Button>
                </fetcher.Form>
              </Group>
            </li>
          ))}
        </ul>
      )}
    </Paper>
  );
};
