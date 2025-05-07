import React from "react";
import { Slider, Text } from "@mantine/core";

// Define the props for AgentVoiceSettings
interface AgentVoiceSettingsProps {
  agentData: any; // TODO: Define a more specific type for agentData
  onUpdateAgentData: (updatedFields: any) => void; // TODO: Define a more specific type for updatedFields
}

const AgentVoiceSettings: React.FC<AgentVoiceSettingsProps> = ({
  agentData,
  onUpdateAgentData,
}) => {
  // Extract current TTS settings from agentData, providing defaults
  const optimizeStreamingLatency =
    agentData?.conversation_config?.tts?.optimize_streaming_latency ?? 3;
  const stability = agentData?.conversation_config?.tts?.stability ?? 0.5;
  const speed = agentData?.conversation_config?.tts?.speed ?? 1.0;
  const similarityBoost =
    agentData?.conversation_config?.tts?.similarity_boost ?? 0.8;

  // Helper function to create the update payload
  const createUpdatePayload = (ttsField: string, value: number) => ({
    conversation_config: {
      ...(agentData?.conversation_config || {}),
      tts: {
        ...(agentData?.conversation_config?.tts || {}),
        [ttsField]: value,
      },
    },
  });

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Optimize Streaming Latency Slider */}
      <div className="grid gap-2">
        <Text size="sm" fw={500}>
          Optimize streaming latency ({optimizeStreamingLatency})
        </Text>
        <Slider
          min={0}
          max={4} // Based on ElevenLabs documentation, 0-4
          step={1}
          value={optimizeStreamingLatency}
          onChange={(value: number) =>
            onUpdateAgentData(
              createUpdatePayload("optimize_streaming_latency", value)
            )
          }
          label={(value) => value}
          className="w-full"
        />
        <Text size="xs" c="dimmed">
          Configure latency optimizations for the speech generation. Latency can
          be optimized at the cost of quality. (0=Normal, 4=Max optimization)
        </Text>
      </div>

      {/* Stability Slider */}
      <div className="grid gap-2">
        <Text size="sm" fw={500}>
          Stability ({stability.toFixed(2)})
        </Text>
        <Slider
          min={0.0}
          max={1.0}
          step={0.01}
          precision={2}
          value={stability}
          onChange={(value: number) =>
            onUpdateAgentData(createUpdatePayload("stability", value))
          }
          label={(value) => value.toFixed(2)}
          className="w-full"
        />
        <Text size="xs" c="dimmed">
          Higher values make speech more consistent but potentially monotone.
          Lower values are more expressive but may lead to instabilities.
        </Text>
      </div>

      {/* Speed Slider */}
      <div className="grid gap-2">
        <Text size="sm" fw={500}>
          Speed ({speed.toFixed(2)})
        </Text>
        <Slider
          min={0.7} // Assuming a reasonable range
          max={1.2} // Assuming a reasonable range
          step={0.01}
          precision={2}
          value={speed}
          onChange={(value: number) =>
            onUpdateAgentData(createUpdatePayload("speed", value))
          }
          label={(value) => value.toFixed(2)}
          className="w-full"
        />
        <Text size="xs" c="dimmed">
          Controls the speed of the generated speech. Values below 1.0 slow it
          down, values above 1.0 speed it up.
        </Text>
      </div>

      {/* Similarity Boost Slider */}
      <div className="grid gap-2">
        <Text size="sm" fw={500}>
          Similarity Boost ({similarityBoost.toFixed(2)})
        </Text>
        <Slider
          min={0.0}
          max={1.0}
          step={0.01}
          precision={2}
          value={similarityBoost}
          onChange={(value: number) =>
            onUpdateAgentData(createUpdatePayload("similarity_boost", value))
          }
          label={(value) => value.toFixed(2)}
          className="w-full"
        />
        <Text size="xs" c="dimmed">
          Higher values boost clarity and consistency. Very high values may lead
          to artifacts. Recommended to find a balance.
        </Text>
      </div>
    </div>
  );
};

export default AgentVoiceSettings;
