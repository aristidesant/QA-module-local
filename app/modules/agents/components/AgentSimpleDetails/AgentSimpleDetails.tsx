import { Avatar, ActionIcon, Card, Box, Text } from "@mantine/core";
import { IconWaveSine, IconPlayerPlay } from "@tabler/icons-react";
import type AgentListObject from "~/models/AgentListObject";
import styles from "./AgentSimpleDetails.module.css";
import React from "react";
import AgentVoiceProgress from "./AgentVoiceProgress";
import AgentVoicePlayer from "./AgentVoicePlayer";

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
  const voiceName =
    agent.config?.voice?.name || agent.config?.voice_name || agent.name;
  const voiceCategory =
    agent.config?.voice?.category || agent.config?.category || agent.type;
  const voiceLabels = agent.config?.voice?.labels || agent.config?.labels || [];
  const voiceDescription =
    agent.config?.voice?.description ||
    agent.config?.description ||
    "No description available.";
  const voiceLanguage =
    agent.config?.voice?.language || agent.config?.language || "";
  const voiceGender =
    agent.config?.voice?.labels?.gender || agent.config?.gender || "";
  const voiceAge = agent.config?.voice?.labels?.age || agent.config?.age || "";
  const avatarUrl =
    agent.config?.voice?.preview_url ||
    agent.config?.avatarUrl ||
    "/images/avatar-m-do.png";
  const isOnline = agent.status === "ACTIVE";
  const createdAt = agent.createdAt
    ? new Date(agent.createdAt).toLocaleDateString()
    : "";

  // Voice settings from conversation_config
  const stability = agent.config?.conversation_config?.tts?.stability ?? 0.5;
  const speed = agent.config?.conversation_config?.tts?.speed ?? 1.0;
  const similarityBoost =
    agent.config?.conversation_config?.tts?.similarity_boost ?? 0.8;
  const optimizeLatency =
    agent.config?.conversation_config?.tts?.optimize_streaming_latency ?? 3;

  // Additional agent info
  const agentType = agent.type;
  const lastUpdated = agent.updatedAt
    ? new Date(agent.updatedAt).toLocaleDateString()
    : "";
  const clientId = agent.clientId;
  const userId = agent.userId;
  console.log({ agent });
  return (
    <Card withBorder p="xl">
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
            <span className={styles.flagIcon}>🇪🇸</span> {voiceLanguage}
          </div>
          <div className={styles.traitsRow}>
            <span className={styles.trait}>Empathic</span>
            <span className={styles.trait}>Jovial</span>
          </div>
        </div>

        {/* Voice selection button */}
        {agent?.voice ? (
          <AgentVoicePlayer voice={agent?.voice} />
        ) : (
          <Text>Voice not available</Text>
        )}

        {/* Campaign section */}
        <div className={styles.campaignRow}>
          <ActionIcon size="sm" variant="subtle" className={styles.arrowBtn}>
            <span>&lt;</span>
          </ActionIcon>
          <div className={styles.campaignText}>
            <div className={styles.campaignLabel}>Campaign</div>
            <div className={styles.campaignName}>Personal Loan Promotion</div>
          </div>
          <ActionIcon size="sm" variant="subtle" className={styles.arrowBtn}>
            <span>&gt;</span>
          </ActionIcon>
        </div>
      </div>
      <Box px="xs">
        <AgentVoiceProgress
          stability={stability}
          speed={speed}
          similarityBoost={similarityBoost}
          optimizeLatency={optimizeLatency}
        />
      </Box>
    </Card>
  );
};

export default AgentSimpleDetails;
