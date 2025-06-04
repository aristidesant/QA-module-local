import React from "react";
import { IconUsersGroup, IconPlus, IconX } from "@tabler/icons-react";
import AgentCreate from "../AgentCreate";
import AgentCard from "../AgentCard";
import {
  Button,
  Title,
  Stack,
  SimpleGrid,
  Tooltip,
  Text,
  Avatar,
  Paper,
  Transition,
  Card,
  Flex,
  Box,
  ActionIcon,
  CloseButton,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router";
import classes from "./AgentList.module.css";
import type AgentListObject from "~/models/AgentListObject";
import SectionCard from "~/components/SectionCard";
import AgentSimpleDetails from "../AgentSimpleDetails/AgentSimpleDetails";

interface AgentListProps {
  agents: any[];
  onCreateNew: () => void;
}

const AgentList: React.FC<AgentListProps> = ({ agents, onCreateNew }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1200px)");

  const [selectedAgent, setSelectedAgent] =
    React.useState<AgentListObject | null>(null);

  const handleAgentClick = (agent: AgentListObject) => {
    navigate(`/agent/${agent.id}`, {
      replace: true,
    });
  };

  const handleAgentCardClick = (agent: AgentListObject) => {
    if (selectedAgent?.id === agent.id) {
      setSelectedAgent(null);
    } else {
      setSelectedAgent(agent);
    }
  };

  const handleCreateSuccessCallback = (agent: any) => {
    onCreateNew();
    close();
  };

  const closeSidebar = () => {
    setSelectedAgent(null);
  };

  return (
    <div className={classes.containerLayout}>
      <div className={`${classes.agentListContainer}`}>
        <SectionCard
          title="Agents"
          description={`${agents.length} agents available`}
          icon={IconUsersGroup}
          headerActions={
            <Tooltip
              label="Create a new agent"
              withArrow
              position="left"
              transitionProps={{ transition: "slide-left", duration: 200 }}
            >
              <Button
                onClick={open}
                size="md"
                leftSection={<IconPlus size={18} stroke={1.5} />}
                className={classes.newAgentBtn}
                radius="xl"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan", deg: 135 }}
              >
                New Agent
              </Button>
            </Tooltip>
          }
        >
          <AgentCreate
            opened={opened}
            onClose={close}
            onSave={handleCreateSuccessCallback}
          />

          <Transition
            mounted={agents.length > 0}
            transition="fade"
            duration={400}
            timingFunction="ease"
          >
            {(styles) => (
              <div
                className={`${classes.agentsGrid} ${classes.gridContainer}`}
                style={styles}
              >
                {agents.map((agent) => (
                  <SimpleGrid key={agent.agent_id}>
                    <AgentCard
                      onNavigate={handleAgentClick}
                      onClick={handleAgentCardClick}
                      agent={agent}
                    />
                  </SimpleGrid>
                ))}
              </div>
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
                  Create your first agent to start building amazing
                  conversations and automations
                </Text>
              </Stack>
            </Paper>
          )}
        </SectionCard>
      </div>

      <Transition
        mounted={!!selectedAgent}
        transition={isMobile ? "slide-up" : "slide-left"}
        duration={500}
        timingFunction="cubic-bezier(0.4, 0, 0.2, 1)"
      >
        {(styles) => (
          <div style={styles}>
            {selectedAgent && <AgentSimpleDetails agent={selectedAgent} />}
          </div>
        )}
      </Transition>
    </div>
  );
};

export default AgentList;
