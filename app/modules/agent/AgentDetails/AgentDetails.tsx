import React, { useState, useRef, useEffect } from "react";
import {
  IconUser,
  IconSettings,
  IconMicrophone,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import {
  Tabs,
  Paper,
  Avatar,
  Title,
  Group,
  Stack,
  Badge,
  Button,
  TextInput,
} from "@mantine/core";
import AgentSettings from "../AgentSettings";
import AgentVoiceSettings from "../AgentVoiceSettings/AgentVoiceSettings";
import styles from "./AgentDetails.module.css";
import { useFetcher } from "react-router";
import { jsonToFormData } from "~/utils/formUtils";
import type { GetAgentResponseModel } from "elevenlabs/api";

export type AgentDetailsProps = {
  agent: GetAgentResponseModel;
};

const AgentDetails: React.FC<AgentDetailsProps> = ({ agent }) => {
  const [editableAgent, setEditableAgent] = useState(agent);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher();

  const handleAgentUpdate = (updatedFields: any) => {
    setEditableAgent((prev: any) => ({
      ...prev,
      ...updatedFields,
    }));
  };
  
  const { agent_id } = agent;
  const { name } = editableAgent;

  // Focus the input when edit mode is activated
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameClick = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAgentUpdate({ name: e.target.value });
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditingName(false);
    } else if (e.key === "Escape") {
      // Revert to original value and exit edit mode
      handleAgentUpdate({ name: agent.name });
      setIsEditingName(false);
    }
  };

  const tabs = [
    {
      label: "Agent",
      value: "agent",
      icon: <IconSettings size={16} />,
      content: (
        <AgentSettings
          agentData={editableAgent}
          onUpdateAgentData={handleAgentUpdate}
        />
      ),
    },
    {
      label: "Voice",
      value: "voice",
      icon: <IconMicrophone size={16} />,
      content: (
        <AgentVoiceSettings
          agentData={editableAgent}
          onUpdateAgentData={handleAgentUpdate}
        />
      ),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = JSON.stringify(editableAgent);
    // Create a plain object with the editable fields
    const formData = {
      data,
      agent_id, // Ensure the agent_id is included
    };

    // Submit using the fetcher
    fetcher.submit(formData, {
      method: "post",
      action: `/agent/${agent_id}`,
    });
  };

  console.log({ fData: fetcher.data });
  const isSubmitting = fetcher.state === "submitting";

  return (
    <Paper className={styles.container} withBorder>
      <Group className={styles.header}>
        <Avatar size="xl" radius="xl">
          <IconUser className={styles.avatarIcon} />
        </Avatar>
        <Stack gap="xs">
          {isEditingName ? (
            <TextInput
              ref={nameInputRef}
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className={styles.nameInput}
              variant="unstyled"
              size="lg"
              autoComplete="off"
            />
          ) : (
            <Title
              order={3}
              className={`${styles.agentName} ${styles.editableName}`}
              onClick={handleNameClick}
            >
              {name}
            </Title>
          )}
          <Badge className={styles.agentIdBadge} variant="light">
            ID: {agent_id}
          </Badge>
        </Stack>
      </Group>

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="agent_id" value={agent_id} />

        <Tabs defaultValue={tabs[0].value} className={styles.tabs}>
          <Tabs.List className={styles.tabsList}>
            {tabs.map((tab) => (
              <Tabs.Tab
                key={tab.value}
                value={tab.value}
                leftSection={tab.icon}
                className={styles.tabItem}
              >
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {tabs.map((tab) => (
            <Tabs.Panel
              key={tab.value}
              value={tab.value}
              className={styles.tabPanel}
            >
              {tab.content}
            </Tabs.Panel>
          ))}
        </Tabs>
        <Group justify="flex-end" mt="xl">
          <Button
            type="submit"
            loading={isSubmitting}
            className={styles.saveButton}
            leftSection={!isSubmitting && <IconDeviceFloppy size={18} />}
          >
            Save Changes
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default AgentDetails;
