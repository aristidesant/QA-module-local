import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import KnowledgeBaseList from './KnowledgeBaseList/KnowledgeBaseList';
import useKnowledgeBaseStore from './store/knowledgeBaseStore';
import { Button } from '@mantine/core';
import { IconPlus, IconBook } from '@tabler/icons-react';
import KnowledgeBaseForm from './KnowledgeBaseForm/KnowledgeBaseForm';
import { usePermissions } from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { useTranslation } from 'react-i18next';

const KnowledgeBasePage = () => {
	const right = useKnowledgeBaseStore((s) => s.rightComponent);
	const setRight = useKnowledgeBaseStore((s) => s.setRightComponent);
	const { t } = useTranslation('knowledge-bases');
	const { canPerformAction } = usePermissions();
	const canCreate = canPerformAction(
		ModuleEnum.KNOWLEDGE_BASES,
		PermissionEnum.CREATE
	);

	return (
		<ContentContainer
			title={t('page.title')}
			description={t('page.description')}
			titleIcon={<IconBook size={20} />}
			titleRight={
				canCreate ? (
					<Button
						onClick={() => setRight(<KnowledgeBaseForm />)}
						leftSection={<IconPlus size={16} />}
						size='sm'
					>
						{t('page.actions.new')}
					</Button>
				) : null
			}
			rightSection={right ?? <></>}
		>
			<KnowledgeBaseList />
		</ContentContainer>
	);
};

export default KnowledgeBasePage;
