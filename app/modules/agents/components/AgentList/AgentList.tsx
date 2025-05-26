import React from "react";
import { IconUsersGroup, IconPlus } from "@tabler/icons-react";
import AgentCreate from "../AgentCreate";
import AgentCard from "../AgentCard";
import {
  Button,
  Group,
  Title,
  Modal,
  Stack,
  UnstyledButton,
  Center,
  Box,
  SimpleGrid,
  Tooltip,
  ThemeIcon,
  Text,
  Avatar,
  Paper,
  Transition,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useFetcher, useNavigate } from "react-router";
import ContainerCard from "../../../../components/ui/ContainerCard/ContainerCard";
import classes from "./AgentList.module.css";
import type AgentListObject from "~/models/AgentListObject";

interface AgentListProps {
  agents: any[];
  onCreateNew: () => void;
}

const AgentList: React.FC<AgentListProps> = ({ agents, onCreateNew }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  const handleAgentClick = (agent: AgentListObject) => {
    navigate(`/agent/${agent.id}`, {
      replace: true,
    });
  };

  const handleCreateSuccessCallback = (agent: any) => {
    onCreateNew();
    close();
  };

  return (
    <ContainerCard
      title="Agents"
      subtitle={`${agents.length} agents available`}
      icon={IconUsersGroup}
      rightSection={
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
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            spacing="lg"
            className={classes.gridContainer}
            style={styles}
          >
            {agents.map((agent) => (
              <div key={agent.agent_id} className={classes.agentButton}>
                <AgentCard onClick={handleAgentClick} agent={agent} />
              </div>
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
    </ContainerCard>
  );
};

export default AgentList;
