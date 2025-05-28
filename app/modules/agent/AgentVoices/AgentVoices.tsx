import { useRef, useState } from "react";
import { useDebouncedFilters } from "./AgentVoicesFilter/useDebouncedFilters";
import { useGetAllAgentVoices } from "~/queries/agentVoiceQueries";
import { ScrollArea, Text, Button, Collapse } from "@mantine/core";
import {
  IconMicrophone,
  IconFilter,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

import SectionCard from "~/components/SectionCard";
import classes from "./AgentVoices.module.css";
import { VoiceCard } from "./VoiceCard";
import { AgentVoicesFilter } from "./AgentVoicesFilter";
import type { AgentVoicesFilterValues } from "./AgentVoicesFilter/AgentVoicesFilter";

type AgentVoicesProps = {
  onSelectVoice: (voiceId: string) => void;
  selectedVoiceId: string | null;
};

const AgentVoices: React.FC<AgentVoicesProps> = ({
  onSelectVoice,
  selectedVoiceId,
}) => {
  const [filters, setFilters] = useState<AgentVoicesFilterValues>({
    name: "",
    gender: "",
    language: "",
    status: "",
    age: "",
    accent: "",
  });
  const debouncedFilters = useDebouncedFilters(filters, 400);

  const [filtersVisible, setFiltersVisible] = useState(false);

  const {
    data: elevenLabsVoices,
    isLoading,
    isError,
  } = useGetAllAgentVoices(
    Object.fromEntries(
      Object.entries(debouncedFilters).filter(([_, value]) => value !== "")
    ) as Record<string, string>
  );
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFiltersChange = (newFilters: AgentVoicesFilterValues) => {
    setFilters(newFilters);
  };

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

  const voices = elevenLabsVoices || [];

  let content: React.ReactNode = null;

  if (isLoading) {
    content = (
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
  } else if (isError) {
    content = (
      <div className={classes.errorContainer}>
        <IconMicrophone className={classes.errorIcon} size={64} />
        <Text size="xl" fw={600} c="red">
          Failed to load voices
        </Text>
        <Text size="sm" c="dimmed">
          There was an error fetching the voice options. Please try again.
        </Text>
      </div>
    );
  } else if (voices.length === 0) {
    content = (
      <div className={classes.errorContainer}>
        <IconMicrophone className={classes.errorIcon} size={64} />
        <Text size="xl" fw={600}>
          No voices found
        </Text>
        <Text size="sm" c="dimmed">
          Try adjusting your filters or try again later.
        </Text>
      </div>
    );
  } else {
    content = (
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
              <VoiceCard
                key={voice.id}
                voice={voice.voice}
                isPlaying={playingVoiceId === voice.voice.id}
                isSelected={voice.voice.id === selectedVoiceId}
                playProgress={playProgress}
                onSelectVoice={onSelectVoice}
                onPlayVoice={handlePlayVoice}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <SectionCard
      icon={IconMicrophone}
      title="List of voices"
      description="Select a voice for your agent. Preview and choose from available options."
      contentSpacing="md"
      id="agent-voices-section"
    >
      <AgentVoicesFilter filters={filters} onChange={handleFiltersChange} />
      {content}
    </SectionCard>
  );
};

export default AgentVoices;
