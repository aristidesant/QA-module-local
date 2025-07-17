import React from "react";
import {
  Card,
  Avatar,
  Button,
  Menu,
  ActionIcon,
  Group,
  Text,
} from "@mantine/core";
import { IconDots, IconTrash, IconPlus } from "@tabler/icons-react";
import type AgentListObject from "~/models/AgentListObject";
import classes from "./AgentList.module.css";

// Mocked agent data
const agents: AgentListObject[] = [
  {
    id: "1",
    name: "Clara Lucia",
    config: {
      ...({} as any),
      conversationConfig: {},
    },
    type: "INBOUND",
    status: "ACTIVE",
    clientId: 1,
    userId: 1,
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
    voiceId: "es-ES",
    voice: {
      id: "es-ES",
      name: "Spanish ES",
      language: "Spanish ES",
      ...({} as any),
    },
  },
  {
    id: "2",
    name: "Jhon Smith",
    config: {
      ...({} as any),
      conversationConfig: {},
    },
    type: "OUTBOUND",
    status: "INACTIVE",
    clientId: 1,
    userId: 2,
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
    voiceId: "en-US",
    voice: {
      id: "en-US",
      name: "English US",
      language: "English US",
      ...({} as any),
    },
  },
];

function getStatusDot(status: AgentListObject["status"]) {
  return (
    <span
      className={
        status === "ACTIVE"
          ? classes.statusDot
          : `${classes.statusDot} ${classes.inactive}`
      }
      aria-label={status === "ACTIVE" ? "Active" : "Inactive"}
    />
  );
}

export const AgentList: React.FC = () => {
  return (
    <div>
      <Text className={classes.header} size="lg" fw={600}>
        Assigned Agents
      </Text>
      <Text className={classes.subheader} color="dimmed" size="sm">
        These agents are currently linked to this campaign.
      </Text>
      {agents.map((agent) => (
        <Card className={classes.agentCard} key={agent.id} withBorder>
          <Group w="100%" justify="space-between" align="center">
            <Group align="center">
              <span className={classes.avatarStatus}>
                <Avatar
                  radius="xl"
                  size={44}
                  name={agent.name}
                  color="initials"
                  alt={agent.name}
                />
                {getStatusDot(agent.status)}
              </span>
              <div>
                <Text className={classes.agentName} size="md" fw={500}>
                  {agent.name}
                </Text>
                <Text className={classes.agentLang} size="xs" color="dimmed">
                  {agent.voice?.language || "Unknown"}
                </Text>
              </div>
            </Group>
            <Menu shadow="md" width={140} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  className={classes.menuIcon}
                  aria-label="Agent actions"
                >
                  <IconDots size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item color="red" leftSection={<IconTrash size={16} />}>
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Card>
      ))}
      <Button
        className={classes.addAgentBtn}
        leftSection={<IconPlus size={18} />}
        variant="light"
        color="blue"
        fullWidth
        radius="md"
      >
        Add Agent
      </Button>
    </div>
  );
};
