import React from "react";
import { IconUsersGroup } from "@tabler/icons-react";
import AgentCreate from "../AgentCreate";
import AgentCard from "../AgentCard";
import {
  Title,
  Stack,
  SimpleGrid,
  Text,
  Avatar,
  Paper,
  Transition,
  Button,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import classes from "./AgentList.module.css";
import type AgentListObject from "~/models/AgentListObject";
import AgentSimpleDetails from "../AgentSimpleDetails/AgentSimpleDetails";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import { useGetAllAgents } from "~/queries/agentQueries";
import { Loader, Center } from "@mantine/core";

const AgentList: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 1200px)");

  const [selectedAgent, setSelectedAgent] =
    React.useState<AgentListObject | null>(null);

  const { data: agents = [], isLoading, isError, error } = useGetAllAgents();

  const handleAgentCardClick = (agent: AgentListObject) => {
    if (selectedAgent?.id === agent.id) {
      setSelectedAgent(null);
    } else {
      setSelectedAgent(agent);
    }
  };

  return (
    <ContentContainer
      title="Agent Directory"
      description="Manage and monitor all your AI agents in one place."
      rightSection={
        <>
          <Transition
            mounted={!!selectedAgent}
            transition={isMobile ? "slide-up" : "slide-left"}
            duration={200}
            timingFunction="cubic-bezier(0.4, 0, 0.2, 1)"
          >
            {(styles) => (
              <div style={styles}>
                {selectedAgent && <AgentSimpleDetails agent={selectedAgent} />}
              </div>
            )}
          </Transition>
        </>
      }
      titleRight={
        <Button onClick={open} size="sm">
          New agent
        </Button>
      }
    >
      <Stack>
        <AgentCreate opened={opened} onClose={close} />

        {isLoading && (
          <Center p="xl">
            <Loader size="md" />
          </Center>
        )}

        {isError && (
          <Paper className={classes.emptyState} shadow="none">
            <Stack align="center" gap="xs">
              <Title order={3} className={classes.emptyTitle}>
                Failed to load agents
              </Title>
              <Text className={classes.emptyText} c="red">
                {(error as any)?.message || "Please try again."}
              </Text>
            </Stack>
          </Paper>
        )}

        <Transition
          mounted={agents.length > 0}
          transition="fade"
          duration={400}
          timingFunction="ease"
        >
          {(styles) => (
            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 2, lg: 2, xl: 3 }}
              style={styles}
            >
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  onClick={handleAgentCardClick}
                  agent={agent}
                />
              ))}
            </SimpleGrid>
          )}
        </Transition>

        {agents.length === 0 && (
          <Paper className={classes.emptyState} shadow="none">
            <Stack align="center" gap="xs">
              <div className={classes.avatarContainer}>
                <Avatar size={80} radius="xl" color="blue">
                  <IconUsersGroup size={40} stroke={1.5} />
                </Avatar>
              </div>
              <Title order={3} className={classes.emptyTitle}>
                No Agents Yet
              </Title>
              <Text className={classes.emptyText}>
                Create your first agent to start building amazing conversations
                and automations
              </Text>
            </Stack>
          </Paper>
        )}
      </Stack>
    </ContentContainer>
  );
};

export default AgentList;
