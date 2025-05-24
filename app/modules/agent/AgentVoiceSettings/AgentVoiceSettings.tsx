import React from "react";
import { Slider, Text, Group, Badge, Title } from "@mantine/core";
import {
  IconWaveSine,
  IconSpeedboat,
  IconAdjustments,
  IconSpeakerphone,
} from "@tabler/icons-react";
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
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <IconSpeakerphone className={styles.sectionIcon} />
          <div>
            <Title order={3} className={styles.sectionTitle}>
              Voice Settings
            </Title>
            <Text className={styles.sectionDescription}>
              Fine-tune the voice and speech synthesis for your agent
            </Text>
          </div>
        </div>

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
                  {optimizeStreamingLatency}
                </Badge>
              </Group>
              <Slider
                min={0}
                max={4}
                step={1}
                value={optimizeStreamingLatency}
                onChange={(value: number) =>
                  onUpdateAgentData(
                    createUpdatePayload("optimize_streaming_latency", value)
                  )
                }
                marks={[
                  { value: 0, label: "Normal" },
                  { value: 2, label: "Balanced" },
                  { value: 4, label: "Max" },
                ]}
                className={styles.temperatureSlider}
              />
              <Text size="xs" c="dimmed" className={styles.temperatureHelper}>
                Configure latency optimizations for the speech generation.
                Latency can be optimized at the cost of quality. (0=Normal,
                4=Max optimization)
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
                  {stability.toFixed(2)}
                </Badge>
              </Group>
              <Slider
                min={0.0}
                max={1.0}
                step={0.01}
                precision={2}
                value={stability}
                onChange={(value: number) =>
                  onUpdateAgentData(createUpdatePayload("stability", value))
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
                  {speed.toFixed(2)}
                </Badge>
              </Group>
              <Slider
                min={0.7}
                max={1.2}
                step={0.01}
                precision={2}
                value={speed}
                onChange={(value: number) =>
                  onUpdateAgentData(createUpdatePayload("speed", value))
                }
                marks={[
                  { value: 0.7, label: "Slow" },
                  { value: 1.0, label: "Normal" },
                  { value: 1.2, label: "Fast" },
                ]}
                className={styles.temperatureSlider}
              />
              <Text size="xs" c="dimmed" className={styles.temperatureHelper}>
                Controls the speed of the generated speech. Values below 1.0
                slow it down, values above 1.0 speed it up.
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
                  {similarityBoost.toFixed(2)}
                </Badge>
              </Group>
              <Slider
                min={0.0}
                max={1.0}
                step={0.01}
                precision={2}
                value={similarityBoost}
                onChange={(value: number) =>
                  onUpdateAgentData(
                    createUpdatePayload("similarity_boost", value)
                  )
                }
                marks={[
                  { value: 0, label: "Low" },
                  { value: 0.5, label: "Balanced" },
                  { value: 1, label: "High" },
                ]}
                className={styles.temperatureSlider}
              />
              <Text size="xs" c="dimmed" className={styles.temperatureHelper}>
                Higher values boost clarity and consistency. Very high values
                may lead to artifacts. Recommended to find a balance.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentVoiceSettings;
