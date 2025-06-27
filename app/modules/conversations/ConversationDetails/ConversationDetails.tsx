import { Box, Tabs, Tooltip, Divider } from "@mantine/core";
import { IconInfoCircle, IconAnalyze, IconFileText } from "@tabler/icons-react";
import { useMemo } from "react";
import { format } from "date-fns";
import type {
  TranscriptContent,
  ConversationsModel,
} from "~/models/ConversationsModels";
import type AgentListObject from "~/models/AgentListObject";
import type { Campaign } from "~/models/CampaignsModel";

// Simplified types for the component props
type AgentInfo = Pick<AgentListObject, "id" | "name"> | null;
type CampaignInfo = Pick<
  Campaign,
  "id" | "name" | "description" | "status"
> | null;

import { TranscriptViewer } from "~/modules/conversations/TranscriptViewer";
import { AnalysisPanel } from "~/modules/conversations/AnalysisPanel";
import { MetadataPanel } from "~/modules/conversations/MetadataPanel";
import styles from "./ConversationDetails.module.css";
import ConversationOverview from "../ConversationOverview";

interface ConversationDetailsProps {
  conversation: ConversationsModel;
}

export function ConversationDetails({
  conversation,
}: ConversationDetailsProps) {
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return format(date, "MMM d, yyyy h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
      return "N/A";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
  };

  const duration = useMemo(() => {
    const duration =
      conversation.transcriptContent?.metadata?.call_duration_secs;
    return typeof duration === "number" && !isNaN(duration) && duration > 0
      ? duration
      : undefined;
  }, [conversation.transcriptContent]);

  // Extract and safely handle conversation data
  const contact = conversation.contact;
  const agent = conversation.agent;
  const campaign = conversation.campaign;
  const startDate = formatDate(conversation.startDate);
  const status = conversation.status;
  const transcriptContent = conversation.transcriptContent;

  // Create safe versions with null checks and defaults
  const safeContact = contact ?? null;
  const safeAgent = agent ?? null;
  const safeCampaign = campaign ?? null;
  const safeStartDate = startDate || "";
  const safeStatus = status || "";
  const safeTranscriptContent: TranscriptContent = transcriptContent || {
    transcript: [],
    metadata: {
      cost: 0,
      feedback: {
        likes: 0,
        dislikes: 0,
        overall_score: null,
      },
      call_duration_secs: 0,
      termination_reason: "",
      start_time_unix_secs: 0,
    },
    analysis: {
      call_successful: "",
      transcript_summary: "",
      data_collection_results: {},
      evaluation_criteria_results: {},
    },
    conversationInitiationClientData: {
      dynamic_variables: {},
      custom_llm_extra_body: {},
      conversation_config_override: {},
    },
  };

  return (
    <Box p="md" className={styles.container}>
      <Tabs
        defaultValue="overview"
        classNames={{
          tab: styles.tab,
          list: styles.tabList,
        }}
      >
        <Tabs.List>
          <Tooltip label="Overview" position="bottom">
            <Tabs.Tab value="overview">
              <IconInfoCircle size={20} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label="Transcript" position="bottom">
            <Tabs.Tab value="transcript">
              <IconFileText size={20} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label="Analysis" position="bottom">
            <Tabs.Tab value="analysis">
              <IconAnalyze size={20} />
            </Tabs.Tab>
          </Tooltip>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <ConversationOverview
            conversation={conversation}
            status={safeStatus}
            duration={duration}
          />
        </Tabs.Panel>

        <Tabs.Panel value="transcript" pt="md">
          <TranscriptViewer transcript={safeTranscriptContent.transcript} />
        </Tabs.Panel>

        <Tabs.Panel value="analysis" pt="md">
          <AnalysisPanel analysis={safeTranscriptContent.analysis} />
          <Divider my="md" />
          <MetadataPanel metadata={safeTranscriptContent.metadata} />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

export default ConversationDetails;
