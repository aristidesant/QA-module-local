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
import {
	useKnowledgeBases,
	useKnowledgeBasesByIds,
} from '~/queries/knowledgeBaseQueries';
import CampaignConfigurationKnowledgeBaseAddModal from './CampaignConfigurationKnowledgeBaseAddModal';
import styles from './CampaignConfigurationKnowledgeBase.module.css';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import { useTranslation } from 'react-i18next';

const CampaignConfigurationKnowledgeBase: React.FC = () => {
	const { t } = useTranslation('campaigns');
	const form = useCampaignFormContext();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const {
		data: allKnowledgeBases,
		isLoading: isLoadingAll,
		error,
	} = useKnowledgeBases();

	const extractKnowledgeBaseIds = (rawKnowledgeBase: unknown): number[] => {
		if (!Array.isArray(rawKnowledgeBase)) return [];
		return rawKnowledgeBase
			.map((item) => {
				if (typeof item === 'number') return item;
				if (typeof item === 'object' && item && 'id' in item) {
					return (item as any).id;
				}
				return null;
			})
			.filter((id): id is number => typeof id === 'number');
	};

	// Extract IDs from deep path (Wizard/New structure)
	const rawKbData =
		(form.values.agentConfig as any)?.conversationConfig?.agent?.prompt
			?.knowledgeBase || [];
	const deepKbIds = extractKnowledgeBaseIds(rawKbData);

	// Extract IDs from root path (Backend/Legacy structure)
	const rootKbIds: number[] =
		(form.values.agentConfig as any)?.knowledgeBaseIds || [];

	console.log({ deepKbIds, rootKbIds });

	// Merge both sources
	const selectedKbIds = Array.from(new Set([...deepKbIds, ...rootKbIds]));

	// Identify missing IDs
	const missingIds = selectedKbIds.filter(
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

	const selectedKnowledgeBases = combinedKnowledgeBases.filter((kb) =>
		selectedKbIds.includes(kb.id)
	);

	const isLoading = isLoadingAll || isLoadingMissing;

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

	const updateKnowledgeBaseIds = (newIds: number[]) => {
		// Update deep path
		form.setFieldValue(
			'agentConfig.conversationConfig.agent.prompt.knowledgeBase',
			newIds
		);
		// Update root path
		form.setFieldValue('agentConfig.knowledgeBaseIds', newIds);
	};

	const handleUnassignKnowledgeBase = (knowledgeBaseId: number) => {
		const newIds = selectedKbIds.filter((id: number) => id !== knowledgeBaseId);
		updateKnowledgeBaseIds(newIds);
	};

	const handleSaveSelections = (newSelectedIds: number[]) => {
		updateKnowledgeBaseIds(newSelectedIds);
		setIsModalOpen(false);
	};

	return (
		<SectionCard
			title={t('form.agent.knowledgeBase.title')}
			description={t('form.agent.knowledgeBase.description')}
		>
			<div className={styles.container}>
				{isLoading ? (
					<div className={styles.loadingContainer}>
						<Loader size='sm' />
						<Text size='sm' c='dimmed'>
							{t('form.agent.knowledgeBase.loading')}
						</Text>
					</div>
				) : error ? (
					<Text size='sm' c='red'>
						{t('form.agent.knowledgeBase.error')}
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
											<Tooltip
												label={t('form.agent.knowledgeBase.remove')}
												position='left'
											>
												<ActionIcon
													variant='subtle'
													color='red'
													size='md'
													onClick={() => handleUnassignKnowledgeBase(kb.id)}
													aria-label={t('form.agent.knowledgeBase.removeAria', {
														name: kb.name,
													})}
												>
													<IconFileXFilled size={18} />
												</ActionIcon>
											</Tooltip>
										</div>
									</div>
									{kb.createdAt && (
										<div className={styles.assignedDate}>
											{t('form.agent.knowledgeBase.created', {
												date: new Date(kb.createdAt).toLocaleDateString(),
											})}
										</div>
									)}
								</div>
							</div>
						</div>
					))
				) : (
					<Text size='sm' c='dimmed'>
						{t('form.agent.knowledgeBase.noSelection')}
					</Text>
				)}
				<button
					type='button'
					className={styles.addButton}
					onClick={handleAddKnowledgeBase}
				>
					<IconPlus size={20} className={styles.plusIcon} />
					<span>{t('form.agent.knowledgeBase.add')}</span>
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
