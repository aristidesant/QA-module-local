import { useState, useRef, useEffect } from "react";
import {
  ActionIcon,
  Group,
  Slider,
  Stack,
  Text,
  Box,
  Paper,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconRotateClockwise2,
  IconRotate2,
  IconVolume,
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
      <Paper className={classes.container} radius="md">
        <Box className={classes.emptyState}>
          <IconVolume size={32} className={classes.emptyIcon} />
          <Text c="dimmed" ta="center" size="sm" mt="xs">
            Conversation not available
          </Text>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className={classes.container} radius="md">
      <audio
        ref={audioRef}
        src={voiceFile.repositoryRoute}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        hidden
      />

      <Stack gap="md">
        {/* Progress Bar */}
        <Box className={classes.progressSection}>
          <Slider
            value={currentTime}
            onChange={handleSeek}
            max={duration || 100}
            className={classes.progressSlider}
            classNames={{
              track: classes.sliderTrack,
              bar: classes.sliderBar,
              thumb: classes.sliderThumb,
            }}
          />
          <Group justify="space-between" mt="xs">
            <Text size="xs" c="dimmed" className={classes.timeText}>
              {formatTime(currentTime)}
            </Text>
            <Text size="xs" c="dimmed" className={classes.timeText}>
              {formatTime(duration)}
            </Text>
          </Group>
        </Box>

        {/* Controls */}
        <Group justify="center" gap="md" className={classes.controlsGroup}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={() => seek(-10)}
            aria-label="Rewind 10 seconds"
            className={classes.controlButton}
          >
            <IconRotate2 size={20} style={{ transform: "scaleX(-1)" }} />
          </ActionIcon>

          <ActionIcon
            variant="filled"
            color="blue"
            radius="xl"
            size="xl"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={classes.playButton}
          >
            {isPlaying ? (
              <IconPlayerPause size={28} />
            ) : (
              <IconPlayerPlay size={28} style={{ marginLeft: "2px" }} />
            )}
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={() => seek(10)}
            aria-label="Forward 10 seconds"
            className={classes.controlButton}
          >
            <IconRotateClockwise2 size={20} />
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  );
};

export default ConversationPlayer;
