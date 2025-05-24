import React from "react";
import {
  Select,
  Textarea,
  Slider,
  Text,
  Group,
  Badge,
  Title,
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
    <div className={styles.container}>
      {/* Basic Configuration Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <IconSettings className={styles.sectionIcon} />
          <div>
            <Title order={3} className={styles.sectionTitle}>
              Basic Configuration
            </Title>
            <Text className={styles.sectionDescription}>
              Configure the fundamental settings for your agent
            </Text>
          </div>
        </div>

        <div className={styles.configRow}>
          <div className={styles.modelContainer}>
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
          </div>

          <div className={styles.modelContainer}>
            <Select
              value={agentData?.conversation_config?.tts?.model_id}
              onChange={(value) => {
                onUpdateAgentData({
                  conversation_config: {
                    ...(agentData?.conversation_config || {}),
                    tts: {
                      ...(agentData?.conversation_config?.tts || {}),
                      model_id: value,
                    },
                  },
                });
              }}
              label="Voice Model"
              description="Select the TTS model for voice responses"
              data={["eleven_flash_v2_5"]}
              leftSection={<IconRobot size={16} />}
            />
          </div>
        </div>
      </div>

      {/* First Message Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <IconMessageCircle className={styles.sectionIcon} />
          <div>
            <Title order={3} className={styles.sectionTitle}>
              First Message
            </Title>
            <Text className={styles.sectionDescription}>
              Set the initial message your agent will send to users
            </Text>
          </div>
        </div>

        <Textarea
          placeholder="Enter the first message your agent will send..."
          rows={4}
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
      </div>

      {/* AI Personality Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <IconBrain className={styles.sectionIcon} />
          <div>
            <Title order={3} className={styles.sectionTitle}>
              AI Personality & Behavior
            </Title>
            <Text className={styles.sectionDescription}>
              Define your agent's identity, knowledge, and response style
            </Text>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <Select
            label="Predefined Prompt Template"
            description="Choose from existing prompt templates to quickly configure your agent"
            placeholder="Select a prompt template"
            clearable
            searchable
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
            data={
              prompts?.map((prompt) => ({
                value: prompt.generatedPrompt,
                label: `${prompt.name} - ${dayjs(prompt.createdAt).format(
                  "MMM DD, YYYY"
                )}`,
              })) || []
            }
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

          <div className={styles.sliderWrapper}>
            <div className={styles.temperatureContainer}>
              <Group justify="space-between" align="center">
                <div className={styles.fieldLabel}>
                  <IconBrain size={16} className={styles.fieldIcon} />
                  <Text size="sm" fw={500}>
                    Response Creativity (Temperature)
                  </Text>
                </div>
                <Badge
                  variant="light"
                  color="blue"
                  className={styles.temperatureValue}
                >
                  {(
                    agentData?.conversation_config?.agent?.prompt
                      ?.temperature ?? 0.7
                  ).toFixed(2)}
                </Badge>
              </Group>
              <Slider
                min={0}
                max={1.0}
                step={0.05}
                precision={2}
                value={
                  agentData?.conversation_config?.agent?.prompt?.temperature ??
                  0.7
                }
                onChange={(value: number) =>
                  onUpdateAgentData({
                    conversation_config: {
                      ...(agentData?.conversation_config || {}),
                      agent: {
                        ...(agentData?.conversation_config?.agent || {}),
                        prompt: {
                          ...(agentData?.conversation_config?.agent?.prompt ||
                            {}),
                          temperature: value,
                        },
                      },
                    },
                  })
                }
                marks={[
                  { value: 0, label: "Focused" },
                  { value: 0.5, label: "Balanced" },
                  { value: 1, label: "Creative" },
                ]}
                className={styles.temperatureSlider}
              />
              <Text size="xs" c="dimmed" className={styles.temperatureHelper}>
                Controls how creative and varied the responses are
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSettings;
