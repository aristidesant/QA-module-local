// AgentVoiceProgress.tsx
import React from "react";
import { Progress } from "@mantine/core";
import {
  IconWaveSine,
  IconAdjustments,
  IconSpeedboat,
} from "@tabler/icons-react";
import styles from "./AgentVoiceProgress.module.css";

type AgentVoiceProgressProps = {
  stability: number;
  speed: number;
  similarityBoost: number;
  optimizeLatency: number;
};

export const AgentVoiceProgress: React.FC<AgentVoiceProgressProps> = ({
  stability,
  speed,
  similarityBoost,
  optimizeLatency,
}) => {
  return (
    <div className={styles.slidersSection}>
      <div className={styles.sliderRow}>
        <div className={styles.sliderHeader}>
          <div className={styles.sliderLabel}>
            <IconWaveSine size={16} /> Streaming Latency
          </div>
          <div className={styles.sliderValue}>Balanced</div>
        </div>
        <div className={styles.sliderBarRow}>
          <Progress
            value={optimizeLatency * 20}
            size="sm"
            className={styles.sliderBar}
            color="var(--mantine-color-blue-6)"
          />
        </div>
      </div>
      <div className={styles.sliderRow}>
        <div className={styles.sliderHeader}>
          <div className={styles.sliderLabel}>
            <IconAdjustments size={16} /> Stability
          </div>
          <div className={styles.sliderValue}>Balanced</div>
        </div>
        <div className={styles.sliderBarRow}>
          <Progress
            value={stability * 100}
            size="sm"
            className={styles.sliderBar}
            color="var(--mantine-color-blue-6)"
          />
        </div>
      </div>
      <div className={styles.sliderRow}>
        <div className={styles.sliderHeader}>
          <div className={styles.sliderLabel}>
            <IconSpeedboat size={16} /> Speed
          </div>
          <div className={styles.sliderValue}>Fast</div>
        </div>
        <div className={styles.sliderBarRow}>
          <Progress
            value={speed * 100}
            size="sm"
            className={styles.sliderBar}
            color="var(--mantine-color-blue-6)"
          />
        </div>
      </div>
      <div className={styles.sliderRow}>
        <div className={styles.sliderHeader}>
          <div className={styles.sliderLabel}>
            <IconAdjustments size={16} /> Similarity Boost
          </div>
          <div className={styles.sliderValue}>Normal</div>
        </div>
        <div className={styles.sliderBarRow}>
          <Progress
            value={similarityBoost * 100}
            size="sm"
            className={styles.sliderBar}
            color="var(--mantine-color-blue-6)"
          />
        </div>
      </div>
    </div>
  );
};

export default AgentVoiceProgress;
