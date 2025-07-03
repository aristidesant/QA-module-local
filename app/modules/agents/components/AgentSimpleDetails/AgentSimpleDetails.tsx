import { ActionIcon, Stack, Button } from "@mantine/core";
import type AgentListObject from "~/models/AgentListObject";
import styles from "./AgentSimpleDetails.module.css";
import React, { useState, useEffect } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconSettings,
} from "@tabler/icons-react";
import AgentProfile from "~/components/AgentProfile";
import { useNavigate } from "react-router";
import AgentVoiceProgress from "./AgentVoiceProgress/AgentVoiceProgress";
import { VoicePlayer } from "~/components/VoicePlayer";

type AgentSimpleDetailsProps = {
  agent: AgentListObject;
};

export const AgentSimpleDetails: React.FC<AgentSimpleDetailsProps> = ({
  agent,
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // Agent traits to display
  const agentTraits = ["Empathic", "Jovial"];

  // Voice settings from conversationConfig
  const stability = agent.config?.conversationConfig?.tts?.stability ?? 0.5;
  const speed = agent.config?.conversationConfig?.tts?.speed ?? 1.0;
  const similarityBoost =
    agent.config?.conversationConfig?.tts?.similarityBoost ?? 0.8;
  const optimizeLatency =
    agent.config?.conversationConfig?.tts?.optimizeStreamingLatency ?? 3;

  useEffect(() => {
    // Small delay to ensure smooth mounting animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => {
      clearTimeout(timer);
      setIsVisible(false);
    };
  }, [agent.id]);

  return (
    <Stack gap="md" className={isVisible ? styles.visible : ""}>
      <div className={styles.agentSimpleDetails}>
        {/* Avatar and status */}
        <AgentProfile agent={agent} traits={agentTraits} size="lg" />

        <VoicePlayer
          voiceName={agent.voice?.name || "No voice selected"}
          previewUrl={agent.voice?.previewUrl}
        />
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
      {/* Voice settings sliders */}
      <AgentVoiceProgress
        stability={stability}
        speed={speed}
        similarityBoost={similarityBoost}
        optimizeLatency={optimizeLatency}
      />

      <Button
        rightSection={<IconSettings />}
        variant="light"
        onClick={() => navigate(`/agent/${agent.id}`)}
        color="teal"
        className={styles.setupButton}
      >
        Agent Profile Setup
      </Button>
    </Stack>
  );
};

export default AgentSimpleDetails;
