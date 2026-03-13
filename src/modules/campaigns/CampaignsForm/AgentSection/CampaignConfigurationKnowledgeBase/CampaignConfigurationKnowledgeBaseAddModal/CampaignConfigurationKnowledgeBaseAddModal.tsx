// CampaignConfigurationKnowledgeBaseAddModal.tsx
import React, { useEffect } from 'react';
import { Modal, Button, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import KnowledgeBaseSelectionTable from '~/components/KnowledgeBaseSelectionTable';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import { useKnowledgeBaseModalStore } from '~/stores/knowledgeBaseModalStore';
import { useKnowledgeBaseSelectionStore } from '~/stores/knowledgeBaseSelectionStore';
import KnowledgeBaseWizardForm from '~/modules/campaigns/CampaignWizard/StepTwoAgent/KnowledgeBaseSection/KnowledgeBaseWizardForm/KnowledgeBaseWizardForm';
import classes from './CampaignConfigurationKnowledgeBaseAddModal.module.css';
import { useTranslation } from 'react-i18next';

interface CampaignConfigurationKnowledgeBaseAddModalProps {
	opened: boolean;
	onClose: () => void;
	selectedIds: number[];
	onSave: (selectedIds: number[]) => void;
}

const CampaignConfigurationKnowledgeBaseAddModal: React.FC<
	CampaignConfigurationKnowledgeBaseAddModalProps
> = ({ opened, onClose, selectedIds, onSave }) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const {
		view,
		showCreateView,
		showListView,
		reset: resetModalStore,
	} = useKnowledgeBaseModalStore();
	const { addToSelection, reset: resetSelectionStore } =
		useKnowledgeBaseSelectionStore();

	// Reset modal state when closed
	useEffect(() => {
		if (!opened) {
			resetModalStore();
			resetSelectionStore();
		}
	}, [opened, resetModalStore, resetSelectionStore]);

	const handleCreateSuccess = (createdKb: KnowledgeBaseModel) => {
		// Auto-select the newly created knowledge base
		addToSelection(createdKb.id);
		// Go back to list view
		showListView();
	};

	const handleSave = (ids: number[]) => {
		onSave(ids);
	};

	const modalTitle =
		view === 'create'
			? t('form.agent.knowledgeBase.modal.title.create')
			: t('form.agent.knowledgeBase.modal.title.select');

	return (
		<Modal opened={opened} onClose={onClose} title={modalTitle} size='xl'>
			{view === 'create' ? (
				<div className={classes.modalContent}>
					<div className={classes.backButton}>
						<Button
							variant='subtle'
							size='xs'
							leftSection={<IconArrowLeft size={14} />}
							onClick={showListView}
						>
							{t('form.agent.knowledgeBase.modal.backToList')}
						</Button>
					</div>
					<KnowledgeBaseWizardForm
						onSuccess={handleCreateSuccess}
						onCancel={showListView}
					/>
				</div>
			) : (
				<div className={classes.modalContent}>
					<div className={classes.modalHeader}>
						<Text className={classes.subtitle}>
							{t('form.agent.knowledgeBase.modal.subtitle')}
						</Text>
					</div>

					<KnowledgeBaseSelectionTable
						initialSelectedIds={selectedIds}
						showCreateButton
						onCreateNew={showCreateView}
						onCancel={onClose}
						onSave={handleSave}
						emptyMessage={t('form.agent.knowledgeBase.modal.noKnowledgeBases')}
						showFooter
					/>
				</div>
			)}
		</Modal>
	);
};

export default CampaignConfigurationKnowledgeBaseAddModal;
