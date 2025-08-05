import { Box, Tabs, Tooltip, Divider, Loader, Center } from "@mantine/core";
import { IconInfoCircle, IconAnalyze, IconFileText } from "@tabler/icons-react";
import { useMemo } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type {
  TranscriptContent,
  ConversationsModel,
} from "~/models/ConversationsModels";

import { TranscriptViewer } from "~/modules/conversations/TranscriptViewer";
import { AnalysisPanel } from "~/modules/conversations/AnalysisPanel";
import { MetadataPanel } from "~/modules/conversations/MetadataPanel";
import styles from "./ConversationDetails.module.css";
import ConversationOverview from "../ConversationOverview";
import { useGetConversation } from "~/queries/conversationsQueries";
dayjs.extend(relativeTime);

interface ConversationDetailsProps {
  conversation: ConversationsModel;
}

export function ConversationDetails({
  conversation: conversationElement,
}: ConversationDetailsProps) {
  const {
    data: conversation,
    isLoading,
    isFetching,
  } = useGetConversation(`${conversationElement.id}`);

  const duration = useMemo(() => {
    const duration =
      conversation?.transcriptContent?.metadata?.call_duration_secs;
    return typeof duration === "number" && !isNaN(duration) && duration > 0
      ? duration
      : undefined;
  }, [conversation?.transcriptContent]);

  const status = conversation?.status;
  const transcriptContent = conversation?.transcriptContent;

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

  if (isLoading || isFetching) {
    return (
      <Center p="md" className={styles.container}>
        <Loader size="lg" color="var(--mantine-primary-color-filled)" />
      </Center>
    );
  }

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
          {conversation && (
            <ConversationOverview
              conversation={conversation as ConversationsModel}
              status={safeStatus}
              duration={duration}
            />
          )}
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
