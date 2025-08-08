import { Avatar, Text } from "@mantine/core";
import {
  getAgentAvatarUrl,
  getAgentLanguage,
  getLanguageFlagEmoji,
} from "~/utils/agentUtils";
import React from "react";
import styles from "./AgentProfile.module.css";
import type AgentListObject from "~/models/AgentListObject";

export type AgentProfileProps = {
  agent?: AgentListObject;
  traits?: string[];
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
};

const AgentProfile: React.FC<AgentProfileProps> = ({
  agent,
  traits = [],
  size = "md",
  onClick,
}) => {
  const avatarSize = {
    sm: 80,
    md: 96,
    lg: 120,
  }[size];

  const isOnline = agent?.status === "ACTIVE";
  const avatarUrl = getAgentAvatarUrl(agent as any);
  const language = getAgentLanguage(agent as any);
  const flagEmoji = getLanguageFlagEmoji(language);

  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.avatarWrapper}>
        <Avatar
          src={avatarUrl}
          size={avatarSize}
          className={styles.avatar}
          alt={agent?.name}
        />
        <div
          className={`${styles.statusDot} ${
            isOnline ? styles.statusOnline : styles.statusOffline
          }`}
          aria-label={isOnline ? "Online" : "Offline"}
        />
      </div>

      <Text className={styles.agentName}>{agent?.name}</Text>

      <div className={styles.languageRow}>
        <span className={styles.flagIcon} role="img" aria-label={language}>
          {flagEmoji}
        </span>
        <Text className={styles.languageText}>{language}</Text>
      </div>

      {traits.length > 0 && (
        <div className={styles.traitsContainer}>
          {traits.map((trait, index) => (
            <span key={index} className={styles.trait}>
              {trait}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentProfile;
