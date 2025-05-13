import React from "react";
import {
  TextInput,
  Textarea,
  Group,
  Button,
  Stack,
  Paper,
  Divider,
  Title,
  Card,
  SimpleGrid,
} from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { type UseFormReturnType } from "@mantine/form";
import styles from "./PromptInputForm.module.css";
import usePromptGeneratorFormDefinition, {
  type PromptInstructionType,
} from "~/config/prompt-generator/useForm";

interface PromptInputFormProps {
  form: UseFormReturnType<Record<string, string>>;
  type?: PromptInstructionType;
}

export const PromptInputForm: React.FC<PromptInputFormProps> = ({
  form,
  type,
}) => {
  const formDefinition = usePromptGeneratorFormDefinition(
    type || "CLIENT SUPPORT"
  );
  return (
    <Stack gap="xl">
      <Title order={3} className={styles.sectionTitle}>
        Agent Details
      </Title>
      <SimpleGrid cols={{ base: 1 }} spacing="lg">
        {formDefinition?.fields.map((item) => (
          <Textarea
            key={item.label}
            label={item.label}
            placeholder={item.placeholder}
            {...form.getInputProps(item.name)}
            required
            size="md"
            description={item.description}
            className={styles.textareaField}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
};
