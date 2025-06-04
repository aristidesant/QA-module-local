import {
  Card,
  Text,
  Button,
  Group,
  Avatar,
  Badge,
  Stack,
  Progress,
  Divider,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import {
  IconMapPin,
  IconCircleCheckFilled,
  IconWaveSine,
  IconSpeedboat,
  IconAdjustments,
  IconPhone,
  IconPhoneIncoming,
  IconPhoneOutgoing,
  IconCalendarTime,
  IconUser,
  IconPlayerPlay,
  IconPlayerPause,
} from "@tabler/icons-react";
import type AgentListObject from "~/models/AgentListObject";
import styles from "./AgentSimpleDetails.module.css";
import React from "react";

type AgentSimpleDetailsProps = {
  agent: AgentListObject;
};

export const AgentSimpleDetails: React.FC<AgentSimpleDetailsProps> = ({
  agent,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Small delay to ensure smooth mounting animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => {
      clearTimeout(timer);
      setIsVisible(false);
    };
  }, [agent.id]); // Re-trigger animation when agent changes
  // ElevenLabs/agent config fields
  const voiceName =
    agent.config?.voice?.name || agent.config?.voice_name || agent.name;
  const voiceCategory =
    agent.config?.voice?.category || agent.config?.category || agent.type;
  const voiceLabels = agent.config?.voice?.labels || agent.config?.labels || [];
  const voiceDescription =
    agent.config?.voice?.description ||
    agent.config?.description ||
    "No description available.";
  const voiceLanguage =
    agent.config?.voice?.language || agent.config?.language || "";
  const voiceGender =
    agent.config?.voice?.labels?.gender || agent.config?.gender || "";
  const voiceAge = agent.config?.voice?.labels?.age || agent.config?.age || "";
  const avatarUrl =
    agent.config?.voice?.preview_url ||
    agent.config?.avatarUrl ||
    "/images/avatar-m-do.png";
  const isOnline = agent.status === "ACTIVE";
  const createdAt = agent.createdAt
    ? new Date(agent.createdAt).toLocaleDateString()
    : "";

  // Voice settings from conversation_config
  const stability = agent.config?.conversation_config?.tts?.stability ?? 0.5;
  const speed = agent.config?.conversation_config?.tts?.speed ?? 1.0;
  const similarityBoost =
    agent.config?.conversation_config?.tts?.similarity_boost ?? 0.8;
  const optimizeLatency =
    agent.config?.conversation_config?.tts?.optimize_streaming_latency ?? 3;

  // Additional agent info
  const agentType = agent.type;
  const lastUpdated = agent.updatedAt
    ? new Date(agent.updatedAt).toLocaleDateString()
    : "";
  const clientId = agent.clientId;
  const userId = agent.userId;

  let cardClass = styles.card;
  if (isVisible) cardClass += ` ${styles.cardVisible}`;

  return (
    <Card className={cardClass} shadow="md" radius="lg" padding="lg" withBorder>
      {/* Header Section */}
      <Stack justify="center" gap="xs" align="center">
        <div className={styles.avatarContainer}>
          <Avatar
            src={avatarUrl}
            size={100}
            radius="xl"
            className={styles.avatar}
          />
          <div className={styles.playButton}>
            <Tooltip label="Preview Voice">
              <ActionIcon size="sm" radius="xl" color="blue" variant="filled">
                <IconPlayerPlay size={12} />
              </ActionIcon>
            </Tooltip>
          </div>
        </div>

        <div className={styles.agentHeader}>
          <Text fw={700} fz="lg" ta="center" className={styles.agentName}>
            {voiceName}
          </Text>
          <Group gap={6} justify="center" mb="xs">
            <Badge
              size="sm"
              variant="light"
              color={agentType === "INBOUND" ? "blue" : "green"}
              leftSection={
                agentType === "INBOUND" ? (
                  <IconPhoneIncoming size={12} />
                ) : (
                  <IconPhoneOutgoing size={12} />
                )
              }
            >
              {agentType}
            </Badge>
            {voiceCategory && (
              <Badge size="sm" variant="outline" color="gray">
                {voiceCategory}
              </Badge>
            )}
          </Group>
        </div>

        {voiceLabels &&
          Array.isArray(voiceLabels) &&
          voiceLabels.length > 0 && (
            <Group gap={4} justify="center">
              {voiceLabels.slice(0, 3).map((label: string) => (
                <Badge key={label} size="xs" color="blue" variant="dot">
                  {label}
                </Badge>
              ))}
              {voiceLabels.length > 3 && (
                <Badge size="xs" color="gray" variant="light">
                  +{voiceLabels.length - 3}
                </Badge>
              )}
            </Group>
          )}
      </Stack>

      <Divider my="md" />

      {/* Agent Info Section */}
      <div className={styles.infoSection}>
        <Group justify="space-between" mb="sm">
          <Group gap={6}>
            <IconUser size={14} />
            <Text fw={600} fz="sm">
              {agent.name}
            </Text>
          </Group>
          <Badge
            color={isOnline ? "green" : "red"}
            size="sm"
            variant="light"
            leftSection={<IconCircleCheckFilled size={10} />}
          >
            {isOnline ? "Active" : "Inactive"}
          </Badge>
        </Group>

        <Group gap={4} mb="sm">
          <IconMapPin size={14} color="gray" />
          <Text fz="sm" c="dimmed">
            {voiceLanguage || "Unknown Language"}
            {voiceGender && ` • ${voiceGender}`}
            {voiceAge && ` • ${voiceAge}`}
          </Text>
        </Group>

        {voiceDescription && (
          <Text fz="xs" c="dimmed" mb="md" className={styles.description}>
            {voiceDescription}
          </Text>
        )}
      </div>

      <Divider my="md" />
      {/* Voice Parameters Section */}
      <div className={styles.voiceParams}>
        <Text fw={600} fz="sm" mb="sm" className={styles.sectionTitle}>
          Voice Configuration
        </Text>

        <div className={styles.parameterGrid}>
          <div className={styles.parameter}>
            <Group gap="xs" justify="space-between" mb={4}>
              <Group gap={4}>
                <IconWaveSine size={14} color="blue" />
                <Text fz="xs" fw={500}>
                  Stability
                </Text>
              </Group>
              <Text fz="xs" fw={600} color="blue">
                {(stability * 100).toFixed(0)}%
              </Text>
            </Group>
            <Progress
              value={stability * 100}
              size="sm"
              color="blue"
              className={styles.progressBar}
            />
          </div>

          <div className={styles.parameter}>
            <Group gap="xs" justify="space-between" mb={4}>
              <Group gap={4}>
                <IconSpeedboat size={14} color="green" />
                <Text fz="xs" fw={500}>
                  Speed
                </Text>
              </Group>
              <Text fz="xs" fw={600} color="green">
                {speed.toFixed(1)}x
              </Text>
            </Group>
            <Progress
              value={((speed - 0.7) / (1.2 - 0.7)) * 100}
              size="sm"
              color="green"
              className={styles.progressBar}
            />
          </div>

          <div className={styles.parameter}>
            <Group gap="xs" justify="space-between" mb={4}>
              <Group gap={4}>
                <IconAdjustments size={14} color="orange" />
                <Text fz="xs" fw={500}>
                  Similarity
                </Text>
              </Group>
              <Text fz="xs" fw={600} color="orange">
                {(similarityBoost * 100).toFixed(0)}%
              </Text>
            </Group>
            <Progress
              value={similarityBoost * 100}
              size="sm"
              color="orange"
              className={styles.progressBar}
            />
          </div>
        </div>
      </div>

      <Divider my="md" />

      {/* Footer Section */}
      <div className={styles.footer}>
        <Group justify="space-between" mb="sm">
          <Group gap={4}>
            <IconCalendarTime size={12} />
            <Text fz="xs" c="dimmed">
              Created: {createdAt}
            </Text>
          </Group>
          {lastUpdated && (
            <Text fz="xs" c="dimmed">
              Updated: {lastUpdated}
            </Text>
          )}
        </Group>

        <Group justify="center" gap="xs">
          <Button
            variant="light"
            size="xs"
            radius="md"
            color="blue"
            leftSection={<IconPhone size={12} />}
          >
            Test Call
          </Button>
          <Button variant="outline" size="xs" radius="md" color="gray">
            View Details
          </Button>
        </Group>
      </div>
    </Card>
  );
};

export default AgentSimpleDetails;
