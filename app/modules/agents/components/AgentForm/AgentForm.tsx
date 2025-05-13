import React, { useEffect, useState } from "react";
import {
  Button,
  Text,
  TextInput,
  Stack,
  Paper,
  Notification,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { BodyCreateAgentV1ConvaiAgentsCreatePost } from "elevenlabs/api";
import { IconDeviceFloppy, IconCheck } from "@tabler/icons-react";
import styles from "./AgentForm.module.css";
import { useFetcher } from "react-router";

interface AgentFormProps {
  agent?: BodyCreateAgentV1ConvaiAgentsCreatePost | null;
  onSave: (agent: Partial<BodyCreateAgentV1ConvaiAgentsCreatePost>) => void;
  loading?: boolean;
  error?: string | null;
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
}: AgentFormProps) {
  const fetcher = useFetcher();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    initialValues: agent || DEFAULT_VALUES,
  });

  // Reset when agent prop changes
  useEffect(() => {
    if (agent) {
      form.setValues(agent);
    }
  }, [agent]);

  // Handle fetcher responses
  useEffect(() => {
    if (fetcher.data?.success) {
      onSave(fetcher.data.agent || {});
    } else if (fetcher.data?.error) {
      setFormError(fetcher.data.error);
    }
  }, [fetcher.data]);

  const handleSubmit = (values: typeof form.values) => {
    setFormError(null);
    fetcher.submit(
      {
        data: JSON.stringify(values),
      },
      {
        method: "post",
        action: "/agent",
      }
    );
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
          {fetcher.data?.success && (
            <Notification
              icon={<IconCheck size={18} />}
              color="green"
              withCloseButton={false}
            >
              Agent saved successfully!
            </Notification>
          )}

          <Button
            type="submit"
            loading={loading || fetcher.state === "submitting"}
            leftSection={<IconDeviceFloppy size={18} />}
            fullWidth
            mt={10}
          >
            {agent ? "Update Agent" : "Create Agent"}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
