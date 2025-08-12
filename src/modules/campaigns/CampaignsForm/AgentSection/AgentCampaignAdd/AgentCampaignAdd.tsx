import React, { useState } from "react";
import { Button, Text, Avatar, Loader, Card } from "@mantine/core";
import { IconUserPlus, IconCheck } from "@tabler/icons-react";
import { useGetAllAgents } from "~/queries/agentQueries";
import { useCreateCampaignAgent } from "~/queries/campaignAgentsQueries";
import type AgentListObject from "~/models/AgentListObject";
import classes from "./AgentCampaignAdd.module.css";
import { isAxiosError } from "axios";
import { notifications } from "@mantine/notifications";

interface AgentCampaignAddProps {
  campaignId: number;
  excludedAgents: string[];
  onComplete: () => void;
}

export const AgentCampaignAdd: React.FC<AgentCampaignAddProps> = ({
  campaignId,
  excludedAgents,
  onComplete,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const { data: agents, isLoading } = useGetAllAgents();
  const createMutation = useCreateCampaignAgent();

  // Only show agents not already in the campaign
  const availableAgents = (agents || []).filter(
    (agent: AgentListObject) => !excludedAgents.includes(agent.id)
  );

  const handleAdd = () => {
    if (!selectedAgent) return;
    createMutation.mutate(
      { campaignId, agentId: selectedAgent },
      {
        onSuccess: onComplete,
        onError: (error) => {
          let apiMessage = "Failed to add agent to campaign";
          if (isAxiosError(error)) {
            apiMessage = error.response?.data?.message || apiMessage;
          }
          notifications.show({
            title: "Error",
            message: apiMessage,
            color: "red",
          });
        },
      }
    );
  };

  return (
    <div className={classes.container}>
      <Text size="sm" c="dimmed">
        Choose an agent to assign to this campaign.
      </Text>
      <div className={classes.agentList}>
        {isLoading ? (
          <Loader />
        ) : availableAgents.length === 0 ? (
          <Text color="dimmed">No available agents.</Text>
        ) : (
          availableAgents.map((agent: AgentListObject) => (
            <Card
              key={agent.id}
              withBorder
              className={
                selectedAgent === agent.id
                  ? `${classes.agentCard} ${classes.selected}`
                  : classes.agentCard
              }
              onClick={() => setSelectedAgent(agent.id)}
              tabIndex={0}
              aria-pressed={selectedAgent === agent.id}
              role="button"
            >
              <div className={classes.cardContent}>
                <Avatar
                  radius="xl"
                  size={32}
                  name={agent.name}
                  className={classes.avatar}
                />
                <div className={classes.infoBlock}>
                  <span className={classes.agentName}>{agent.name}</span>
                  <Text size="xs" color="dimmed" className={classes.language}>
                    {agent.voice?.language || "Unknown"}
                  </Text>
                </div>
                {selectedAgent === agent.id && (
                  <IconCheck
                    size={20}
                    color="var(--mantine-color-blue-6)"
                    className={classes.checkIcon}
                  />
                )}
              </div>
            </Card>
          ))
        )}
      </div>
      <Button
        className={classes.addBtn}
        leftSection={<IconUserPlus size={18} />}
        onClick={handleAdd}
        disabled={!selectedAgent || createMutation.isPending}
        loading={createMutation.isPending}
        fullWidth
        color="blue"
        radius="md"
        aria-label="Add selected agent to campaign"
      >
        Add Agent
      </Button>
    </div>
  );
};

export default AgentCampaignAdd;
