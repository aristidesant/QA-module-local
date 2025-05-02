import React from "react";
import { Card, Avatar, Title, Text, Box } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import styles from "./AgentCard.module.css";

export interface AgentCardProps {
  agent: {
    agent_id: string;
    name: string;
    created_at_unix_secs: number;
  };
  onClick?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  return (
    <Card
      shadow="xs"
      padding="md"
      radius="md"
      withBorder
      className={styles.agentCard}
      style={{ background: "#fff", borderWidth: 1, cursor: onClick ? "pointer" : undefined }}
      onClick={onClick}
    >
      <Box className={styles.header}>
        <Avatar color="blue" radius="lg" size={36}>
          <IconUser size={18} />
        </Avatar>
        <Title order={4} className={styles.agentName} style={{ maxWidth: 180 }}>
          {agent.name}
        </Title>
      </Box>
      <Box pt="xs" pb="xs">
        <Text size="xs" color="gray" className={styles.agentId} style={{ fontFamily: 'monospace', fontSize: 10 }}>
          ID: {agent.agent_id}
        </Text>
        <Text size="xs" color="gray" className={styles.agentCreatedAt} style={{ fontSize: 10 }}>
          Created: {new Date(agent.created_at_unix_secs * 1000).toLocaleDateString()}
        </Text>
      </Box>
    </Card>
  );
};

export default AgentCard;
