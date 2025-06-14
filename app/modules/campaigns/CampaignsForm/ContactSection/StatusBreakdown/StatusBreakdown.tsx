import { Group, Text, Box, Card, Title } from "@mantine/core";
import styles from "./StatusBreakdown.module.css";

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface StatusBreakdownProps {
  statusData?: StatusData[];
}

export const StatusBreakdown = ({
  statusData = [
    { name: "Active", value: 1320, color: "var(--mantine-color-green-6)" },
    { name: "Do Not Contact", value: 410, color: "var(--mantine-color-red-6)" },
    { name: "Unreachable", value: 290, color: "var(--mantine-color-blue-4)" },
    { name: "Deceased", value: 134, color: "var(--mantine-color-gray-6)" },
  ],
}: StatusBreakdownProps) => {
  const totalContacts = statusData.reduce((sum, item) => sum + item.value, 0);

  const generateConicGradient = () => {
    let currentDegree = 0;
    const gradientStops: string[] = [];

    statusData.forEach((item, index) => {
      const percentage = (item.value / totalContacts) * 360;
      const nextDegree = currentDegree + percentage;

      gradientStops.push(`${item.color} ${currentDegree}deg ${nextDegree}deg`);

      currentDegree = nextDegree;
    });

    return `conic-gradient(${gradientStops.join(", ")})`;
  };

  return (
    <Card className={styles.card}>
      <Title order={5} mb="xs" className={styles.title}>
        Status Breakdown
      </Title>
      <Text size="xs" c="dimmed" mb="md" className={styles.subtitle}>
        Quick view of contact distribution by status.
      </Text>

      <div className={styles.container}>
        <div className={styles.chartContainer}>
          <div className={styles.pieChart}>
            <div
              className={styles.pieSlice}
              style={{
                background: generateConicGradient(),
              }}
            />
          </div>

          <div className={styles.statusList}>
            {statusData.map((item) => (
              <Group key={item.name} justify="space-between" mb="xs">
                <Group gap="xs">
                  <Box
                    className={styles.colorDot}
                    style={{ backgroundColor: item.color }}
                  />
                  <Text size="xs">{item.name}</Text>
                </Group>
                <Text size="xs" fw={500}>
                  {item.value.toLocaleString()}
                </Text>
              </Group>
            ))}
            <Box className={styles.totalContainer} mt="sm" p="xs">
              <Group justify="space-between">
                <Text size="xs" fw={600}>
                  Total
                </Text>
                <Text size="xs" fw={600}>
                  {totalContacts.toLocaleString()}
                </Text>
              </Group>
            </Box>
          </div>
        </div>
      </div>
    </Card>
  );
};
