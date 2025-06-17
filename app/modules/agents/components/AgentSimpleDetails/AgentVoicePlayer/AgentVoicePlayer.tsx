import React, { useRef, useState, useCallback, useEffect } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import {
  IconWaveSine,
  IconPlayerPlay,
  IconPlayerPause,
} from "@tabler/icons-react";
import styles from "./AgentVoicePlayer.module.css";
import type { Voice } from "~/models/AgentVoiceModel";

type AgentVoicePlayerProps = {
  voice?: Voice;
};

export const AgentVoicePlayer: React.FC<AgentVoicePlayerProps> = ({
  voice,
}) => {
  const isDisabled = !voice;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div
      className={`${styles.voicePlayerContainer} ${
        isDisabled ? styles.disabled : ""
      }`}
    >
      <div className={styles.voiceIcon}>
        <IconWaveSine size={24} />
      </div>
      <div className={styles.voiceText}>
        <div className={styles.voiceLabel}>Agent voice</div>
        <div className={styles.voiceName}>
          {isDisabled ? "No voice selected" : voice.name}
        </div>
      </div>
      <Tooltip
        label={
          isDisabled ? "Voice not available" : isPlaying ? "Pause" : "Play"
        }
      >
        <ActionIcon
          size="lg"
          radius="xl"
          className={`${styles.playIcon} ${
            isDisabled ? styles.disabledButton : ""
          }`}
          onClick={!isDisabled ? handlePlayPause : undefined}
          disabled={isDisabled}
          aria-label={
            isDisabled
              ? "Voice not available"
              : isPlaying
              ? "Pause voice preview"
              : "Play voice preview"
          }
        >
          {isPlaying ? (
            <IconPlayerPause size={20} />
          ) : (
            <IconPlayerPlay size={20} />
          )}
        </ActionIcon>
      </Tooltip>
      {!isDisabled && (
        <audio ref={audioRef} src={voice.previewUrl} preload="auto" />
      )}
    </div>
  );
};
