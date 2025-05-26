import React, { useState, useEffect } from "react";
import { Slider, Text, Group, Badge } from "@mantine/core";
import {
  IconWaveSine,
  IconSpeedboat,
  IconAdjustments,
  IconSpeakerphone,
} from "@tabler/icons-react";
import SectionCard from "../../../components/SectionCard";
import styles from "./AgentVoiceSettings.module.css";

// Define the props for AgentVoiceSettings
interface AgentVoiceSettingsProps {
  agentData: any; // TODO: Define a more specific type for agentData
  onUpdateAgentData: (updatedFields: any) => void; // TODO: Define a more specific type for updatedFields
}

const AgentVoiceSettings: React.FC<AgentVoiceSettingsProps> = ({
  agentData,
  onUpdateAgentData,
}) => {
  // Use local state for slider values
  const [localValues, setLocalValues] = useState({
    optimizeStreamingLatency: agentData?.conversation_config?.tts?.optimize_streaming_latency ?? 3,
    stability: agentData?.conversation_config?.tts?.stability ?? 0.5,
    speed: agentData?.conversation_config?.tts?.speed ?? 1.0,
    similarityBoost: agentData?.conversation_config?.tts?.similarity_boost ?? 0.8,
  });

  // Update local values when props change
  useEffect(() => {
    setLocalValues({
      optimizeStreamingLatency: agentData?.conversation_config?.tts?.optimize_streaming_latency ?? 3,
      stability: agentData?.conversation_config?.tts?.stability ?? 0.5,
      speed: agentData?.conversation_config?.tts?.speed ?? 1.0,
      similarityBoost: agentData?.conversation_config?.tts?.similarity_boost ?? 0.8,
    });
  }, [agentData]);

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

  // Helper function to handle slider changes
  const handleSliderChange = (field: string, value: number) => {
    setLocalValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to handle slider changes when released (onChangeEnd)
  const handleSliderChangeEnd = (ttsField: string, value: number) => {
    onUpdateAgentData(createUpdatePayload(ttsField, value));
  };

  return (
    <SectionCard
      icon={IconSpeakerphone}
      title="Voice Settings"
      description="Fine-tune the voice and speech synthesis for your agent"
      contentSpacing="md"
    >
      <div className={styles.fieldGroup}>
        {/* Optimize Streaming Latency Slider */}
        <div className={styles.sliderWrapper}>
          <div className={styles.temperatureContainer}>
            <Group justify="space-between" align="center">
              <div className={styles.fieldLabel}>
                <IconAdjustments className={styles.fieldIcon} />
                <Text size="sm" fw={500}>
                  Optimize Streaming Latency
                </Text>
              </div>
              <Badge
                variant="light"
                color="blue"
                className={styles.temperatureValue}
              >
                {localValues.optimizeStreamingLatency}
              </Badge>
            </Group>
            <Slider
              min={0}
              max={4}
              step={1}
              value={localValues.optimizeStreamingLatency}
              onChange={(value: number) => 
                handleSliderChange('optimizeStreamingLatency', value)
              }
              onChangeEnd={(value: number) => 
                handleSliderChangeEnd('optimize_streaming_latency', value)
              }
              marks={[
                { value: 0, label: "Normal" },
                { value: 2, label: "Balanced" },
                { value: 4, label: "Max" },
              ]}
              className={styles.temperatureSlider}
            />
            <Text size="xs" c="dimmed" className={styles.temperatureHelper}>
              Configure latency optimizations for the speech generation. Latency
              can be optimized at the cost of quality. (0=Normal, 4=Max
              optimization)
            </Text>
          </div>
        </div>

        {/* Stability Slider */}
        <div className={styles.sliderWrapper}>
          <div className={styles.temperatureContainer}>
            <Group justify="space-between" align="center">
              <div className={styles.fieldLabel}>
                <IconWaveSine className={styles.fieldIcon} />
                <Text size="sm" fw={500}>
                  Stability
                </Text>
              </div>
              <Badge
                variant="light"
                color="blue"
                className={styles.temperatureValue}
              >
                {localValues.stability.toFixed(2)}
              </Badge>
            </Group>
            <Slider
              min={0.0}
              max={1.0}
              step={0.01}
              precision={2}
              value={localValues.stability}
              onChange={(value: number) =>
                handleSliderChange('stability', value)
              }
              onChangeEnd={(value: number) =>
                handleSliderChangeEnd('stability', value)
              }
              marks={[
                { value: 0, label: "Expressive" },
                { value: 0.5, label: "Balanced" },
                { value: 1, label: "Consistent" },
              ]}
              className={styles.temperatureSlider}
            />
            <Text size="xs" c="dimmed" className={styles.temperatureHelper}>
              Higher values make speech more consistent but potentially
              monotone. Lower values are more expressive but may lead to
              instabilities.
            </Text>
          </div>
        </div>

        {/* Speed Slider */}
        <div className={styles.sliderWrapper}>
          <div className={styles.temperatureContainer}>
            <Group justify="space-between" align="center">
              <div className={styles.fieldLabel}>
                <IconSpeedboat className={styles.fieldIcon} />
                <Text size="sm" fw={500}>
                  Speed
                </Text>
              </div>
              <Badge
                variant="light"
                color="blue"
                className={styles.temperatureValue}
              >
                {localValues.speed.toFixed(2)}
              </Badge>
            </Group>
            <Slider
              min={0.7}
              max={1.2}
              step={0.01}
              precision={2}
              value={localValues.speed}
              onChange={(value: number) =>
                handleSliderChange('speed', value)
              }
              onChangeEnd={(value: number) =>
                handleSliderChangeEnd('speed', value)
              }
              marks={[
                { value: 0.7, label: "Slow" },
                { value: 1.0, label: "Normal" },
                { value: 1.2, label: "Fast" },
              ]}
              className={styles.temperatureSlider}
            />
            <Text size="xs" c="dimmed" className={styles.temperatureHelper}>
              Controls the speed of the generated speech. Values below 1.0 slow
              it down, values above 1.0 speed it up.
            </Text>
          </div>
        </div>

        {/* Similarity Boost Slider */}
        <div className={styles.sliderWrapper}>
          <div className={styles.temperatureContainer}>
            <Group justify="space-between" align="center">
              <div className={styles.fieldLabel}>
                <IconAdjustments className={styles.fieldIcon} />
                <Text size="sm" fw={500}>
                  Similarity Boost
                </Text>
              </div>
              <Badge
                variant="light"
                color="blue"
                className={styles.temperatureValue}
              >
                {localValues.similarityBoost.toFixed(2)}
              </Badge>
            </Group>
            <Slider
              min={0.0}
              max={1.0}
              step={0.01}
              precision={2}
              value={localValues.similarityBoost}
              onChange={(value: number) =>
                handleSliderChange('similarityBoost', value)
              }
              onChangeEnd={(value: number) =>
                handleSliderChangeEnd('similarity_boost', value)
              }
              marks={[
                { value: 0, label: "Low" },
                { value: 0.5, label: "Balanced" },
                { value: 1, label: "High" },
              ]}
              className={styles.temperatureSlider}
            />
            <Text size="xs" c="dimmed" className={styles.temperatureHelper}>
              Higher values boost clarity and consistency. Very high values may
              lead to artifacts. Recommended to find a balance.
            </Text>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default AgentVoiceSettings;
