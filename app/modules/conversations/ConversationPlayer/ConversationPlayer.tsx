import { useState, useRef, useEffect } from "react";
import { ActionIcon, Group, Slider, Stack, Text } from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerTrackPrev,
  IconPlayerTrackNext,
} from "@tabler/icons-react";
import type { VoiceFileModel } from "~/models/ConversationsModels";
import classes from "./ConversationPlayer.module.css";

interface ConversationPlayerProps {
  voiceFile?: VoiceFileModel | null;
}

const ConversationPlayer: React.FC<ConversationPlayerProps> = ({
  voiceFile,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle play/pause toggle
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle seeking
  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  // Handle audio loaded metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle forward/rewind
  const seek = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(
        0,
        Math.min(audioRef.current.currentTime + seconds, duration)
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format time in seconds to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Reset player when voiceFile changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [voiceFile]);

  // No valid voice file
  if (!voiceFile?.repositoryRoute) {
    return (
      <div className={classes.container}>
        <Text c="dimmed" ta="center" p="md">
          Conversation not available
        </Text>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <audio
        ref={audioRef}
        src={voiceFile.repositoryRoute}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        hidden
      />

      <Stack gap="xs">
        <Slider
          value={currentTime}
          onChange={handleSeek}
          max={duration || 100}
          label={formatTime}
          classNames={{
            root: classes.sliderRoot,
            thumb: classes.sliderThumb,
          }}
        />

        <Group justify="space-between" px="sm">
          <Text size="sm" c="dimmed">
            {formatTime(currentTime)}
          </Text>

          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => seek(-10)}
              aria-label="Rewind 10 seconds"
            >
              <IconPlayerTrackPrev size={20} />
            </ActionIcon>

            <ActionIcon
              variant="filled"
              color="blue"
              radius="xl"
              size="lg"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <IconPlayerPause size={24} />
              ) : (
                <IconPlayerPlay size={24} />
              )}
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => seek(10)}
              aria-label="Forward 10 seconds"
            >
              <IconPlayerTrackNext size={20} />
            </ActionIcon>
          </Group>

          <Text size="sm" c="dimmed">
            {formatTime(duration)}
          </Text>
        </Group>
      </Stack>
    </div>
  );
};

export default ConversationPlayer;
