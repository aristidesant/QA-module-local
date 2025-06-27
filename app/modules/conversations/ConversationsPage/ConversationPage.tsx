import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import SectionCard from "~/components/SectionCard";
import ConversationsList from "../ConversationsList";
import { useConversationStore } from "~/stores/useConversationStore";

const ConversationsPage = () => {
  const { selectionContent } = useConversationStore();
  return (
    <ContentContainer
      description="Manage and monitor all your conversations in one place."
      title="Conversations"
      rightSection={selectionContent || <>Select a conversation</>}
    >
      <SectionCard>
        <ConversationsList />
      </SectionCard>
    </ContentContainer>
  );
};

export default ConversationsPage;
