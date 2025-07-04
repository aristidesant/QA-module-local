import React from "react";
import { Checkbox, Group, Text } from "@mantine/core";
import { IconSettings, IconLink } from "@tabler/icons-react";
import { useAgentStore } from "../../../stores/agentStore";
import SectionCard from "../../../components/SectionCard";

import styles from "./AgentConfigurationTypeSelector.module.css";
export const AgentConfigurationTypeSelector: React.FC = () => {
  const agentConfigurationType = useAgentStore((s) => s.agentConfigurationType);
  const setAgentConfigurationType = useAgentStore(
    (s: any) => (s as any).setAgentConfigurationType
  );

  return (
    <SectionCard
      title="Agent Configuration"
      description="Choose to set custom parameters or inherit settings from an existing campaign."
    >
      <div className={styles.options}>
        <Checkbox.Card
          className={styles.root}
          checked={agentConfigurationType === "campaign"}
          onClick={() => setAgentConfigurationType("campaign")}
          data-checked={agentConfigurationType === "campaign"}
        >
          <div className={styles.checkbox}>
            <Checkbox.Indicator
              checked={agentConfigurationType === "campaign"}
            />
          </div>
          <div className={styles.content}>
            <span className={styles.label}>Inherit from Campaign</span>
            <div className={styles.description}>
              Automatically apply the configuration from a selected campaign.
            </div>
          </div>
        </Checkbox.Card>
        <Checkbox.Card
          className={styles.root}
          checked={agentConfigurationType === "custom"}
          onClick={() => setAgentConfigurationType("custom")}
          data-checked={agentConfigurationType === "custom"}
        >
          <div className={styles.checkbox}>
            <Checkbox.Indicator checked={agentConfigurationType === "custom"} />
          </div>
          <div className={styles.content}>
            <span className={styles.label}>Custom configuration</span>
            <div className={styles.description}>
              Define personalized voice, behavior, and interaction settings for
              this agent.
            </div>
          </div>
        </Checkbox.Card>
      </div>
    </SectionCard>
  );
};
