import React from "react";
import { Text, Group, Loader, Button } from "@mantine/core";
import { IconChevronLeft, IconTrash } from "@tabler/icons-react";
import { useCampaignsStore } from "~/stores/campaignsStore";
import AgentCampaignList from "../AgentCampaignList";
import { useGetAgent } from "~/queries/agentQueries";
import styles from "./AgentCampaignPreview.module.css";
import { VoiceMiniPlayer } from "~/components/VoiceMiniPlayer";
import { openConfirmModal } from "@mantine/modals";
import AgentProfile from "~/components/AgentProfile";
import AgentVoiceProgress from "~/modules/agents/AgentSimpleDetails/AgentVoiceProgress";
import { useDeleteCampaignAgent } from "~/queries/campaignAgentsQueries";

interface AgentCampaignPreviewProps {
  agentId: string;
  campaignAgentId: number;
  campaignId: number;
}

export const AgentCampaignPreview: React.FC<AgentCampaignPreviewProps> = ({
  agentId,
  campaignAgentId,
  campaignId,
}) => {
  const { setRightComponent } = useCampaignsStore();
  const { data: agent, isLoading } = useGetAgent(agentId);
  const deleteMutation = useDeleteCampaignAgent();

  const handleDelete = () => {
    openConfirmModal({
      title: "Remove Agent from campaign",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to remove this agent from the campaign? This
          action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteMutation.mutate(
          { campaignId, id: campaignAgentId },
          {
            onSuccess: () => {
              setRightComponent?.(<AgentCampaignList />);
            },
          }
        );
      },
    });
  };

  return (
    <div>
      <button
        className={styles.backButton}
        onClick={() => setRightComponent?.(<AgentCampaignList />)}
        aria-label="Back to agents"
      >
        <IconChevronLeft size={18} /> Back to agents
      </button>
      {isLoading || !agent ? (
        <Group justify="center" align="center" style={{ minHeight: 200 }}>
          <Loader />
        </Group>
      ) : (
        <>
          <div className={styles.agentDetails}>
            <AgentProfile
              agent={agent}
              traits={["Warm", "Playful"]}
              size="md"
            />
            <div style={{ width: "100%", marginTop: 18 }}>
              <AgentVoiceProgress
                stability={
                  agent.config?.conversationConfig?.tts?.stability ?? 0.5
                }
                speed={agent.config?.conversationConfig?.tts?.speed ?? 1.0}
                similarityBoost={
                  agent.config?.conversationConfig?.tts?.similarityBoost ?? 0.8
                }
                optimizeLatency={
                  agent.config?.conversationConfig?.tts
                    ?.optimizeStreamingLatency ?? 3
                }
              />
            </div>
          </div>
          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <Text fw={600} size="sm" mb={4}>
              Quick actions
            </Text>
            <Button
              onClick={handleDelete}
              color="red"
              fullWidth
              variant="light"
              leftSection={<IconTrash size={18} />}
              disabled={deleteMutation.isPending}
            >
              Remove Agent from campaign
            </Button>
          </div>
          {/* VoiceMiniPlayer at the bottom */}
          <div className={styles.voicePlayer}>
            <VoiceMiniPlayer voiceUrl={agent.voice?.previewUrl} />
          </div>
        </>
      )}
    </div>
  );
};

export default AgentCampaignPreview;
