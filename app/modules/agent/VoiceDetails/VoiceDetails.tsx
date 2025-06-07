import type { AgentVoiceModel } from "~/models/AgentVoiceModel";
import { Card, Avatar, Group, Text, Stack } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import styles from "./VoiceDetails.module.css";

type VoiceDetailsProps = {
  agentVoice: AgentVoiceModel;
};

const VoiceDetails: React.FC<VoiceDetailsProps> = ({ agentVoice }) => {
  const { voice } = agentVoice;

  // Choose avatar based on gender
  const avatarSrc =
    voice.gender === "MALE"
      ? "/images/avatar-m-do.png"
      : voice.gender === "FEMALE"
      ? "/images/avatar-f-do.png"
      : undefined;

  return (
    <Card
      className={styles.voiceCard}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
    >
      <Group align="flex-start" gap="md">
        <Avatar
          src={avatarSrc}
          size={80}
          radius="xl"
          alt={voice.name}
          color="blue"
        >
          {!avatarSrc && <IconUser size={40} />}
        </Avatar>
        <Stack gap={4} className={styles.detailsStack}>
          <Text size="lg" fw={700}>
            {voice.name}
          </Text>
          <Text size="sm" c="dimmed">
            {voice.description}
          </Text>
          <Group gap="xs">
            <Text size="sm">
              <b>Gender:</b> {voice.gender}
            </Text>
            <Text size="sm">
              <b>Age:</b> {voice.age}
            </Text>
            <Text size="sm">
              <b>Accent:</b> {voice.accent}
            </Text>
            <Text size="sm">
              <b>Language:</b> {voice.language}
            </Text>
          </Group>
          {voice.previewUrl && (
            <audio
              controls
              src={voice.previewUrl}
              className={styles.audioPreview}
            >
              Your browser does not support the audio element.
            </audio>
          )}
        </Stack>
      </Group>
    </Card>
  );
};

export default VoiceDetails;
