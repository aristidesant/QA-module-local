import React from "react";
import { TextInput, Textarea, Group, Button, Stack } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { type UseFormReturnType } from "@mantine/form";
import styles from "./PromptInputForm.module.css";

interface PromptInputFormProps {
  form: UseFormReturnType<any>; // Replace 'any' with your form values type if available
}

export const PromptInputForm: React.FC<PromptInputFormProps> = ({ form }) => {
  return (
    <Stack gap="lg">
      <TextInput
        label="Agent Name"
        placeholder="E.g., Marketing Maestro, Tech Guru"
        {...form.getInputProps("agentName")}
        required
        size="md"
      />
      <Textarea
        label="Agent Role"
        placeholder="Describe the agent's primary function or specialty (e.g., a customer support specialist for SaaS products, a creative content generator for social media campaigns)."
        {...form.getInputProps("agentRole")}
        required
        autosize
        minRows={4}
        size="md"
      />
      <Textarea
        label="Agent Tone"
        placeholder="Define the agent's communication style (e.g., formal and respectful, friendly and casual, humorous and witty, empathetic and understanding, inspiring and motivational)."
        {...form.getInputProps("agentTone")}
        required
        autosize
        minRows={3}
        size="md"
      />
      <Textarea
        label="Company/Product Information"
        placeholder="Provide key details about the company or product (e.g., mission: 'To democratize AI education', brand values: 'Innovation, Accessibility, Community', USP: 'Interactive, gamified learning modules for AI concepts')."
        {...form.getInputProps("companyProductInfo")}
        required
        autosize
        minRows={4}
        size="md"
      />
      <Textarea
        label="Target Audience"
        placeholder="Describe the intended users (e.g., beginner Python developers, marketing professionals in e-commerce, high school students interested in STEM)."
        {...form.getInputProps("targetAudience")}
        required
        autosize
        minRows={3}
        size="md"
      />
      <Group justify="center" mt="xl">
        <Button
          type="submit"
          leftSection={<IconSend size={20} />}
          size="lg"
          variant="gradient"
          gradient={{ from: "blue", to: "cyan", deg: 90 }}
        >
          Generate Prompt
        </Button>
      </Group>
    </Stack>
  );
};
