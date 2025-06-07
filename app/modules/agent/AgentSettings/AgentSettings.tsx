import React from "react";
import {
  Select,
  Textarea,
  Slider,
  Text,
  Group,
  Badge,
  Stack,
} from "@mantine/core";
import {
  IconLanguage,
  IconMessageCircle,
  IconBrain,
  IconSettings,
  IconRobot,
} from "@tabler/icons-react";
import type { GetAgentResponseModel } from "elevenlabs/api";
import { useGetAllPrompts } from "~/modules/prompt-generator/queries/promptGeneratorQueries";
import dayjs from "dayjs";
import styles from "./AgentSettings.module.css";
import SectionCard from "../../../components/SectionCard";
import PromptTemplateSelect from "../../../components/PromptTemplateSelect";

// Define the props for AgentSettings
interface AgentSettingsProps {
  agentData: GetAgentResponseModel; // TODO: Define a more specific type for agentData
  onUpdateAgentData: (updatedFields: any) => void; // TODO: Define a more specific type for updatedFields
}

const AgentSettings: React.FC<AgentSettingsProps> = ({
  agentData,
  onUpdateAgentData,
}) => {
  // Find the language setting.
  const currentLanguage = agentData?.conversation_config?.agent?.language || "";
  const { data: prompts } = useGetAllPrompts();
  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
  ];

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      onUpdateAgentData({
        conversation_config: {
          ...(agentData?.conversation_config || {}),
          agent: {
            ...(agentData?.conversation_config?.agent || {}),
            language: value,
          },
        },
      });
    }
  };

  return (
    <Stack>
      {/* Basic Configuration Section */}
      <SectionCard
        icon={IconSettings}
        title="Basic Configuration"
        description="Configure the fundamental settings for your agent"
        className={styles.sectionCard}
        contentSpacing="lg"
      >
        <Select
          label="Language"
          placeholder="Select language"
          value={currentLanguage}
          onChange={handleLanguageChange}
          data={languageOptions}
          description="Choose the language for the agent's responses"
          searchable
          nothingFoundMessage="No language found"
          leftSection={<IconLanguage size={16} />}
        />
        <Textarea
          placeholder="Enter the first message your agent will send..."
          rows={4}
          label="Agent First Message"
          value={agentData?.conversation_config?.agent?.first_message || ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onUpdateAgentData({
              conversation_config: {
                ...(agentData?.conversation_config || {}),
                agent: {
                  ...(agentData?.conversation_config?.agent || {}),
                  first_message: e.target.value,
                },
              },
            })
          }
          description="This greeting message will be the first thing users see when they interact with your agent"
        />
      </SectionCard>

      {/* AI Personality Section */}
      <SectionCard
        icon={IconBrain}
        title="AI Personality & Behavior"
        description="Define your agent's identity, knowledge, and response style"
        className={styles.sectionCard}
        contentSpacing="lg"
      >
        <div className={styles.fieldGroup}>
          <PromptTemplateSelect
            value={agentData?.conversation_config?.agent?.prompt?.prompt || ""}
            onChange={(value) => {
              onUpdateAgentData({
                conversation_config: {
                  ...(agentData?.conversation_config || {}),
                  agent: {
                    ...(agentData?.conversation_config?.agent || {}),
                    prompt: {
                      ...(agentData?.conversation_config?.agent?.prompt || {}),
                      prompt: value,
                    },
                  },
                },
              });
            }}
            description="Choose from existing prompt templates to quickly configure your agent"
            placeholder="Select a prompt template"
            clearable
            searchable
          />

          <div className={styles.promptContainer}>
            <Textarea
              label="Custom Prompt"
              placeholder="Define your agent's personality, knowledge, and behavior..."
              rows={12}
              value={
                agentData?.conversation_config?.agent?.prompt?.prompt || ""
              }
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onUpdateAgentData({
                  conversation_config: {
                    ...(agentData?.conversation_config || {}),
                    agent: {
                      ...(agentData?.conversation_config?.agent || {}),
                      prompt: {
                        ...(agentData?.conversation_config?.agent?.prompt ||
                          {}),
                        prompt: e.target.value,
                      },
                    },
                  },
                })
              }
              description="Write detailed instructions about how your agent should behave, what it knows, and how it should respond"
              className={styles.promptTextarea}
            />
            <div className={styles.promptCounter}>
              {
                (agentData?.conversation_config?.agent?.prompt?.prompt || "")
                  .length
              }{" "}
              characters
            </div>
          </div>
        </div>
      </SectionCard>
    </Stack>
  );
};

export default AgentSettings;
