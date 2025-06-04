import { ActionIcon, SimpleGrid, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconUserSearch } from "@tabler/icons-react";
import { AgentSelection } from "~/components/AgentSelection/AgentSelection";
import SectionCard from "~/components/SectionCard";
import AgentCard from "~/modules/agents/components/AgentCard";

import {
  useCreateCampaignAgent,
  useGetCampaignAgents,
} from "~/queries/campaignAgentsQueries";

type CampaignAgentListProps = {
  // Define any props if needed
  campaignId: string; // Optional campaign ID to filter agents
};

const CampaignAgentList: React.FC<CampaignAgentListProps> = ({
  campaignId,
}) => {
  const { data: agents } = useGetCampaignAgents(
    campaignId ? parseInt(campaignId) : 0
  );

  const { mutateAsync: assignAgentToCampaign } = useCreateCampaignAgent();

  const handleAddAgent = () => {
    modals.open({
      modalId: "add-agent-to-campaign",
      title: "Add Agent to Campaign",
      size: "lg",
      children: (
        <AgentSelection
          onSelect={async (agent) => {
            try {
              modals.close("add-agent-to-campaign");
              console.log("Selected agent:", agent, agent.config["agent_id"]);
              // Call the mutation to assign the agent to the campaign
              await assignAgentToCampaign({
                campaignId: campaignId ? parseInt(campaignId) : 0,
                agentId: agent.config["agent_id"],
              });
              notifications.show({
                title: "Success",
                message: `Agent ${agent.config["agent_id"]} added to campaign successfully!`,
                color: "green",
              });
            } catch (error) {
              notifications.show({
                title: "Error",
                message: "Failed to add agent to campaign",
                color: "red",
              });
            }
          }}
        />
      ),
    });
  };
  return (
    <SectionCard
      title="Campaign Agents"
      description="List of agents assigned to campaigns"
      headerActions={
        <ActionIcon onClick={handleAddAgent}>
          <IconPlus />
        </ActionIcon>
      }
      icon={IconUserSearch}
    >
      {agents && agents.length > 0 ? (
        <SimpleGrid cols={{ base: 2, sm: 3 }}>
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent.agent} />
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
