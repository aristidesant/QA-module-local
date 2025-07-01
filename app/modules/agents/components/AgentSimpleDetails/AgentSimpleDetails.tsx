import { Avatar, ActionIcon, Text, Button, Stack } from "@mantine/core";
import type AgentListObject from "~/models/AgentListObject";
import styles from "./AgentSimpleDetails.module.css";
import React from "react";
import AgentVoiceProgress from "./AgentVoiceProgress";
import AgentVoicePlayer from "./AgentVoicePlayer";
import {
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconSettings,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import {
  getAgentAvatarUrl,
  getAgentLanguage,
  getLanguageFlagEmoji,
} from "~/utils/agentUtils";

type AgentSimpleDetailsProps = {
  agent: AgentListObject;
};

export const AgentSimpleDetails: React.FC<AgentSimpleDetailsProps> = ({
  agent,
}) => {
  const navigate = useNavigate();
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

  // Use utility functions for consistent agent data extraction
  const voiceLanguage = getAgentLanguage(agent);
  const avatarUrl = getAgentAvatarUrl(agent);
  const isOnline = agent.status === "ACTIVE";

  // Get flag emoji based on language - use utility function
  const getFlagEmoji = (language: string) => {
    return getLanguageFlagEmoji(language);
  };

  // Voice settings from conversationConfig
  const stability = agent.config?.conversationConfig?.tts?.stability ?? 0.5;
  const speed = agent.config?.conversationConfig?.tts?.speed ?? 1.0;
  const similarityBoost =
    agent.config?.conversationConfig?.tts?.similarityBoost ?? 0.8;
  const optimizeLatency =
    agent.config?.conversationConfig?.tts?.optimizeStreamingLatency ?? 3;

  return (
    <Stack gap="md">
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
      <Button
        rightSection={<IconSettings />}
        variant="light"
        onClick={() => {
          navigate(`/agent/${agent.id}`);
        }}
        color="teal"
        className={styles.setupButton}
      >
        Agent Profile Setup
      </Button>
    </Stack>
  );
};

export default AgentSimpleDetails;
