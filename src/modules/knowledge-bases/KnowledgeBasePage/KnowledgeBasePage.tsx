import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import KnowledgeBaseList from './KnowledgeBaseList/KnowledgeBaseList';
import useKnowledgeBaseStore from './store/knowledgeBaseStore';

const KnowledgeBasePage = () => {
  const right = useKnowledgeBaseStore((s) => s.rightComponent);

  return (
    <ContentContainer
      title="Knowledge Bases"
      description="Manage collections of documents used by your agents"
      rightSection={right ?? <></>}
    >
      <KnowledgeBaseList />
    </ContentContainer>
  );
};

export default KnowledgeBasePage;
