import React from "react";
import { Card, Text, Stack, Group, Avatar } from "@mantine/core";
import styles from "./AssignedAgents.module.css";
import type { Agent } from "~/models/CampaignsModel";

interface AssignedAgentsProps {
  agents?: Agent[];
}

const AssignedAgents: React.FC<AssignedAgentsProps> = ({ agents }) => {
  // Mock data with fallbacks
  const mockAgents: Agent[] = agents || [
    {
      id: 1,
      name: "Clara Lucia",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      language: "Spanish ES",
      countryCode: "ES",
      status: "online",
    },
    {
      id: 2,
      name: "Jhon Smith",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      language: "English US",
      countryCode: "US",
      status: "online",
    },
  ];

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      ES: "🇪🇸",
      US: "🇺🇸",
      GB: "🇬🇧",
      FR: "🇫🇷",
      DE: "🇩🇪",
      IT: "🇮🇹",
    };
    return flags[countryCode] || "🌐";
  };

  return (
    <Stack gap="md" mt="sm">
      <div>
        <Text fw={600} size="md" className={styles.title}>
          Assigned Agents
        </Text>
        <Text size="xs" c="dimmed" className={styles.subtitle}>
          These agents are currently linked to this campaign.
        </Text>
      </div>

      <Stack gap="xs" className={styles.agentsList}>
        {mockAgents.map((agent) => (
          <Card
            key={agent.id}
            radius="md"
            padding="sm"
            withBorder
            className={styles.agentCard}
          >
            <Group gap="md" className={styles.agentItem}>
              <div className={styles.avatarContainer}>
                <Avatar
                  src={agent.avatarUrl}
                  size={36}
                  radius="xl"
                  className={styles.avatar}
                />
                <div
                  className={`${styles.statusIndicator} ${
                    styles[agent.status]
                  }`}
                />
              </div>
              <div className={styles.agentInfo}>
                <Text fw={500} size="sm" className={styles.agentName}>
                  {agent.name}
                </Text>
                <Group gap="xs" align="center">
                  <span className={styles.flag}>
                    {getCountryFlag(agent.countryCode)}
                  </span>
                  <Text size="xs" c="dimmed">
                    {agent.language}
                  </Text>
                </Group>
              </div>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};

export default AssignedAgents;
