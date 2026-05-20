import { useState } from 'react';
import {
	useAgentBehaviors,
	useDeleteAgentBehavior,
	useCheckDeleteAgentBehavior,
	useGetAgentBehavior,
} from '~/queries/useAgentBehaviors';
import type { AgentBehavior } from '~/models/AgentBehavior';
import {
	Button,
	Modal,
	Text,
	Loader,
	Alert,
	List,
	Group,
	Box,
	Center,
} from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import AgentBehaviorsForm from './AgentBehaviorsForm/AgentBehaviorsForm';
import AgentBehaviorsList from './AgentBehaviorsList/AgentBehaviorsList';
import BatchReplaceModal from './BatchReplaceModal/BatchReplaceModal';
import CloneBehaviorModal from './CloneBehaviorModal';
import ReplaceWithBackupModal from './ReplaceWithBackupModal';
import SectionCard, { type CardActionsConfig } from '~/components/SectionCard';
import { useTranslation } from 'react-i18next';
import styles from './AgentBehaviorsPage.module.css';

const AgentBehaviorsPage = () => {
	const { t } = useTranslation('campaign-predefined-params'); // Reusing translation namespace for now, can be updated later
	const { data: behaviorsData, isLoading } = useAgentBehaviors();
	const deleteMutation = useDeleteAgentBehavior();

	const [selectedBehaviorId, setSelectedBehaviorId] = useState<string | null>(
		null
	);
	const [mode, setMode] = useState<'create' | 'edit'>('create');

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [behaviorToDelete, setBehaviorToDelete] =
		useState<AgentBehavior | null>(null);
	const [formModalOpen, setFormModalOpen] = useState(false);
	const [behaviorToReplace, setBehaviorToReplace] =
		useState<AgentBehavior | null>(null);
	const [behaviorToClone, setBehaviorToClone] = useState<AgentBehavior | null>(
		null
	);
	const [behaviorToReplaceWithBackup, setBehaviorToReplaceWithBackup] =
		useState<AgentBehavior | null>(null);

	const { data: selectedBehavior, isLoading: isLoadingDetail } =
		useGetAgentBehavior(selectedBehaviorId ?? '', {
			enabled: !!selectedBehaviorId && formModalOpen && mode === 'edit',
		});

	const { data: checkDeleteData, isLoading: isCheckingDelete } =
		useCheckDeleteAgentBehavior(behaviorToDelete?.id ?? '', {
			enabled: !!behaviorToDelete,
		});

	const list = behaviorsData?.data || [];

	const handleRowClick = (behavior: AgentBehavior) => {
		setSelectedBehaviorId(behavior.id);
		setMode('edit');
		setFormModalOpen(true);
	};

	const handleAddNew = () => {
		setSelectedBehaviorId(null);
		setMode('create');
		setFormModalOpen(true);
	};

	const handleDeleteClick = (behavior: AgentBehavior) => {
		setBehaviorToDelete(behavior);
		setDeleteModalOpen(true);
	};

	const handleReplaceClick = (behavior: AgentBehavior) => {
		setBehaviorToReplace(behavior);
	};

	const handleCloneClick = (behavior: AgentBehavior) => {
		setBehaviorToClone(behavior);
	};

	const handleReplaceWithBackupClick = (behavior: AgentBehavior) => {
		setBehaviorToReplaceWithBackup(behavior);
	};

	const handleConfirmDelete = async () => {
		if (!behaviorToDelete) return;
		try {
			await deleteMutation.mutateAsync(behaviorToDelete.id);
			setDeleteModalOpen(false);
			setBehaviorToDelete(null);
			if (selectedBehaviorId === behaviorToDelete.id) {
				setFormModalOpen(false);
				setSelectedBehaviorId(null);
			}
		} catch (error) {
			// error is handled globally or we can add local toast
		}
	};

	const handleCloseForm = () => {
		setFormModalOpen(false);
		setSelectedBehaviorId(null);
	};

	const sectionActions: CardActionsConfig = {
		primary: {
			kind: 'add',
			icon: IconPlus,
			label: t('actions.addParameter', 'Add Behavior'),
			onClick: handleAddNew,
		},
	};

	const canDelete = checkDeleteData?.canDelete ?? false;

	return (
		<SectionCard
			title={t('page.title', 'Agent Behaviors')}
			description={t(
				'page.description',
				'Manage agent conversation behaviors and settings.'
			)}
			actions={sectionActions}
		>
			<div className={styles.contentStack}>
				<AgentBehaviorsList
					data={list}
					isLoading={isLoading}
					onRowClick={handleRowClick}
					onClone={handleCloneClick}
					onDelete={handleDeleteClick}
					onReplace={handleReplaceClick}
					onReplaceWithBackup={handleReplaceWithBackupClick}
				/>
			</div>

			<CloneBehaviorModal
				opened={!!behaviorToClone}
				onClose={() => setBehaviorToClone(null)}
				sourceBehavior={behaviorToClone}
			/>

			<BatchReplaceModal
				opened={!!behaviorToReplace}
				onClose={() => setBehaviorToReplace(null)}
				sourceBehavior={behaviorToReplace}
				allBehaviors={list}
			/>

			<ReplaceWithBackupModal
				opened={!!behaviorToReplaceWithBackup}
				onClose={() => setBehaviorToReplaceWithBackup(null)}
				sourceBehavior={behaviorToReplaceWithBackup}
				allBehaviors={list}
			/>

			<Modal
				opened={deleteModalOpen}
				onClose={() => {
					setDeleteModalOpen(false);
					setBehaviorToDelete(null);
				}}
				title={t('deleteParameter.title', 'Delete Agent Behavior')}
				centered
				size='md'
			>
				{isCheckingDelete ? (
					<Group justify='center' p='xl'>
						<Loader size='sm' />
					</Group>
				) : (
					<>
						{!canDelete && checkDeleteData ? (
							<Alert
								icon={<IconAlertCircle size='1rem' />}
								title='Cannot Delete Behavior'
								color='red'
								variant='light'
								mb='md'
							>
								<Text size='sm' mb='xs'>
									This behavior is currently in use and cannot be deleted.
								</Text>
								{checkDeleteData.rules
									.filter((r) => !r.passed)
									.map((rule, idx) => (
										<Text key={idx} size='xs' mt='xs'>
											• {rule.message}
										</Text>
									))}
								{checkDeleteData.blockingCampaigns &&
									checkDeleteData.blockingCampaigns.length > 0 && (
										<Box mt='sm'>
											<Text size='xs' fw={600}>
												Blocking Campaigns:
											</Text>
											<List size='xs' withPadding>
												{checkDeleteData.blockingCampaigns.map((c) => (
													<List.Item key={c.id}>
														{c.name} (ID: {c.id})
													</List.Item>
												))}
											</List>
										</Box>
									)}
							</Alert>
						) : (
							<Text size='sm' className={styles.modalDescription} mb='md'>
								{t('deleteParameter.description', {
									name: behaviorToDelete?.name ?? '',
									defaultValue: `Are you sure you want to delete ${behaviorToDelete?.name}? This action cannot be undone.`,
								})}
							</Text>
						)}
						<div className={styles.modalFooter}>
							<Button
								variant='default'
								size='xs'
								onClick={() => {
									setDeleteModalOpen(false);
									setBehaviorToDelete(null);
								}}
							>
								{t('actions.cancel', { ns: 'common' })}
							</Button>
							<Button
								color='red'
								size='xs'
								onClick={handleConfirmDelete}
								loading={deleteMutation.isPending}
								disabled={!canDelete}
							>
								{t('actions.delete', { ns: 'common' })}
							</Button>
						</div>
					</>
				)}
			</Modal>

			<Modal
				opened={formModalOpen}
				onClose={handleCloseForm}
				title={
					mode === 'edit'
						? t('formModal.title.edit', 'Edit Behavior')
						: t('formModal.title.create', 'Create Behavior')
				}
				size='min(96vw, 96rem)'
				radius='md'
				centered
				overlayProps={{ opacity: 0.3, blur: 2 }}
				classNames={{
					header: styles.modalHeader,
					title: styles.modalTitle,
					body: styles.modalBody,
					content: styles.modalContent,
				}}
				keepMounted={false}
			>
				{mode === 'edit' && isLoadingDetail ? (
					<Center p='xl'>
						<Loader size='sm' />
					</Center>
				) : (
					<AgentBehaviorsForm
						behavior={mode === 'edit' ? selectedBehavior : undefined}
						allBehaviors={list}
						mode={mode}
						onCancel={handleCloseForm}
						onSuccess={handleCloseForm}
					/>
				)}
			</Modal>
		</SectionCard>
	);
};

export default AgentBehaviorsPage;
