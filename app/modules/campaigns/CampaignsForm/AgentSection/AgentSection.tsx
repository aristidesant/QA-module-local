import { useEffect } from "react";
import { useCampaignsStore } from "~/stores/campaignsStore";
import { AgentList } from "./AgentList";
import AgentConfiguration from "~/modules/agent/AgentConfiguration/AgentConfiguration";
import { useCampaignFormContext } from "../../campaignFormFunctions";

const AgentSection: React.FC = () => {
  const { setRightComponent } = useCampaignsStore((state) => state);
  const form = useCampaignFormContext();
  useEffect(() => {
    setRightComponent?.(<AgentList />); // Clear the right component when this section mounts
  }, []);

  return (
    <AgentConfiguration
      withVoiceSelection={false}
      editableAgent={form.values.agentConfig || {}}
      setEditableAgent={(updatedAgent) => {
        // Handle both direct object and function updates
        if (typeof updatedAgent === "function") {
          const currentAgent = form.values.agentConfig || {};
          const newAgent = updatedAgent(currentAgent);
          form.setFieldValue("agentConfig", newAgent);
        } else {
          form.setFieldValue("agentConfig", updatedAgent);
        }
      }}
    />
  );
};

export default AgentSection;
