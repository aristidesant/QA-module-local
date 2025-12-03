import React, { useState } from 'react';
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
import { useKnowledgeBases } from '~/queries/knowledgeBaseQueries';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import KnowledgeBaseSelector from '~/components/KnowledgeBaseSelector';

import styles from '../StepTwoAgent.module.css';
import KnowledgeBaseWizardForm from './KnowledgeBaseWizardForm';

const KnowledgeBaseSection: React.FC = () => {
	const { knowledgeBaseIds, setKnowledgeBaseIds } = useCampaignWizardStore();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [tempSelectedIds, setTempSelectedIds] = useState<number[]>([]);

	const { data: allKnowledgeBases, isLoading, error } = useKnowledgeBases();

	const selectedKnowledgeBases =
		allKnowledgeBases?.filter((kb) => knowledgeBaseIds.includes(kb.id)) || [];

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
					<h3 className={styles.sectionTitle}>Knowledge Base</h3>
				</div>
				<Text className={styles.sectionDescription}>
					Provide your agent with essential information to handle questions
					accurately and confidently during calls.
				</Text>

				{isLoading ? (
					<Box className={styles.knowledgeBaseEmpty}>
						<Loader size='sm' />
						<Text size='sm' c='dimmed'>
							Loading knowledge bases...
						</Text>
					</Box>
				) : error ? (
					<Box className={styles.knowledgeBaseEmpty}>
						<Text size='sm' c='red'>
							Error loading knowledge bases
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
													{kb.status}
												</Badge>
												<Tooltip label='Remove knowledge base' position='left'>
													<ActionIcon
														variant='subtle'
														color='red'
														size='xs'
														onClick={() => handleUnassignKnowledgeBase(kb.id)}
														aria-label={`Remove ${kb.name}`}
													>
														<IconFileXFilled size={14} />
													</ActionIcon>
												</Tooltip>
											</Group>
										</div>
										{kb.createdAt && (
											<Text size='xs' c='dimmed'>
												Created: {new Date(kb.createdAt).toLocaleDateString()}
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
							No knowledge bases selected
						</Text>
					</Box>
				)}

				<Group gap='xs' mt='sm'>
					<Button
						leftSection={<IconPlus size={16} />}
						variant='light'
						onClick={handleAddKnowledgeBase}
						flex={1}
					>
						Select Existing
					</Button>
					<Button
						leftSection={<IconPlus size={16} />}
						variant='outline'
						onClick={handleCreateKnowledgeBase}
						flex={1}
					>
						Create New
					</Button>
				</Group>
			</Box>

			{/* Selection Modal */}
			<Modal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Select Knowledge Bases'
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
				title='Create Knowledge Base'
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
