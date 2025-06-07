import React from "react";
import type { Voice } from "~/models/AgentVoiceModel";
import classes from "./VoiceCard.module.css";
import { Avatar, Indicator, Stack, Text, Image } from "@mantine/core";

export type VoiceCardProps = {
  voice: Voice;
  isPlaying?: boolean;
  isSelected?: boolean;
  playProgress?: number;
  onSelectVoice?: (voiceId: string) => void;
  onPlayVoice?: (voiceId: string, previewUrl: string) => void;
};

import { useState } from "react";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
} from "@tabler/icons-react";

export const VoiceCard: React.FC<VoiceCardProps> = ({
  voice,
  isPlaying = false,
  isSelected = false,
  playProgress,
  onSelectVoice,
  onPlayVoice,
}) => {
  const [hovered, setHovered] = useState(false);

  const flagUrl =
    voice.language === "Spanish"
      ? "/images/es-flag.svg"
      : "/images/us-flag.svg";

  // Placeholder for previewUrl, replace with actual property if available
  const previewUrl = voice.previewUrl || "";

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayVoice) {
      onPlayVoice(voice.id, previewUrl);
    }
    if (onSelectVoice) {
      onSelectVoice(voice.id);
    }
  };

  return (
    <div
      className={classes.container}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        className={classes.avatarWrapper}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleAvatarClick}
        style={{
          cursor: "pointer",
          border: isSelected ? "2px solid var(--mantine-color-blue-6)" : "none",
          borderRadius: "50%",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Avatar
          src={"/images/avatar-m-do.png"}
          alt={voice.name}
          className={classes.avatarImage}
        />
        {/* Circular progress overlay */}
        {isPlaying && typeof playProgress === "number" && (
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 3,
            }}
            width="72"
            height="72"
            viewBox="0 0 72 72"
          >
            <circle
              cx="36"
              cy="36"
              r="34"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="4"
            />
            <circle
              cx="36"
              cy="36"
              r="34"
              fill="none"
              stroke="var(--mantine-color-blue-6)"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={
                2 * Math.PI * 34 * (1 - (playProgress ?? 0) / 100)
              }
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 0.2s",
                filter: "drop-shadow(0 0 2px var(--mantine-color-blue-6))",
              }}
            />
          </svg>
        )}
        {/* Overlay logic */}
        {(isPlaying || hovered) && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: isPlaying
                ? "rgba(0, 0, 0, 0.25)"
                : "rgba(0, 0, 0, 0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "background 0.2s",
              zIndex: 4,
            }}
          >
            {isPlaying ? (
              <IconPlayerPauseFilled size={36} color="#fff" />
            ) : hovered ? (
              <IconPlayerPlayFilled size={36} color="#fff" />
            ) : null}
          </div>
        )}
        {/* Flag */}
        <img src={flagUrl} alt="Language Flag" className={classes.flag} />
      </div>
      <Text
        fz={"md"}
        fw="bold"
        className={classes.name}
        style={{
          width: "100%",
          textAlign: "center",
          display: "block",
          marginTop: 12,
        }}
      >
        {voice.name}
      </Text>
    </div>
  );
};
