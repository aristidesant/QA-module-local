import type { AgentVoiceModel } from "~/models/AgentVoiceModel";
import {
  Avatar,
  Group,
  Text,
  Stack,
  Badge,
  Slider,
  Button,
  Box,
  Card,
} from "@mantine/core";
import {
  IconUser,
  IconWaveSquare,
  IconPlayerPlay,
  IconPlayerPause,
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import styles from "./VoiceDetails.module.css";

type VoiceDetailsProps = {
  agentVoice: AgentVoiceModel;
};

const VoiceDetails: React.FC<VoiceDetailsProps> = ({ agentVoice }) => {
  const { voice } = agentVoice;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset audio and state when previewUrl changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, [voice.previewUrl]);

  const createAudioElement = () => {
    if (!voice.previewUrl) return null;

    const audio = new Audio(voice.previewUrl);

    audio.addEventListener("loadstart", () => setIsLoading(true));
    audio.addEventListener("canplaythrough", () => setIsLoading(false));
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setIsLoading(false);
    });
    audio.addEventListener("error", (e) => {
      setIsLoading(false);
      setIsPlaying(false);
      console.error("Error loading audio:", e);
    });

    return audio;
  };

  const handlePlayPause = async () => {
    if (!voice.previewUrl) return;

    try {
      if (isPlaying) {
        // Pause
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        // Play
        if (!audioRef.current) {
          audioRef.current = createAudioElement();
        }

        if (audioRef.current) {
          setIsLoading(true);
          await audioRef.current.play();
          setIsPlaying(true);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  // Choose avatar based on gender
  const avatarSrc =
    voice.gender === "MALE"
      ? "/images/avatar-m-do.png"
      : voice.gender === "FEMALE"
      ? "/images/avatar-f-do.png"
      : undefined;

  // Get country flag based on language
  const getLanguageFlag = (language: string) => {
    if (
      language.toLowerCase().includes("spanish") ||
      language.toLowerCase().includes("es")
    ) {
      return "/images/es-flag.svg";
    }
    if (
      language.toLowerCase().includes("english") ||
      language.toLowerCase().includes("en")
    ) {
      return "/images/us-flag.svg";
    }
    return null;
  };

  const flagSrc = getLanguageFlag(voice.language);

  return (
    <Box className={styles.voiceContainer}>
      {/* Profile Section */}
      <Stack align="center" gap="xs" className={styles.profileSection}>
        <Box className={styles.avatarContainer}>
          <Avatar
            src={avatarSrc}
            size={120}
            radius="xl"
            alt={voice.name}
            color="blue"
            className={styles.profileAvatar}
          >
            {!avatarSrc && <IconUser size={60} />}
          </Avatar>
          <Box className={styles.onlineIndicator} />
        </Box>

        <Text size="xl" fw={600} className={styles.voiceName}>
          {voice.name}
        </Text>

        {flagSrc && (
          <Group gap="xs" align="center">
            <img
              src={flagSrc}
              alt="language flag"
              className={styles.flagIcon}
            />
            <Text size="sm" c="dimmed">
              {voice.language}
            </Text>
          </Group>
        )}

        {/* Voice characteristics */}
        <Group gap="xs" justify="center">
          <Badge variant="light" color="gray" radius="md">
            Warm
          </Badge>
          <Badge variant="light" color="gray" radius="md">
            Playful
          </Badge>
        </Group>
      </Stack>

      <Stack className={styles.settingsSection}>
        <Card className={styles.metricCard}>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <IconWaveSquare size={16} color="var(--mantine-color-gray-6)" />
              <Text size="sm">Streaming Latency</Text>
            </Group>
            <Text size="sm" fw={500}>
              Balanced
            </Text>
          </Group>
          <Slider value={50} color="blue" size="sm" className={styles.slider} />
        </Card>

        <Card className={styles.metricCard}>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <IconWaveSquare size={16} color="var(--mantine-color-gray-6)" />
              <Text size="sm">Stability</Text>
            </Group>
            <Text size="sm" fw={500}>
              Balanced
            </Text>
          </Group>
          <Slider value={60} color="blue" size="sm" className={styles.slider} />
        </Card>

        <Card className={styles.metricCard}>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <IconWaveSquare size={16} color="var(--mantine-color-gray-6)" />
              <Text size="sm">Speed</Text>
            </Group>
            <Text size="sm" fw={500}>
              Fast
            </Text>
          </Group>
          <Slider value={85} color="blue" size="sm" className={styles.slider} />
        </Card>

        <Card className={styles.metricCard}>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <IconWaveSquare size={16} color="var(--mantine-color-gray-6)" />
              <Text size="sm">Similarity Boost</Text>
            </Group>
            <Text size="sm" fw={500}>
              Normal
            </Text>
          </Group>
          <Slider value={40} color="blue" size="sm" className={styles.slider} />
        </Card>
        {/* Animated Play Button */}
        <Box className={styles.playButtonContainer}>
          <div className={styles.animatedPlayButton}>
            <div
              className={`${styles.pulseRing} ${
                isPlaying ? styles.pulseRingActive : ""
              }`}
            />
            <div
              className={`${styles.outerRing} ${
                isPlaying ? styles.outerRingActive : ""
              }`}
            />
            <Button
              className={`${styles.playButton} ${
                isPlaying ? styles.playButtonActive : ""
              }`}
              variant="filled"
              size="lg"
              radius="xl"
              color="blue"
              onClick={handlePlayPause}
              disabled={isLoading}
              loading={isLoading}
            >
              {isPlaying ? (
                <IconPlayerPause size={24} />
              ) : (
                <IconPlayerPlay size={24} />
              )}
            </Button>
          </div>
        </Box>
      </Stack>
    </Box>
  );
};

export default VoiceDetails;
