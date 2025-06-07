import React from "react";
import { Slider, Text, Group, Badge } from "@mantine/core";
import styles from "./AgentVoiceSettings.module.css";

export interface VoiceSliderConfig {
  key: string;
  icon: React.ReactNode;
  label: string;
  min: number;
  max: number;
  step: number;
  precision?: number;
  marks: { value: number; label: string }[];
  helper: string;
  ttsField: string;
}

export interface VoiceSettingSliderProps {
  config: VoiceSliderConfig;
  value: number;
  badge: string | number;
  onChange: (value: number) => void;
  onChangeEnd: (value: number) => void;
}

export const VoiceSettingSlider: React.FC<VoiceSettingSliderProps> = ({
  config,
  value,
  badge,
  onChange,
  onChangeEnd,
}) => (
  <div className={styles.sliderWrapper}>
    <div className={styles.temperatureContainer}>
      <Group justify="space-between" align="center">
        <div className={styles.fieldLabel}>
          {config.icon}
          <Text size="sm" fw={500}>
            {config.label}
          </Text>
        </div>
        <Badge variant="light" color="blue" className={styles.temperatureValue}>
          {badge}
        </Badge>
      </Group>
      <Text size="xs" c="dimmed" className={styles.temperatureHelper}>
        {config.helper}
      </Text>
      <Slider
        min={config.min}
        max={config.max}
        step={config.step}
        precision={config.precision}
        value={value}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
        marks={config.marks}
        classNames={{
          root: styles.sliderRoot,
          label: styles.sliderLabel,
          thumb: styles.sliderThumb,
          trackContainer: styles.sliderTrackContainer,
          track: styles.sliderTrack,
          bar: styles.sliderBar,
          markWrapper: styles.sliderMarkWrapper,
          mark: styles.sliderMark,
          markLabel: styles.sliderMarkLabel,
        }}
        className={styles.temperatureSlider}
      />
    </div>
  </div>
);
