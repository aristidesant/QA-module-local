import {
  IconAdjustments,
  IconSpeedboat,
  IconWaveSine,
} from "@tabler/icons-react";
import type { VoiceSliderConfig } from "./VoiceSettingSlider";
import styles from "./AgentVoiceSettings.module.css";
export const sliderConfigs: VoiceSliderConfig[] = [
  {
    key: "optimizeStreamingLatency",
    icon: <IconAdjustments className={styles.fieldIcon} />,
    label: "Optimize Streaming Latency",
    min: 0,
    max: 4,
    step: 1,
    marks: [
      { value: 0, label: "Normal" },
      { value: 2, label: "Balanced" },
      { value: 4, label: "Max" },
    ],
    helper:
      "Configure latency optimizations for the speech generation. Latency can be optimized at the cost of quality. (0=Normal, 4=Max optimization)",
    ttsField: "optimizeStreamingLatency",
  },
  {
    key: "stability",
    icon: <IconWaveSine className={styles.fieldIcon} />,
    label: "Stability",
    min: 0.0,
    max: 1.0,
    step: 0.01,
    precision: 2,
    marks: [
      { value: 0, label: "Expressive" },
      { value: 0.5, label: "Balanced" },
      { value: 1, label: "Consistent" },
    ],
    helper:
      "Higher values make speech more consistent but potentially monotone. Lower values are more expressive but may lead to instabilities.",
    ttsField: "stability",
  },
  {
    key: "speed",
    icon: <IconSpeedboat className={styles.fieldIcon} />,
    label: "Speed",
    min: 0.7,
    max: 1.2,
    step: 0.01,
    precision: 2,
    marks: [
      { value: 0.7, label: "Slow" },
      { value: 1.0, label: "Normal" },
      { value: 1.2, label: "Fast" },
    ],
    helper:
      "Controls the speed of the generated speech. Values below 1.0 slow it down, values above 1.0 speed it up.",
    ttsField: "speed",
  },
  {
    key: "similarityBoost",
    icon: <IconAdjustments className={styles.fieldIcon} />,
    label: "Similarity Boost",
    min: 0.0,
    max: 1.0,
    step: 0.01,
    precision: 2,
    marks: [
      { value: 0, label: "Low" },
      { value: 0.5, label: "Balanced" },
      { value: 1, label: "High" },
    ],
    helper:
      "Higher values boost clarity and consistency. Very high values may lead to artifacts. Recommended to find a balance.",
    ttsField: "similarityBoost",
  },
];
