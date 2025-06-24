import { Avatar, ActionIcon, Text } from "@mantine/core";
import type AgentListObject from "~/models/AgentListObject";
import styles from "./AgentSimpleDetails.module.css";
import React from "react";
import AgentVoiceProgress from "./AgentVoiceProgress";
import AgentVoicePlayer from "./AgentVoicePlayer";
import {
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

type AgentSimpleDetailsProps = {
  agent: AgentListObject;
};

export const AgentSimpleDetails: React.FC<AgentSimpleDetailsProps> = ({
  agent,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Small delay to ensure smooth mounting animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => {
      clearTimeout(timer);
      setIsVisible(false);
    };
  }, [agent.id]); // Re-trigger animation when agent changes
  // ElevenLabs/agent config fields
  const voiceLanguage =
    agent.config?.voice?.language || agent.config?.language || "Spanish ES";
  const avatarUrl =
    agent.config?.voice?.preview_url ||
    agent.config?.avatarUrl ||
    "/images/avatar-f-do.png";
  const isOnline = agent.status === "ACTIVE";

  // Get flag emoji based on language
  const getFlagEmoji = (language: string) => {
    if (
      language.toLowerCase().includes("spanish") ||
      language.toLowerCase().includes("es")
    ) {
      return "🇪🇸";
    }
    if (
      language.toLowerCase().includes("english") ||
      language.toLowerCase().includes("en")
    ) {
      return "🇺🇸";
    }
    return "🌐";
  };

  // Voice settings from conversation_config
  const stability = agent.config?.conversation_config?.tts?.stability ?? 0.5;
  const speed = agent.config?.conversation_config?.tts?.speed ?? 1.0;
  const similarityBoost =
    agent.config?.conversation_config?.tts?.similarity_boost ?? 0.8;
  const optimizeLatency =
    agent.config?.conversation_config?.tts?.optimize_streaming_latency ?? 3;

  // Additional agent info

  return (
    <>
      <div className={styles.agentSimpleDetails}>
        {/* Avatar and status */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <Avatar src={avatarUrl} size={120} className={styles.avatar} />
            <span
              className={
                isOnline ? styles.statusDotOnline : styles.statusDotOffline
              }
            />
          </div>
          <div className={styles.agentName}>{agent.name}</div>
          <div className={styles.agentLanguage}>
            <span className={styles.flagIcon}>
              {getFlagEmoji(voiceLanguage)}
            </span>
            {voiceLanguage}
          </div>
          <div className={styles.traitsRow}>
            <span className={styles.trait}>Empathic</span>
            <span className={styles.trait}>Jovial</span>
          </div>
        </div>

        {/* Voice selection button */}
        <div className={styles.voiceButtonWrapper}>
          <AgentVoicePlayer voice={agent.voice ?? undefined} />
        </div>

        {/* Campaign section */}
        <div className={styles.campaignRow}>
          <ActionIcon size="sm" variant="outline" color="gray">
            <IconChevronLeft />
          </ActionIcon>
          <div className={styles.campaignText}>
            <div className={styles.campaignLabel}>Campaign</div>
            <div className={styles.campaignName}>Personal Loan Promotion</div>
          </div>
          <ActionIcon size="sm" variant="outline" color="gray">
            <IconChevronRight />
          </ActionIcon>
        </div>
      </div>
      <AgentVoiceProgress
        stability={stability}
        speed={speed}
        similarityBoost={similarityBoost}
        optimizeLatency={optimizeLatency}
      />
    </>
  );
};

export default AgentSimpleDetails;
