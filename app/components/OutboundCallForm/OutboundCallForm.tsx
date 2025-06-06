import React from "react";
import { useForm } from "@mantine/form";
import {
  Button,
  Select,
  TextInput,
  Group,
  Text,
  Paper,
  Tooltip,
} from "@mantine/core";
import { IconPhone, IconX, IconUser } from "@tabler/icons-react";
import classes from "./OutboundCallForm.module.css";
import type AgentListObject from "~/models/AgentListObject";
import { useStartDemoConversation } from "~/queries/conversationsQueries";
import { notifications } from "@mantine/notifications";

export type OutboundCallFormValues = {
  agentId: string;
  countryCode: string;
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
      countryCode: "+1",
      phoneNumber: "",
    },
    validate: {
      agentId: (value) => (!value ? "Agent is required" : null),
      phoneNumber: (value) =>
        !/^\d{10}$/.test(value) ? "Enter a valid 10-digit phone number" : null,
    },
  });

  console.log();

  const handleSubmit = async (values: OutboundCallFormValues) => {
    try {
      await startDemoConversation.mutateAsync({
        agentId: agent.id,
        phoneNumber: `${values.countryCode}${values.phoneNumber}`,
      });
      notifications.show({
        title: "Test Call Sent",
        message: `A test call has been sent to ${values.countryCode}${values.phoneNumber}.`,
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
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      className={classes.container}
      autoComplete="off"
    >
      <Group gap="md" align="center" className={classes.agentRow}>
        <div className={classes.agentAvatar}>
          <IconUser size={22} />
        </div>
        <div className={classes.agentInfo}>
          <Text fw={600} size="md" className={classes.agentName}>
            {agent.name}
          </Text>
        </div>
      </Group>
      <Group gap="xs" align="flex-end">
        <Tooltip label="Country code" withArrow>
          <Select
            data={[{ label: "🇺🇸 +1", value: "+1" }]}
            size="md"
            w={90}
            disabled
            {...form.getInputProps("countryCode")}
          />
        </Tooltip>
        <TextInput
          placeholder="Phone number"
          size="md"
          maxLength={10}
          type="tel"
          flex={1}
          inputMode="numeric"
          autoComplete="off"
          {...form.getInputProps("phoneNumber")}
        />
      </Group>
      <Group className={classes.actions} mt="md">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconX size={18} />}
          onClick={onClose}
          type="button"
        >
          Close
        </Button>
        <Button
          type="submit"
          leftSection={<IconPhone size={18} />}
          disabled={!isValid}
          loading={loading}
        >
          Send Test Call
        </Button>
      </Group>
    </form>
  );
};
