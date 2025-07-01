import React from "react";
import { Text, Stack, Avatar, Group, Paper, Box } from "@mantine/core";
import { RightSection as Section } from "~/components/RightSection";
import classes from "./AssignedAgents.module.css";
import type { Agent } from "../../../../models/CampaignsModel";

interface AssignedAgentsProps {
  agents: Agent[];
}

// Helper function to get status dot class
const getStatusDotClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "online":
      return classes.statusOnline;
    case "offline":
      return classes.statusOffline;
    case "busy":
      return classes.statusBusy;
    case "away":
      return classes.statusAway;
    default:
      return classes.statusOffline;
  }
};

// Format agent location string
const formatAgentLocation = (language: string, countryCode: string) => {
  return `${language} ${countryCode.toUpperCase()}`;
};

export const AssignedAgents: React.FC<AssignedAgentsProps> = ({ agents }) => {
  if (!agents || agents.length === 0) {
    return null;
  }

  return (
    <Section
      title="Assigned Agents"
      description={`${agents.length} agents assigned`}
    >
      <Stack gap="xs">
        {agents.map((agent, index) => (
          <Paper key={index} withBorder p="sm" radius="md" className={classes.agentCard}>
            <Group align="center" wrap="nowrap">
              <Avatar
                src={agent.avatarUrl}
                alt={agent.name}
                radius="xl"
                size={42}
                className={classes.agentAvatar}
              >
                {agent.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </Avatar>
              
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text fw={500} size="sm" className={classes.agentName}>
                  {agent.name}
                </Text>
                <Group gap="xs" align="center" wrap="nowrap">
                  <Text size="xs" c="dimmed" truncate>
                    {formatAgentLocation(agent.language, agent.countryCode)}
                  </Text>
                  <Box className={classes.statusContainer}>
                    <span
                      className={`${classes.statusDot} ${getStatusDotClass(
                        agent.status
                      )}`}
                    />
                    <Text size="xs" c="dimmed" span>
                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </Text>
                  </Box>
                </Group>
              </Box>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Section>
  );
};

// Using named exports as per project rules
