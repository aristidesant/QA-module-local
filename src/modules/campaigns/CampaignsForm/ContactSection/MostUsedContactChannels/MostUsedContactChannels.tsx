import { Group, Text, Box, Card } from "@mantine/core";
import styles from "./MostUsedContactChannels.module.css";

interface MostUsedContactChannelsProps {
  score?: number;
  maxScore?: number;
}

export const MostUsedContactChannels = ({
  score = 82,
  maxScore = 100,
}: MostUsedContactChannelsProps) => {
  return (
    <Card className={styles.card}>
      <Group gap="xs" mb="xs">
        <Box className={styles.greenDot} />
        <Text size="sm" fw={600} className={styles.title}>
          Most Used Contact Channels
        </Text>
      </Group>
      <Text size="xs" c="dimmed" mb="sm" className={styles.subtitle}>
        Quick view of contact distribution by status.
      </Text>
      <Text size="xl" fw={700} className={styles.score}>
        {score}/{maxScore}
      </Text>
    </Card>
  );
};
