import React from "react";
import { Select, Loader, Text, Center, Stack, Textarea } from "@mantine/core";
import type { SelectProps } from "@mantine/core";
import styles from "./PromptTemplateSelect.module.css";
import { useGetAllPrompts } from "~/modules/prompt-generator/queries/promptGeneratorQueries";
import dayjs from "dayjs";

interface PromptTemplateSelectProps
  extends Omit<SelectProps, "data" | "onChange" | "value"> {
  value: string | null;
  onChange: (value: string | null) => void;
  description?: string;
  placeholder?: string;
  withPreview?: boolean;
  clearable?: boolean;
  searchable?: boolean;
}

export const PromptTemplateSelect: React.FC<PromptTemplateSelectProps> = ({
  value,
  onChange,
  description,
  placeholder = "Select a prompt template",
  clearable = true,
  searchable = true,
  withPreview = true,
  ...rest
}) => {
  const { data: prompts, isLoading, isError } = useGetAllPrompts();

  if (isLoading) {
    return (
      <Center className={styles.promptTemplateSelect}>
        <Loader size="sm" />
        <Text ml="sm" size="sm">
          Loading prompt templates...
        </Text>
      </Center>
    );
  }

  if (isError) {
    return (
      <Text c="red" size="sm" className={styles.promptTemplateSelect}>
        Failed to load prompt templates.
      </Text>
    );
  }

  const options =
    prompts?.map((prompt) => ({
      value: `${prompt.id}`,
      label: `${prompt.name} - ${dayjs(prompt.createdAt).format(
        "MMM DD, YYYY"
      )}`,
    })) || [];

  if (options.length === 0) {
    return (
      <Text size="sm" className={styles.promptTemplateSelect}>
        No prompt templates available.
      </Text>
    );
  }
  console.log({
    id: value,
    prompts,
  });
  return (
    <Stack gap="xs">
      <Select
        label="Prompt Template"
        description={description}
        placeholder={placeholder}
        clearable={clearable}
        searchable={searchable}
        value={value}
        onChange={onChange}
        data={options}
        className={styles.promptTemplateSelect}
        {...rest}
      />
      {withPreview && (
        <Textarea
          label="Prompt Preview"
          value={
            prompts?.find((item) => item.id == Number(value))
              ?.generatedPrompt || ""
          }
          readOnly
          className={styles.customPromptTextarea}
          autosize
          minRows={8}
          maxRows={16}
          styles={{
            input: {
              backgroundColor: "#f8f9fa",
              fontFamily: "monospace",
              fontSize: 14,
              color: "#222",
              opacity: 1,
              cursor: "default",
            },
          }}
        />
      )}
    </Stack>
  );
};

export default PromptTemplateSelect;
