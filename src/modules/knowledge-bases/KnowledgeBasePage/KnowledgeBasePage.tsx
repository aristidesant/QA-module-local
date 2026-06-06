import { Modal, Text } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import KnowledgeBaseList from './KnowledgeBaseList/KnowledgeBaseList';
import KnowledgeBaseForm from './KnowledgeBaseForm/KnowledgeBaseForm';
import useKnowledgeBaseStore from './store/knowledgeBaseStore';
import { useTranslation } from 'react-i18next';
import styles from './KnowledgeBasePage.module.css';

const KnowledgeBasePage = () => {
	const drawerOpened = useKnowledgeBaseStore((s) => s.opened);
	const drawerMode = useKnowledgeBaseStore((s) => s.mode);
	const selectedId = useKnowledgeBaseStore((s) => s.selectedId);
	const closeDrawer = useKnowledgeBaseStore((s) => s.closeDrawer);
	const { t } = useTranslation('knowledge-bases');
	const modalTitle =
		drawerMode === 'create' ? t('drawer.createTitle') : t('drawer.editTitle');

	return (
		<>
			<ContentContainer
				title={t('list.title')}
				description={t('list.description')}
			>
				<KnowledgeBaseList />
			</ContentContainer>
			<Modal
				opened={drawerOpened}
				onClose={closeDrawer}
				centered
				size='lg'
				title={
					<div className={styles.modalHeader}>
						<Text className={styles.modalTitle}>{modalTitle}</Text>
						<Text className={styles.modalDescription}>
							{t('form.description')}
						</Text>
					</div>
				}
				classNames={{
					content: styles.modalContent,
					header: styles.modalHeaderShell,
					title: styles.modalTitleShell,
					body: styles.modalBody,
				}}
			>
				<KnowledgeBaseForm
					id={drawerMode === 'edit' ? (selectedId ?? undefined) : undefined}
				/>
			</Modal>
		</>
	);
};

export default KnowledgeBasePage;
