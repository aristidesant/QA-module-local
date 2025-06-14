import { Stack, Text, Group, Avatar, Card, Badge, SemiCircleProgress } from "@mantine/core";
import {
  IconMoodHappy,
  IconMoodNeutral,
  IconMoodSad,
} from "@tabler/icons-react";
import styles from "./ContactDetails.module.css";

interface ContactDetailsProps {
  contact: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    location?: string;
    language: string;
    initials: string;
    engagementLevel?: number;
    qualificationScore?: number;
    sentiment?: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
}

export const ContactDetails = ({ contact }: ContactDetailsProps) => {
  const {
    name,
    phone,
    email,
    location,
    language,
    initials,
    engagementLevel = 87,
    qualificationScore = 75,
    sentiment = { positive: 2113, neutral: 45, negative: 16 },
  } = contact;

  const getEngagementColor = (level: number) => {
    if (level >= 80) return "green";
    if (level >= 60) return "yellow";
    return "red";
  };

  const getQualificationColor = (score: number) => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    return "red";
  };

  return (
    <Stack gap="xs" className={styles.container}>
      {/* Profile Section - No Card */}
      <div className={styles.profileSection}>
        <Group justify="center" mb="sm">
          <div className={styles.avatarContainer}>
            <Avatar
              size={80}
              color="blue"
              radius="xl"
              className={styles.avatar}
            >
              {initials}
            </Avatar>
            <div className={styles.statusIndicator} />
          </div>
        </Group>

        <Stack gap="xs" align="center">
          <Text size="lg" fw={600} className={styles.name}>
            {name}
          </Text>
          <Group gap="xs">
            <div className={styles.flagIcon}>🇪🇸</div>
            <Text size="sm" c="dimmed">
              {language}
            </Text>
          </Group>
        </Stack>
      </div>

      {/* Primary Phone Number Card */}
      <Card className={styles.infoCard}>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Primary phone number
          </Text>
          <Text size="sm" fw={500}>
            {phone}
          </Text>
        </Group>
      </Card>

      {/* Email Card */}
      {email && (
        <Card className={styles.infoCard}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Email
            </Text>
            <Text size="sm" fw={500}>
              {email}
            </Text>
          </Group>
        </Card>
      )}

      {/* Location Card */}
      {location && (
        <Card className={styles.infoCard}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Location
            </Text>
            <Text size="sm" fw={500}>
              {location}
            </Text>
          </Group>
        </Card>
      )}

      {/* Engagement Level Card */}
      <Card className={styles.metricCard}>
        <Stack gap="sm" align="center">
          <div className={styles.engagementCircle}>
            <SemiCircleProgress
              value={engagementLevel}
              size={120}
              thickness={8}
              fillDirection="left-to-right"
              orientation="up"
              filledSegmentColor={`var(--mantine-color-${getEngagementColor(engagementLevel)}-6)`}
              emptySegmentColor="var(--mantine-color-gray-2)"
              labelPosition="center"
              label={
                <Text size="xl" fw={700}>
                  {engagementLevel}
                </Text>
              }
              className={styles.progressCircle}
            />
          </div>

          <Stack gap="xs" align="center">
            <Text size="sm" fw={600}>
              Engagement Level
            </Text>
            <Text
              size="xs"
              c="dimmed"
              ta="center"
              className={styles.description}
            >
              Measures how engaged {name.split(" ")[0]} is with your campaigns.
            </Text>
          </Stack>
        </Stack>
      </Card>

      {/* Reviews Qualification Card */}
      <Card className={styles.metricCard}>
        <Stack gap="md" align="center">
          <div className={styles.qualificationCircle}>
            <SemiCircleProgress
              value={qualificationScore}
              size={100}
              thickness={6}
              fillDirection="left-to-right"
              orientation="up"
              filledSegmentColor={`var(--mantine-color-${getQualificationColor(qualificationScore)}-6)`}
              emptySegmentColor="var(--mantine-color-gray-2)"
              labelPosition="center"
              label={
                <Text size="lg" fw={600}>
                  {qualificationScore}%
                </Text>
              }
              className={styles.progressCircle}
            />
          </div>

          <Stack gap="xs" align="center">
            <Text size="sm" fw={600}>
              Reviews qualification
            </Text>
            <Text
              size="xs"
              c="dimmed"
              ta="center"
              className={styles.description}
            >
              Measures how engaged {name.split(" ")[0]} is with your campaigns.
            </Text>
          </Stack>

          {/* Sentiment Analysis */}
          <Stack gap="sm" w="100%">
            <Group gap="sm" justify="space-between">
              <Text size="sm" c="dimmed">
                Negative
              </Text>
              <Text size="sm" c="dimmed">
                Neutral
              </Text>
              <Text size="sm" c="dimmed">
                Positive
              </Text>
            </Group>

            <Group gap="lg" justify="space-between">
              <Group gap="xs" className={styles.sentimentItem}>
                <IconMoodSad size={20} className={styles.negativeIcon} />
                <Text size="sm" fw={600}>
                  {sentiment.negative}
                </Text>
              </Group>

              <Group gap="xs" className={styles.sentimentItem}>
                <IconMoodNeutral size={20} className={styles.neutralIcon} />
                <Text size="sm" fw={600}>
                  {sentiment.neutral}
                </Text>
              </Group>

              <Group gap="xs" className={styles.sentimentItem}>
                <IconMoodHappy size={20} className={styles.positiveIcon} />
                <Text size="sm" fw={600}>
                  {sentiment.positive}
                </Text>
              </Group>
            </Group>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};
