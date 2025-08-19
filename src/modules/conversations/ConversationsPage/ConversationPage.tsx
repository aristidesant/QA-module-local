import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import SectionCard from "~/components/SectionCard";
import ConversationsList from "../ConversationsList";
import { useConversationStore } from "~/stores/useConversationStore";
import FallbackRightComponent from "~/components/FallbackRightComponent";
import { useEffect } from "react";

const ConversationsPage = () => {
  const { selectionContent, clearSelection } = useConversationStore(
    (state) => state
  );

  useEffect(() => {
    return () => {
      clearSelection?.();
    };
  }, []);

  return (
    <ContentContainer
      description="Manage, review, and take action on conversations across your campaigns. Select a conversation to view transcripts, agent notes, and next steps."
      title="Conversations"
      rightSection={
        selectionContent || (
          <FallbackRightComponent description="No conversation selected. Choose a conversation to view transcripts, notes, and associated actions." />
        )
      }
    >
      <SectionCard>
        <ConversationsList />
      </SectionCard>
    </ContentContainer>
  );
};

export default ConversationsPage;
