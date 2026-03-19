import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Box,
	Text,
	Button,
	Badge,
	ActionIcon,
	Tooltip,
	ThemeIcon,
	Loader,
	Modal,
	Stack,
	Group,
} from '@mantine/core';
import {
	IconDatabase,
	IconPlus,
	IconFileText,
	IconFileXFilled,
} from '@tabler/icons-react';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import {
	useKnowledgeBases,
	useKnowledgeBasesByIds,
} from '~/queries/knowledgeBaseQueries';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import KnowledgeBaseSelector from '~/components/KnowledgeBaseSelector';

import styles from '../StepTwoAgent.module.css';
import KnowledgeBaseWizardForm from './KnowledgeBaseWizardForm';

const KnowledgeBaseSection: React.FC = () => {
	const { t } = useTranslation([
		'campaigns.wizard',
		'knowledge-bases',
		'common',
	]);
	const { knowledgeBaseIds, setKnowledgeBaseIds } = useCampaignWizardStore();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [tempSelectedIds, setTempSelectedIds] = useState<number[]>([]);

	const {
		data: allKnowledgeBases,
		isLoading: isLoadingAll,
		error,
	} = useKnowledgeBases();

	// Identify missing IDs (selected but not in the main list)
	const missingIds = knowledgeBaseIds.filter(
		(id) => !allKnowledgeBases?.some((kb) => kb.id === id)
	);

	// Fetch missing KBs
	const missingKbQueries = useKnowledgeBasesByIds(missingIds);
	const isLoadingMissing = missingKbQueries.some((q: any) => q.isLoading);

	// Combine available KBs
	const missingKbs = missingKbQueries
		.map((q: any) => q.data)
		.filter((kb): kb is KnowledgeBaseModel => !!kb);

	const combinedKnowledgeBases = [...(allKnowledgeBases || []), ...missingKbs];

	// Filter from the combined list
	const selectedKnowledgeBases = combinedKnowledgeBases.filter((kb) =>
		knowledgeBaseIds.includes(kb.id)
	);

	const isLoading = isLoadingAll || isLoadingMissing;

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'active':
				return 'green';
			case 'pending':
				return 'yellow';
			case 'failed':
				return 'red';
			default:
				return 'gray';
		}
	};

	const handleAddKnowledgeBase = () => {
		setTempSelectedIds([...knowledgeBaseIds]);
		setIsModalOpen(true);
	};

	const handleCreateKnowledgeBase = () => {
		setIsCreateModalOpen(true);
	};

	const handleUnassignKnowledgeBase = (knowledgeBaseId: number) => {
		const newIds = knowledgeBaseIds.filter(
			(id: number) => id !== knowledgeBaseId
		);
		setKnowledgeBaseIds(newIds);
	};

	const handleSaveSelections = (ids: number[]) => {
		setKnowledgeBaseIds(ids);
		setIsModalOpen(false);
	};

	const handleCreateSuccess = (createdKb: KnowledgeBaseModel) => {
		// Add the newly created knowledge base to selected ones
		setKnowledgeBaseIds([...knowledgeBaseIds, createdKb.id]);
		setIsCreateModalOpen(false);
	};

	return (
		<>
			<Box className={styles.sectionCard}>
				<div className={styles.sectionHeader}>
					<IconDatabase size={20} className={styles.sectionIcon} />
					<h3 className={styles.sectionTitle}>
						{t('wizard.knowledgeBase.section.title')}
					</h3>
				</div>
				<Text className={styles.sectionDescription}>
					{t('wizard.knowledgeBase.section.description')}
				</Text>

				{isLoading ? (
					<Box className={styles.knowledgeBaseEmpty}>
						<Loader size='sm' />
						<Text size='sm' c='dimmed'>
							{t('wizard.knowledgeBase.section.loading')}
						</Text>
					</Box>
				) : error ? (
					<Box className={styles.knowledgeBaseEmpty}>
						<Text size='sm' c='red'>
							{t('wizard.knowledgeBase.section.error')}
						</Text>
					</Box>
				) : selectedKnowledgeBases.length > 0 ? (
					<Stack gap='xs'>
						{selectedKnowledgeBases.map((kb) => (
							<Box key={kb.id} className={styles.knowledgeBaseItem}>
								<div className={styles.knowledgeBaseContent}>
									<ThemeIcon variant='subtle' color='gray' size='sm'>
										<IconFileText size={16} />
									</ThemeIcon>
									<div className={styles.knowledgeBaseInfo}>
										<div className={styles.knowledgeBaseHeader}>
											<Text size='sm' fw={500}>
												{kb.name}
											</Text>
											<Group gap='xs'>
												<Badge
													size='xs'
													color={getStatusColor(kb.status)}
													variant='light'
												>
													{t(`status.${kb.status}`, {
														ns: 'knowledge-bases',
														defaultValue: kb.status,
													})}
												</Badge>
												<Tooltip
													label={t('wizard.knowledgeBase.section.remove')}
													position='left'
												>
													<ActionIcon
														variant='subtle'
														color='red'
														size='xs'
														onClick={() => handleUnassignKnowledgeBase(kb.id)}
														aria-label={t(
															'wizard.knowledgeBase.section.removeAria',
															{ name: kb.name }
														)}
													>
														<IconFileXFilled size={14} />
													</ActionIcon>
												</Tooltip>
											</Group>
										</div>
										{kb.createdAt && (
											<Text size='xs' c='dimmed'>
												{t('wizard.knowledgeBase.section.created', {
													date: new Date(kb.createdAt).toLocaleDateString(),
												})}
											</Text>
										)}
									</div>
								</div>
							</Box>
						))}
					</Stack>
				) : (
					<Box className={styles.knowledgeBaseEmpty}>
						<Text size='sm' c='dimmed'>
							{t('wizard.knowledgeBase.section.noSelection')}
						</Text>
					</Box>
				)}

				<Group gap='xs' mt='sm'>
					<Button
						leftSection={<IconPlus size={16} />}
						variant='light'
						onClick={handleAddKnowledgeBase}
						flex={1}
						size='sm'
					>
						{t('wizard.knowledgeBase.section.add')}
					</Button>
					<Button
						leftSection={<IconPlus size={16} />}
						variant='outline'
						onClick={handleCreateKnowledgeBase}
						flex={1}
						size='sm'
					>
						{t('wizard.knowledgeBase.actions.create')}
					</Button>
				</Group>
			</Box>

			{/* Selection Modal */}
			<Modal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={t('wizard.knowledgeBase.section.modal.selectTitle')}
				size='xl'
			>
				<KnowledgeBaseSelector
					initialSelectedIds={tempSelectedIds}
					onCancel={() => setIsModalOpen(false)}
					onSave={handleSaveSelections}
				/>
			</Modal>

			{/* Create Modal */}
			<Modal
				opened={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				title={t('wizard.knowledgeBase.section.modal.createTitle')}
				size='lg'
			>
				<KnowledgeBaseWizardForm
					onSuccess={handleCreateSuccess}
					onCancel={() => setIsCreateModalOpen(false)}
				/>
			</Modal>
		</>
	);
};

export default KnowledgeBaseSection;
