import React from "react";
import { useForm } from "@mantine/form";
import {
  Button,
  TextInput,
  Text,
  Stack,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconPhone, IconX, IconStars } from "@tabler/icons-react";
import type AgentListObject from "~/models/AgentListObject";
import { useStartDemoConversation } from "~/queries/conversationsQueries";
import { notifications } from "@mantine/notifications";

export type OutboundCallFormValues = {
  agentId: string;
  phoneNumber: string;
};

export type OutboundCallFormProps = {
  agent: AgentListObject;
  onSuccess: () => void;
  onClose: () => void;
  loading?: boolean;
};

export const OutboundCallForm: React.FC<OutboundCallFormProps> = ({
  agent,
  onSuccess,
  onClose,
  loading = false,
}) => {
  const startDemoConversation = useStartDemoConversation();
  const form = useForm<OutboundCallFormValues>({
    initialValues: {
      agentId: agent?.id,
      phoneNumber: "",
    },
    validate: {
      agentId: (value) => (!value ? "Agent is required" : null),
      phoneNumber: (value) => {
        // Must start with +1, then 809, 829, or 849, then 7 digits
        if (!/^\+1(809|829|849)\d{7}$/.test(value)) {
          return "Enter a valid number: +1 followed by 809, 829, or 849 and 7 digits (e.g., +18093336600)";
        }
        return null;
      },
    },
  });

  console.log();

  const handleSubmit = async (values: OutboundCallFormValues) => {
    try {
      await startDemoConversation.mutateAsync({
        agentId: agent.id,
        phoneNumber: `${values.phoneNumber}`,
      });
      notifications.show({
        title: "Test Call Sent",
        message: `A test call has been sent to ${values.phoneNumber}.`,
        color: "green",
      });
      onSuccess();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to start demo conversation. Please try again.",
        color: "red",
      });
      console.error("Error starting demo conversation:", error);
    }
  };

  const isValid = form.isValid();

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} autoComplete="off">
      <Stack justify="center">
        <Stack align="center">
          <ThemeIcon radius={"lg"} variant="light" size={100}>
            <IconStars size={60} />
          </ThemeIcon>
          <Title order={5}>Agent Call</Title>
          <Text ta={"center"} c="dimmed" size="sm">
            Experience a live call from your AI agent. Enter your phone number
            and receive a demo to hear how your setup sounds in real
            conversation.
          </Text>
        </Stack>
        <TextInput
          placeholder="+18093336600"
          size="lg"
          variant="filled"
          radius={"md"}
          maxLength={13}
          type="tel"
          flex={1}
          inputMode="numeric"
          autoComplete="off"
          {...form.getInputProps("phoneNumber")}
        />
        <Button
          type="submit"
          size="lg"
          leftSection={<IconPhone size={18} />}
          disabled={!isValid}
          loading={loading}
        >
          Call me
        </Button>
        <Button
          variant="transparent"
          color="blue"
          size="lg"
          leftSection={<IconX size={18} />}
          onClick={onClose}
          type="button"
        >
          Cancel
        </Button>
      </Stack>
    </form>
  );
};
