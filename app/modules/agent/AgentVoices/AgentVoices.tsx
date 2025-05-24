import { useRef, useState } from "react";
import { useGetElevenlabsVoices } from "~/queries/agentVoiceQueries";
import {
  ScrollArea,
  Avatar,
  Text,
  Box,
  ActionIcon,
  Transition,
  Paper,
  Progress,
  Tooltip,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconMicrophone,
  IconVolumeOff,
} from "@tabler/icons-react";
import { useHover } from "@mantine/hooks";
import classes from "./AgentVoices.module.css";

type AgentVoicesProps = {
  onSelectVoice: (voiceId: string) => void;
  selectedVoiceId: string | null;
};

const AgentVoices: React.FC<AgentVoicesProps> = ({
  onSelectVoice,
  selectedVoiceId,
}) => {
  const { data: elevenLabsVoices, isLoading } = useGetElevenlabsVoices();
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayVoice = (voiceId: string, previewUrl: string) => {
    if (!previewUrl) return;

    if (playingVoiceId === voiceId) {
      audioRef.current?.pause();
      setPlayingVoiceId(null);
      setPlayProgress(0);
    } else {
      if (audioRef.current) {
        // Stop any currently playing audio
        if (playingVoiceId) {
          audioRef.current.pause();
          setPlayProgress(0);
        }

        audioRef.current.src = previewUrl;
        audioRef.current.play().catch(console.error);
        setPlayingVoiceId(voiceId);
      }
    }
    onSelectVoice(voiceId);
  };

  const handleAudioEnded = () => {
    setPlayingVoiceId(null);
    setPlayProgress(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setPlayProgress(progress);
    }
  };

  if (isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <IconMicrophone className={classes.loadingIcon} size={64} />
        <Text size="xl" fw={600}>
          Loading voices...
        </Text>
        <Text size="sm" c="dimmed">
          Fetching available voice options
        </Text>
      </div>
    );
  }

  const voices = elevenLabsVoices?.voices || [];

  const isVoiceFemale = (voice: any) =>
    voice.labels?.gender === "female" ||
    voice.name.toLowerCase().includes("female");

  const isVoiceMale = (voice: any) =>
    voice.labels?.gender === "male" ||
    voice.name.toLowerCase().includes("male");

  const VoiceCard = ({ voice }: { voice: any }) => {
    const { hovered, ref } = useHover();
    const isFemale = isVoiceFemale(voice);
    const isMale = isVoiceMale(voice);
    const genderColor = isFemale ? "pink" : isMale ? "blue" : "gray";
    const isPlaying = playingVoiceId === voice.voice_id;
    const isSelected = voice.voice_id === selectedVoiceId;

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
              style={styles}
              onClick={() => {
                onSelectVoice(voice.voice_id);
              }}
              data-selected={isSelected}
              data-playing={isPlaying}
              data-gender={isFemale ? "female" : "male"}
              data-hovered={hovered && !isPlaying}
            >
              <div className={classes.cardContent}>
                <div className={classes.avatarWrapper}>
                  <Avatar
                    size={"lg"}
                    radius={"xl"}
                    src={
                      isFemale
                        ? "/images/avatar-f-do.png"
                        : "/images/avatar-m-do.png"
                    }
                    color={genderColor}
                    variant="filled"
                  >
                    {voice.name.charAt(0).toUpperCase()}
                  </Avatar>
                </div>

                <Box className={classes.voiceInfo}>
                  <Text
                    className={classes.voiceName}
                    fw={isSelected ? 700 : 600}
                    size="sm"
                  >
                    {voice.name}
                  </Text>
                </Box>

                <ActionIcon
                  className={classes.playButton}
                  variant="filled"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (voice.preview_url) {
                      handlePlayVoice(voice.voice_id, voice.preview_url);
                    }
                  }}
                  color={genderColor}
                  size="lg"
                  radius="xl"
                >
                  {!voice.preview_url ? (
                    <IconVolumeOff size={18} />
                  ) : isPlaying ? (
                    <IconPlayerStop size={18} />
                  ) : (
                    <IconPlayerPlay size={18} style={{ marginLeft: 1 }} />
                  )}
                </ActionIcon>
              </div>

              {isPlaying && (
                <Progress
                  value={playProgress}
                  color={genderColor}
                  size="xs"
                  className={classes.progressBar}
                  animated
                />
              )}
            </Paper>
          </Tooltip>
        )}
      </Transition>
    );
  };

  return (
    <div className={classes.container}>
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onTimeUpdate={handleTimeUpdate}
        className={classes.hiddenAudio}
      />

      <ScrollArea className={classes.scrollArea}>
        <div className={classes.voiceGrid}>
          {voices.map((voice) => (
            <VoiceCard key={voice.voice_id} voice={voice} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AgentVoices;
