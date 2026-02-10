import { Modal, Loader, Center } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useAgentTestsPage } from '../../context/AgentTestsPageContext';
import StudioConfigPane from './components/StudioConfigPane';
import StudioSimulationPane from './components/StudioSimulationPane';
import styles from '../../AgentTestsPage.module.css';

const AgentTestStudioModal = () => {
	const { t } = useTranslation('agent-tests');
	const {
		isModalOpen,
		closeModal,
		editingTest,
		editingTestLoading,
		form,
		handleSubmit,
	} = useAgentTestsPage();

	return (
		<Modal
			opened={isModalOpen}
			onClose={closeModal}
			title={editingTest ? t('form.editTitle') : t('form.createTitle')}
			size='95%'
			closeOnClickOutside={false}
			classNames={{
				content: styles.modalContent,
				body: styles.modalBody,
				header: styles.modalHeader,
			}}
		>
			{editingTestLoading ? (
				<Center h={400}>
					<Loader size='lg' />
				</Center>
			) : (
				<form
					id='agent-test-form'
					onSubmit={form.onSubmit(handleSubmit)}
					className={styles.studioForm}
				>
					<div className={styles.studioLayout}>
						<StudioConfigPane />
						<StudioSimulationPane />
					</div>
				</form>
			)}
		</Modal>
	);
};

export default AgentTestStudioModal;
