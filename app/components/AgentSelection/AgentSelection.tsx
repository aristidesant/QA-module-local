import React, { useState, useMemo } from "react";
import type AgentListObject from "~/models/AgentListObject";
import {
  IconUsersGroup,
  IconRobot,
  IconPhone,
  IconPhoneCall,
} from "@tabler/icons-react";
import classes from "./AgentSelection.module.css";
import { useGetAllAgents } from "~/queries/agentQueries";
import {
  Loader,
  Stack,
  Text,
  Group,
  Avatar,
  ScrollArea,
  Paper,
  Badge,
  TextInput,
  Box,
} from "@mantine/core";

interface AgentSelectionProps {
  onSelect: (agent: AgentListObject) => void;
}

export const AgentSelection: React.FC<AgentSelectionProps> = ({ onSelect }) => {
  const { data, isLoading, isError } = useGetAllAgents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const getAgentIcon = (type: "INBOUND" | "OUTBOUND") => {
    return type === "INBOUND" ? IconPhone : IconPhoneCall;
  };

  const getStatusColor = (status: "ACTIVE" | "INACTIVE") => {
    return status === "ACTIVE" ? "#51cf66" : "#ff6b6b";
  };

  // Filter agents by name (case-insensitive)
  const filteredAgents = useMemo(() => {
    if (!data) return [];
    return data.filter((agent: AgentListObject) =>
      agent.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  if (isLoading) {
    return (
      <Stack
        align="center"
        justify="center"
        className={classes.loaderContainer}
      >
        <Loader size="lg" color="blue" />
        <Text size="sm" c="dimmed" mt="md">
          Loading agents...
        </Text>
      </Stack>
    );
  }

  if (isError || !data) {
    return (
      <Paper className={classes.errorContainer}>
        <IconRobot size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
        <Text c="red" ta="center" fw={500}>
          Failed to load agents
        </Text>
        <Text size="sm" c="dimmed" ta="center" mt={4}>
          Please try refreshing the page
        </Text>
      </Paper>
    );
  }

  return (
    <Box>
      <TextInput
        placeholder="Search agents by name"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="md"
        aria-label="Search agents"
        data-autofocus
      />
      <ScrollArea h={320} type="auto" className={classes.scrollArea}>
        {filteredAgents.length === 0 ? (
          <Stack
            align="center"
            justify="center"
            className={classes.emptyState}
            gap="md"
          >
            <Avatar size={64} className={classes.emptyStateIcon} radius="xl">
              <IconUsersGroup size={32} />
            </Avatar>
            <Text className={classes.emptyStateText} ta="center">
              No agents found
            </Text>
          </Stack>
        ) : (
          <div className={classes.agentsGrid}>
            {filteredAgents.map((agent: AgentListObject) => {
              const AgentIcon = getAgentIcon(agent.type);
              return (
                <div
                  key={agent.id}
                  className={`${classes.agentCard} ${
                    selectedId === agent.id ? classes.selected : ""
                  }`}
                  onClick={() => {
                    setSelectedId(agent.id);
                    onSelect(agent);
                  }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(agent.id);
                      onSelect(agent);
                    }
                  }}
                >
                  <Group gap="md" wrap="nowrap">
                    <Avatar
                      className={classes.agentAvatar}
                      radius="xl"
                      size="lg"
                    >
                      <AgentIcon size={24} />
                    </Avatar>
                    <Stack gap={2} className={classes.agentInfo}>
                      <Text className={classes.agentName} lineClamp={1}>
                        {agent.name}
                      </Text>
                      <Group gap="xs" align="center">
                        <Badge
                          size="xs"
                          className={`${classes.agentType} ${
                            agent.type === "OUTBOUND" ? classes.outbound : ""
                          }`}
                          variant="light"
                        >
                          {agent.type}
                        </Badge>
                        <div className={classes.agentStatus}>
                          <div
                            className={`${classes.statusDot} ${
                              agent.status === "INACTIVE"
                                ? classes.inactive
                                : ""
                            }`}
                            style={{
                              backgroundColor: getStatusColor(agent.status),
                            }}
                          />
                          <Text size="xs" c="dimmed">
                            {agent.status.toLowerCase()}
                          </Text>
                        </div>
                      </Group>
                    </Stack>
                  </Group>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Box>
  );
};
