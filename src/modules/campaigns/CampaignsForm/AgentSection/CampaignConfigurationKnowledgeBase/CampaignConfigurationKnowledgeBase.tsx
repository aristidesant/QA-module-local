// CampaignConfigurationKnowledgeBase.tsx
import React, { useState } from 'react';
import { IconFileText, IconFileXFilled, IconPlus } from '@tabler/icons-react';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import SectionCard from '~/components/SectionCard';
import {
	ThemeIcon,
	Loader,
	Text,
	Badge,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import { useKnowledgeBases } from '~/queries/knowledgeBaseQueries';
import CampaignConfigurationKnowledgeBaseAddModal from './CampaignConfigurationKnowledgeBaseAddModal';
import styles from './CampaignConfigurationKnowledgeBase.module.css';

const CampaignConfigurationKnowledgeBase: React.FC = () => {
	const form = useCampaignFormContext();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { data: allKnowledgeBases, isLoading, error } = useKnowledgeBases();

	const selectedKbIds =
		(form.values.agentConfig as any)?.knowledgeBaseIds || [];
	const selectedKnowledgeBases =
		allKnowledgeBases?.filter((kb) => selectedKbIds.includes(kb.id)) || [];

	const getIconForKnowledgeBase = () => {
		return <IconFileText size={20} />;
	};

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
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	const handleUnassignKnowledgeBase = (knowledgeBaseId: number) => {
		const newIds = selectedKbIds.filter((id: number) => id !== knowledgeBaseId);
		form.setFieldValue('agentConfig.knowledgeBaseIds', newIds);
	};

	const handleSaveSelections = (newSelectedIds: number[]) => {
		form.setFieldValue('agentConfig.knowledgeBaseIds', newSelectedIds);
		setIsModalOpen(false);
	};

	return (
		<SectionCard
			title='Knowledge Base'
			description='Provide your agent with essential information to handle questions accurately and confidently during calls.'
		>
			<div className={styles.container}>
				{isLoading ? (
					<div className={styles.loadingContainer}>
						<Loader size='sm' />
						<Text size='sm' c='dimmed'>
							Loading knowledge bases...
						</Text>
					</div>
				) : error ? (
					<Text size='sm' c='red'>
						Error loading knowledge bases
					</Text>
				) : selectedKnowledgeBases.length > 0 ? (
					selectedKnowledgeBases.map((kb) => (
						<div key={kb.id} className={styles.item}>
							<div className={styles.itemContent}>
								<ThemeIcon variant='subtle' color='gray'>
									{getIconForKnowledgeBase()}
								</ThemeIcon>
								<div className={styles.itemInfo}>
									<div className={styles.itemHeader}>
										<div className={styles.label}>{kb.name}</div>
										<div className={styles.itemActions}>
											<Badge
												size='sm'
												color={getStatusColor(kb.status)}
												variant='light'
												className={styles.statusBadge}
											>
												{kb.status}
											</Badge>
											<Tooltip label='Remove knowledge base' position='left'>
												<ActionIcon
													variant='subtle'
													color='red'
													size='md'
													onClick={() => handleUnassignKnowledgeBase(kb.id)}
													aria-label={`Remove ${kb.name}`}
												>
													<IconFileXFilled size={18} />
												</ActionIcon>
											</Tooltip>
										</div>
									</div>
									{kb.createdAt && (
										<div className={styles.assignedDate}>
											Created: {new Date(kb.createdAt).toLocaleDateString()}
										</div>
									)}
								</div>
							</div>
						</div>
					))
				) : (
					<Text size='sm' c='dimmed'>
						No knowledge bases selected
					</Text>
				)}
				<button
					type='button'
					className={styles.addButton}
					onClick={handleAddKnowledgeBase}
				>
					<IconPlus size={20} className={styles.plusIcon} />
					<span>Add Knowledge Base</span>
				</button>
			</div>

			<CampaignConfigurationKnowledgeBaseAddModal
				opened={isModalOpen}
				onClose={handleCloseModal}
				selectedIds={selectedKbIds}
				onSave={handleSaveSelections}
			/>
		</SectionCard>
	);
};

export default CampaignConfigurationKnowledgeBase;
