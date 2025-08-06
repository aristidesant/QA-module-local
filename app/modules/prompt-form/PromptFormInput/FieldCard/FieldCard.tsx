import React from "react";
import { Paper, Flex, Text, ActionIcon, Tooltip } from "@mantine/core";
import { IconTrash, IconEdit } from "@tabler/icons-react";
import type { PromptGeneratorFormField } from "~/config/prompt-generator/generatorForm";
import styles from "./FieldCard.module.css";

interface FieldCardProps {
  field: PromptGeneratorFormField;
  onEdit: () => void;
  onDelete: () => void;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, onEdit, onDelete }) => {
  return (
    <Paper
      className={styles.fieldPaper}
      radius="md"
      withBorder
      p="md"
      mb="md"
      bg="var(--mantine-color-body)"
      onClick={onEdit}
      style={{ cursor: "pointer", position: "relative" }}
      tabIndex={0}
      role="button"
      aria-label={`Edit field ${field.label}`}
    >
      <Flex direction="column" align="start" className={styles.fieldHeader}>
        <Text className={styles.fieldName}>{field.label}</Text>
        <Text fz="xs" c="dimmed">
          {field.name}
        </Text>
      </Flex>
      {field.description && (
        <Text size="xs" c="dimmed" className={styles.fieldDescription}>
          {field.description}
        </Text>
      )}
      {field.placeholder && (
        <Text size="xs" c="gray.6" className={styles.fieldPlaceholder}>
          Placeholder: {field.placeholder}
        </Text>
      )}
      <Flex className={styles.actionIcons} align="center" justify="end">
        <Tooltip label="Delete field" withArrow position="top">
          <ActionIcon
            color="red"
            size="sm"
            variant="subtle"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete field"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      </Flex>
    </Paper>
  );
};

export default FieldCard;
