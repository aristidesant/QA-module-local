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

interface CampaignConfigurationKnowledgeBaseAddModalProps {
	opened: boolean;
	onClose: () => void;
	selectedIds: number[];
	onSave: (selectedIds: number[]) => void;
}

const CampaignConfigurationKnowledgeBaseAddModal: React.FC<
	CampaignConfigurationKnowledgeBaseAddModalProps
> = ({ opened, onClose, selectedIds, onSave }) => {
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
		view === 'create' ? 'Create Knowledge Base' : 'Select Knowledge Bases';

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
							Back to list
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
							Pick the knowledge bases that should power this agent. Click a row
							or toggle the checkbox to select.
						</Text>
					</div>

					<KnowledgeBaseSelectionTable
						initialSelectedIds={selectedIds}
						showCreateButton
						onCreateNew={showCreateView}
						onCancel={onClose}
						onSave={handleSave}
						emptyMessage='No knowledge bases available'
						showFooter
					/>
				</div>
			)}
		</Modal>
	);
};

export default CampaignConfigurationKnowledgeBaseAddModal;
