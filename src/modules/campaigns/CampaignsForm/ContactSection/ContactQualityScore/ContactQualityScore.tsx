import { Group, Text, Box, Card } from "@mantine/core";
import styles from "./ContactQualityScore.module.css";

interface ContactQualityScoreProps {
  score?: number;
  maxScore?: number;
}

export const ContactQualityScore = ({
  score = 82,
  maxScore = 100,
}: ContactQualityScoreProps) => {
  return (
    <Card className={styles.card}>
      <Group gap="xs" mb="xs">
        <Box className={styles.greenDot} />
        <Text size="sm" fw={600} className={styles.title}>
          Contact Quality Score
        </Text>
      </Group>
      <Text size="xs" c="dimmed" mb="sm" className={styles.subtitle}>
        Based on data completeness and engagement.
      </Text>
      <Text size="xl" fw={700} className={styles.score}>
        {score}/{maxScore}
      </Text>
    </Card>
  );
};
