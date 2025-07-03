import type { AgentVoiceModel } from "~/models/AgentVoiceModel";
import { Avatar, Group, Text, Stack, Badge, Box } from "@mantine/core";
import {
  IconUser,
  IconGenderFemale,
  IconWorld,
  IconCalendar,
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
  const displayGender =
    voice.gender?.charAt(0) + voice.gender?.slice(1).toLowerCase();
  const displayAccent = voice.accent || "Dominican";
  const displayAgeRange = voice.age || "24-32";

  return (
    <Box className={styles.voiceContainer}>
      <Stack align="center" gap="xs" className={styles.profileSection}>
        {/* Avatar */}
        <Box className={styles.avatarContainer}>
          <Avatar
            src={avatarSrc}
            size={120}
            radius="50%"
            alt={voice.name}
            color="blue"
            className={styles.profileAvatar}
          >
            {!avatarSrc && <IconUser size={60} />}
          </Avatar>
        </Box>

        {/* Voice Name */}
        <Text size="xl" fw={600} className={styles.voiceName}>
          {voice.name}
        </Text>

        {/* Language */}
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
            Youthful
          </Badge>
        </Group>

        {/* Voice Details */}
        <Stack gap="xs" w="100%" mt="md">
          <Group justify="space-between" className={styles.detailRow}>
            <Group gap="xs">
              <IconGenderFemale size={18} className={styles.detailIcon} />
              <Text size="sm">Gender</Text>
            </Group>
            <Text size="sm" fw={500}>
              {displayGender}
            </Text>
          </Group>

          <Group justify="space-between" className={styles.detailRow}>
            <Group gap="xs">
              <IconWorld size={18} className={styles.detailIcon} />
              <Text size="sm">Accent</Text>
            </Group>
            <Text size="sm" fw={500}>
              {displayAccent}
            </Text>
          </Group>

          <Group justify="space-between" className={styles.detailRow}>
            <Group gap="xs">
              <IconCalendar size={18} className={styles.detailIcon} />
              <Text size="sm">Age Range</Text>
            </Group>
            <Text size="sm" fw={500}>
              {displayAgeRange}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Box>
  );
};

export default VoiceDetails;
