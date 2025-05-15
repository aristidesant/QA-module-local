import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, Stack, Paper } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { BodyCreateAgentV1ConvaiAgentsCreatePost } from "elevenlabs/api";
import { IconDeviceFloppy, IconCheck } from "@tabler/icons-react";
import styles from "./AgentForm.module.css";
import { useCreateAgent, useUpdateAgent } from "~/queries/agentQueries";
import { notifications } from "@mantine/notifications";
import { useRevalidator } from "react-router";

interface AgentFormProps {
  agent?: BodyCreateAgentV1ConvaiAgentsCreatePost | null;
  onSave: (agent: Partial<BodyCreateAgentV1ConvaiAgentsCreatePost>) => void;
  loading?: boolean;
  error?: string | null;
  type?: "INBOUND" | "OUTBOUND";
}

const DEFAULT_VALUES: BodyCreateAgentV1ConvaiAgentsCreatePost = {
  name: "",
  conversation_config: {
    agent: {
      language: "en",
      first_message: "",
      prompt: {
        prompt: "",
        temperature: 0.7,
      },
    },
  },
};

export default function AgentForm({
  agent = null,
  onSave,
  loading = false,
  error = null,
  type,
}: AgentFormProps) {
  const { revalidate } = useRevalidator();
  const [formError, setFormError] = useState<string | null>(null);
  const createAgentMutation = useCreateAgent();

  const form = useForm({
    initialValues: agent || DEFAULT_VALUES,
  });

  // Reset when agent prop changes
  useEffect(() => {
    if (agent) {
      form.setValues(agent);
    }
  }, [agent]);

  // No useEffect needed for mutation state; handle everything in handleSubmit

  const handleSubmit = async (values: typeof form.values) => {
    setFormError(null);
    const agentType =
      type && (type === "INBOUND" || type === "OUTBOUND") ? type : "INBOUND";
    const payload = {
      ...values,
      type: agentType,
    };
    try {
      const data = await createAgentMutation.mutateAsync(payload);
      notifications.show({
        title: "Success",
        message: "Agent saved successfully!",
        color: "green",
        icon: <IconCheck size={18} />,
        autoClose: 3000,
      });
      revalidate();
    } catch (error: any) {
      setFormError(error?.message || "Failed to create agent.");
    }
  };

  return (
    <Paper className={styles.formContainer} p="md">
      <form
        key={form.key("")}
        onSubmit={(event) => {
          event.preventDefault();
          form.validate();
          if (form.isValid()) {
            handleSubmit(form.values);
          }
        }}
      >
        <Stack gap="md">
          <TextInput
            key={form.key("name")}
            label="Agent Name"
            placeholder="Enter a unique name for your agent"
            required
            {...form.getInputProps("name")}
          />

          {error && <Text c="red">{error}</Text>}
          {formError && <Text c="red">{formError}</Text>}

          <Button
            type="submit"
            loading={loading || createAgentMutation.isPending}
            leftSection={<IconDeviceFloppy size={18} />}
            fullWidth
            mt={10}
          >
            Create Agent
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
