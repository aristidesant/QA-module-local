import React from "react";
import { Select, Textarea, Slider, Text, Stack } from "@mantine/core";
import type { GetAgentResponseModel } from "elevenlabs/api";
import { useGetAllPrompts } from "~/modules/prompt-generator/queries/promptGeneratorQueries";
import dayjs from "dayjs";

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
      <Select
        label="Language"
        placeholder="Select language"
        value={currentLanguage}
        onChange={handleLanguageChange}
        data={languageOptions}
        description="Choose the language for the agent's responses."
        searchable
        nothingFoundMessage="No language found"
      />

      <Textarea
        label="First Message"
        id="first-message"
        placeholder="Enter the first message..."
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
        description="This is the initial message the agent will send to the user."
        className="resize-none"
      />
      <Select
        label="Predefined Prompt"
        description="Use an existing prompt to set the agent's identity."
        placeholder="Select a prompt"
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
            label: `${prompt.identifier} - ${dayjs(prompt.createdAt).format(
              "YYYY-MM-DD HH:mm:ss"
            )}`,
          })) || []
        }
      />

      <Textarea
        label="Prompt"
        id="prompt"
        placeholder="Define the agent's identity..."
        rows={12}
        value={agentData?.conversation_config?.agent?.prompt?.prompt || ""}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onUpdateAgentData({
            conversation_config: {
              ...(agentData?.conversation_config || {}),
              agent: {
                ...(agentData?.conversation_config?.agent || {}),
                prompt: {
                  ...(agentData?.conversation_config?.agent?.prompt || {}),
                  prompt: e.target.value,
                },
              },
            },
          })
        }
        description="Define the agent's identity and how it should behave."
        className="resize-none"
      />

      <div className="grid gap-2">
        <Text size="sm" fw={500}>
          Temperature
        </Text>
        <div className="flex items-center gap-2">
          <Slider
            id="temperature"
            min={0}
            max={1.0}
            step={0.05}
            precision={2}
            value={
              agentData?.conversation_config?.agent?.prompt?.temperature ?? 0.7
            }
            onChange={(value: number) =>
              onUpdateAgentData({
                conversation_config: {
                  ...(agentData?.conversation_config || {}),
                  agent: {
                    ...(agentData?.conversation_config?.agent || {}),
                    prompt: {
                      ...(agentData?.conversation_config?.agent?.prompt || {}),
                      temperature: value,
                    },
                  },
                },
              })
            }
            label={(value) => value.toFixed(2)}
            className="flex-1"
          />
        </div>
        <Text size="xs" c="dimmed">
          Controls randomness: Lower values make responses more focused, higher
          values make them more creative. Default is 0.7.
        </Text>
      </div>
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
        label="Model"
        name="model_id"
        data={["eleven_flash_v2_5"]}
      />
    </Stack>
  );
};

export default AgentSettings;
