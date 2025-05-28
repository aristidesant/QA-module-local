import React from "react";
import {
  Avatar,
  Box,
  Text,
  ActionIcon,
  Paper,
  Progress,
  Tooltip,
  Transition,
  Badge,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconVolumeOff,
} from "@tabler/icons-react";
import { useHover } from "@mantine/hooks";
import type { Voice } from "~/models/AgentVoiceModel";
import classes from "./VoiceCard.module.css";

export type VoiceCardProps = {
  voice: Voice;
  isPlaying: boolean;
  isSelected: boolean;
  playProgress: number;
  onSelectVoice: (voiceId: string) => void;
  onPlayVoice: (voiceId: string, previewUrl: string) => void;
};

export const VoiceCard: React.FC<VoiceCardProps> = ({
  voice,
  isPlaying,
  isSelected,
  playProgress,
  onSelectVoice,
  onPlayVoice,
}) => {
  const { hovered, ref } = useHover();
  const isFemale =
    voice.gender === "female" || voice.name.toLowerCase().includes("female");
  const isMale =
    voice.gender === "male" || voice.name.toLowerCase().includes("male");
  const genderColor = isFemale ? "pink" : isMale ? "blue" : "gray";

  const getCardStyles = () => {
    if (isSelected) {
      return {
        background:
          "linear-gradient(145deg, rgba(59, 130, 246, 0.08), rgba(147, 197, 253, 0.05))",
        borderColor: "rgba(59, 130, 246, 0.5)",
      };
    }
    return {};
  };

  return (
    <Transition mounted={true} transition="fade" duration={400}>
      {(styles) => (
        <Tooltip
          label={`${voice.name} - ${
            isFemale ? "Female" : isMale ? "Male" : "Unknown"
          } voice`}
          position="top"
          withArrow
          disabled={isPlaying}
        >
          <Paper
            ref={ref}
            className={classes.voiceCard}
            style={{
              ...styles,
              ...getCardStyles(),
              boxShadow:
                hovered || isSelected
                  ? "0 4px 24px 0 rgba(34, 139, 230, 0.10)"
                  : "0 1.5px 6px 0 rgba(0,0,0,0.04)",
              transform: hovered ? "translateY(-2px) scale(1.02)" : "none",
            }}
            onClick={() => onSelectVoice(voice.id)}
            data-selected={isSelected}
            data-playing={isPlaying}
            data-gender={isFemale ? "female" : "male"}
            data-hovered={hovered && !isPlaying}
          >
            <div className={classes.cardContent}>
              <div className={classes.avatarWrapper}>
                <Avatar
                  size={56}
                  radius={"xl"}
                  src={
                    isFemale
                      ? "/images/avatar-f-do.png"
                      : "/images/avatar-m-do.png"
                  }
                  color={genderColor}
                  variant="filled"
                  className={classes.avatar}
                >
                  {voice.name.charAt(0).toUpperCase()}
                </Avatar>
              </div>
              <Box className={classes.voiceInfo}>
                <Text
                  className={classes.voiceName}
                  fw={isSelected ? 700 : 600}
                  size="md"
                  style={{
                    color: isSelected
                      ? "var(--mantine-color-blue-7)"
                      : undefined,
                    transition: "color 0.3s ease",
                  }}
                >
                  {voice.name}
                </Text>
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 6,
                  }}
                >
                  <Badge
                    color={genderColor}
                    size="xs"
                    variant={isSelected ? "filled" : "light"}
                    radius="md"
                    style={{
                      boxShadow: isSelected
                        ? "0 2px 8px rgba(0,0,0,0.1)"
                        : undefined,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isFemale ? "Female" : isMale ? "Male" : "Other"}
                  </Badge>
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{
                      fontWeight: 500,
                      opacity: 0.8,
                    }}
                  >
                    🌍 {voice?.language || "Unknown Language"}
                  </Text>
                </Box>
              </Box>
              <ActionIcon
                className={classes.playButton}
                variant={isPlaying ? "light" : "filled"}
                onClick={(event) => {
                  event.stopPropagation();
                  if (voice.previewUrl) {
                    onPlayVoice(voice.id, voice.previewUrl);
                  }
                }}
                color={genderColor}
                size={48}
                radius="xl"
                style={{
                  boxShadow: isPlaying
                    ? `0 0 0 3px var(--mantine-color-${genderColor}-3)`
                    : undefined,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: isPlaying
                    ? `var(--mantine-color-${genderColor}-1)`
                    : undefined,
                  animation: isPlaying ? "pulse 2s infinite" : undefined,
                }}
                disabled={!voice.previewUrl}
                aria-label={
                  !voice.previewUrl
                    ? "No preview available"
                    : isPlaying
                    ? "Stop preview"
                    : "Play preview"
                }
              >
                {!voice.previewUrl ? (
                  <IconVolumeOff size={24} style={{ opacity: 0.6 }} />
                ) : isPlaying ? (
                  <IconPlayerStop size={24} />
                ) : (
                  <IconPlayerPlay size={24} style={{ marginLeft: 2 }} />
                )}
              </ActionIcon>
            </div>
            {isPlaying && (
              <Progress
                value={playProgress}
                color={genderColor}
                size="sm"
                className={classes.progressBar}
                animated
                style={{
                  marginTop: 16,
                  borderRadius: 8,
                  background: "rgba(229, 231, 235, 0.3)",
                  backdropFilter: "blur(10px)",
                }}
              />
            )}
          </Paper>
        </Tooltip>
      )}
    </Transition>
  );
};
