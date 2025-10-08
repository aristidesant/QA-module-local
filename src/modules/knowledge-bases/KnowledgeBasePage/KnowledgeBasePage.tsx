import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import KnowledgeBaseList from './KnowledgeBaseList/KnowledgeBaseList';
import useKnowledgeBaseStore from './store/knowledgeBaseStore';
import { Button } from '@mantine/core';
import { IconPlus, IconBook } from '@tabler/icons-react';
import KnowledgeBaseForm from './KnowledgeBaseForm/KnowledgeBaseForm';

const KnowledgeBasePage = () => {
	const right = useKnowledgeBaseStore((s) => s.rightComponent);
	const setRight = useKnowledgeBaseStore((s) => s.setRightComponent);

	return (
		<ContentContainer
			title='Knowledge Bases'
			description='Manage collections of documents used by your agents'
			titleIcon={<IconBook size={20} />}
			titleRight={
				<Button
					onClick={() => setRight(<KnowledgeBaseForm />)}
					leftSection={<IconPlus size={16} />}
					size='sm'
				>
					New Knowledge Base
				</Button>
			}
			rightSection={right ?? <></>}
		>
			<KnowledgeBaseList />
		</ContentContainer>
	);
};

export default KnowledgeBasePage;
