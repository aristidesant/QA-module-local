import React, { useState, useEffect } from "react";
import styles from "./AgentVoiceSettings.module.css";

// Define the props for AgentVoiceSettings
interface AgentVoiceSettingsProps {
  agentData: any; // TODO: Define a more specific type for agentData
  onUpdateAgentData: (updatedFields: any) => void; // TODO: Define a more specific type for updatedFields
}

import { VoiceSettingSlider } from "./VoiceSettingSlider";
import { sliderConfigs } from "./agentVoiceSettingsList";

const AgentVoiceSettings: React.FC<AgentVoiceSettingsProps> = ({
  agentData,
  onUpdateAgentData,
}) => {
  const [localValues, setLocalValues] = useState({
    optimizeStreamingLatency:
      agentData?.conversation_config?.tts?.optimize_streaming_latency ?? 3,
    stability: agentData?.conversation_config?.tts?.stability ?? 0.5,
    speed: agentData?.conversation_config?.tts?.speed ?? 1.0,
    similarityBoost:
      agentData?.conversation_config?.tts?.similarity_boost ?? 0.8,
  });

  useEffect(() => {
    setLocalValues({
      optimizeStreamingLatency:
        agentData?.conversation_config?.tts?.optimize_streaming_latency ?? 3,
      stability: agentData?.conversation_config?.tts?.stability ?? 0.5,
      speed: agentData?.conversation_config?.tts?.speed ?? 1.0,
      similarityBoost:
        agentData?.conversation_config?.tts?.similarity_boost ?? 0.8,
    });
  }, [agentData]);

  const createUpdatePayload = (ttsField: string, value: number) => ({
    conversation_config: {
      ...(agentData?.conversation_config || {}),
      tts: {
        ...(agentData?.conversation_config?.tts || {}),
        [ttsField]: value,
      },
    },
  });

  const handleSliderChange = (field: string, value: number) => {
    setLocalValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSliderChangeEnd = (ttsField: string, value: number) => {
    onUpdateAgentData(createUpdatePayload(ttsField, value));
  };

  return (
    <div className={styles.fieldGroup}>
      {sliderConfigs.map((cfg) => (
        <VoiceSettingSlider
          key={cfg.key}
          config={cfg}
          value={localValues[cfg.key as keyof typeof localValues]}
          badge={
            cfg.key === "optimizeStreamingLatency"
              ? localValues.optimizeStreamingLatency
              : localValues[cfg.key as keyof typeof localValues].toFixed
              ? (
                  localValues[cfg.key as keyof typeof localValues] as number
                ).toFixed(2)
              : localValues[cfg.key as keyof typeof localValues]
          }
          onChange={(value: number) => handleSliderChange(cfg.key, value)}
          onChangeEnd={(value: number) =>
            handleSliderChangeEnd(cfg.ttsField, value)
          }
        />
      ))}
    </div>
  );
};

export default AgentVoiceSettings;
