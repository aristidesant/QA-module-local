import { Card, Avatar } from "@mantine/core";
import styles from "./AgentNotSelected.module.css";
import React from "react";
import { IconQuestionMark } from "@tabler/icons-react";

export const AgentNotSelected: React.FC = () => (
  <Card withBorder>
    <div className={styles.agentNotSelectedDetails}>
      <div className={styles.avatarSection}>
        <div className={styles.avatarWrapper}>
          <Avatar size={120} className={styles.avatar} alt="No agent selected">
            <IconQuestionMark size={120} />
          </Avatar>
          <span className={styles.statusDotOffline} />
        </div>
      </div>
      <div className={styles.noAgentTitle}>No agent selected</div>
      <div className={styles.noAgentSubtitle}>
        Please select an agent to see details.
      </div>
    </div>
  </Card>
);

export default AgentNotSelected;
