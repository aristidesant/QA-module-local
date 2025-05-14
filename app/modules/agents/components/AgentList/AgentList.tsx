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
  const fetcher = useFetcher();
  const handleAgentClick = (agent: AgentListObject) => {
    console.log("Agent clicked:", agent);
    navigate(`/agent/${agent.id}`, {
      replace: true,
    });
  };

  const handleCreateSuccessCallback = (agent: any) => {
    onCreateNew();
    close();
  };

  const handleRemove = (agent: AgentListObject) => {
    fetcher.submit(
      {},
      {
        method: "delete",
        action: `/agent/${agent.id}`,
      }
    );
  };

  return (
    <ContainerCard
      title="Agent Gallery"
      subtitle={`${agents.length} agents available`}
      icon={IconUsersGroup}
      className={classes.container}
      rightSection={
        <Tooltip label="Create a new agent" withArrow position="left">
          <Button
            onClick={open}
            size="md"
            leftSection={<IconPlus size={18} />}
            className={classes.newAgentBtn}
            radius="xl"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan", deg: 90 }}
            style={{ fontWeight: 600, letterSpacing: 0.2 }}
          >
            New Agent
          </Button>
        </Tooltip>
      }
    >
      <Modal opened={opened} onClose={close} title="Create New Agent" centered>
        <AgentCreate
          opened={opened}
          onClose={close}
          onSave={handleCreateSuccessCallback}
        />
      </Modal>

      {agents.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
          {agents.map((agent) => (
            <div
              key={agent.agent_id}
              className={classes.agentButton}
              style={{ transition: "box-shadow 0.2s, border 0.2s", padding: 0 }}
            >
              <AgentCard
                onRemove={handleRemove}
                onClick={handleAgentClick}
                agent={agent}
              />
            </div>
          ))}
        </SimpleGrid>
      )}

      {agents.length === 0 && (
        <Center className={classes.emptyState}>
          <Stack align="center" gap="xs">
            <Avatar size={72} radius="xl" color="gray">
              <IconUsersGroup size={36} />
            </Avatar>
            <Title
              order={3}
              className={classes.emptyTitle}
              style={{ marginTop: 8 }}
            >
              No agents found
            </Title>
            <Text size="md" className={classes.emptyText} mt={-5}>
              Create a new agent to get started
            </Text>
            <Button
              onClick={open}
              size="md"
              mt="md"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
              radius="xl"
            >
              Create Agent
            </Button>
          </Stack>
        </Center>
      )}
    </ContainerCard>
  );
};

export default AgentList;
