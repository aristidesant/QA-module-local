import { ActionIcon, SimpleGrid, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconUserSearch } from "@tabler/icons-react";
import { useCallback } from "react";
import { isAxiosError } from "axios";
import { AgentSelection } from "~/components/AgentSelection/AgentSelection";
import SectionCard from "~/components/SectionCard";
import type AgentListObject from "~/models/AgentListObject";
import AgentCard from "~/modules/agents/AgentCard";
import {
  useCreateCampaignAgent,
  useGetCampaignAgents,
} from "~/queries/campaignAgentsQueries";

interface CampaignAgentListProps {
  campaignId: string;
}

const CampaignAgentList: React.FC<CampaignAgentListProps> = ({
  campaignId,
}) => {
  const { data: agents } = useGetCampaignAgents(
    campaignId ? parseInt(campaignId) : 0
  );

  const { mutateAsync: assignAgentToCampaign } = useCreateCampaignAgent();

  const handleAgentSelect = useCallback(
    async (agent: AgentListObject) => {
      try {
        modals.close("add-agent-to-campaign");
        const campaignIdNum = parseInt(campaignId, 10);

        if (isNaN(campaignIdNum) || !agent.id) {
          throw new Error("Invalid campaign ID or agent ID");
        }

        await assignAgentToCampaign({
          campaignId: campaignIdNum,
          agentId: agent.id,
        });

        notifications.show({
          title: "Success",
          message: `Agent ${agent.name} added to campaign successfully!`,
          color: "green",
        });
      } catch (error) {
        console.error("Error adding agent to campaign:", error);
        let message = "Failed to add agent to campaign";

        if (isAxiosError(error)) {
          console.log("Axios error detected:", error);
          const apiMessage = (
            error.response?.data as { message?: string } | undefined
          )?.message;
          message = apiMessage || error.message || message;
        } else if (error instanceof Error) {
          message = error.message || message;
        }

        console.log("About to show notification with message:", message);

        notifications.show({
          title: "Error",
          message,
          color: "red",
        });
      }
    },
    [campaignId, assignAgentToCampaign]
  );

  const handleAddAgent = useCallback(() => {
    modals.open({
      modalId: "add-agent-to-campaign",
      title: "Add Agent to Campaign",
      size: "lg",
      children: <AgentSelection onSelect={handleAgentSelect} />,
    });
  }, [handleAgentSelect]);
  return (
    <SectionCard
      title="Campaign Agents"
      description="List of agents assigned to campaigns"
      headerActions={
        <ActionIcon
          onClick={handleAddAgent}
          aria-label="Add agent to campaign"
          variant="filled"
          color="blue"
        >
          <IconPlus size={20} />
        </ActionIcon>
      }
      icon={IconUserSearch}
    >
      {agents && agents.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {agents.map((campaignAgent) => (
            <AgentCard
              key={`${campaignAgent.id}-${campaignAgent.agent.id}`}
              agent={campaignAgent.agent}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Text c="dimmed" ta="center">
          No agents assigned to this campaign.
        </Text>
      )}
    </SectionCard>
  );
};

export default CampaignAgentList;
