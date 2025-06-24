import React from "react";
import {
  Text,
  Stack,
  Avatar,
  Group,
} from "@mantine/core";
import { Section } from "../Section";
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
        {agents.map((agent) => (
          <div key={agent.id} className={classes.agentCard}>
            <Avatar
              src={agent.avatarUrl}
              alt={agent.name}
              radius="xl"
              size={36}
              className={classes.agentAvatar}
            >
              {agent.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </Avatar>
            <div className={classes.agentInfo}>
              <div className={classes.agentName}>{agent.name}</div>
              <Group gap="xs" align="center">
                <Text size="xs" c="dimmed">
                  {formatAgentLocation(agent.language, agent.countryCode)}
                </Text>
                <span
                  className={`${classes.statusDot} ${getStatusDotClass(
                    agent.status
                  )}`}
                />
                <Text size="xs" c="dimmed">
                  {agent.status.charAt(0).toUpperCase() +
                    agent.status.slice(1)}
                </Text>
              </Group>
            </div>
          </div>
        ))}
      </Stack>
    </Section>
  );
};

// Using named exports as per project rules
