// CampaignConfigurationKnowledgeBase.tsx
import React, { useState } from 'react';
import {
	IconFileText,
	IconTrash,
	IconLink,
	IconAlignLeft,
} from '@tabler/icons-react';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import RightSectionCard from '~/components/RightSectionCard';
import { ThemeIcon, Loader, Text, ActionIcon, Tooltip } from '@mantine/core';
import {
	useKnowledgeBases,
	useKnowledgeBasesByIds,
} from '~/queries/knowledgeBaseQueries';
import CampaignConfigurationKnowledgeBaseAddModal from './CampaignConfigurationKnowledgeBaseAddModal';
import styles from './CampaignConfigurationKnowledgeBase.module.css';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import { useTranslation } from 'react-i18next';
import { timeAgo } from '~/utils/dateUtils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const CampaignConfigurationKnowledgeBase: React.FC = () => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
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

	const getIconForKnowledgeBase = (type: KnowledgeBaseType) => {
		switch (type) {
			case KnowledgeBaseType.URL:
				return <IconLink size={16} />;
			case KnowledgeBaseType.TEXT:
				return <IconAlignLeft size={16} />;
			case KnowledgeBaseType.FILE:
			default:
				return <IconFileText size={16} />;
		}
	};

	const getTypeColor = (type: KnowledgeBaseType) => {
		switch (type) {
			case KnowledgeBaseType.URL:
				return 'teal';
			case KnowledgeBaseType.TEXT:
				return 'orange';
			case KnowledgeBaseType.FILE:
			default:
				return 'blue';
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
		<RightSectionCard
			icon={IconFileText}
			title={t('form.agent.knowledgeBase.title')}
			description={t('form.agent.knowledgeBase.description')}
			actions={{
				primary: {
					kind: 'add',
					label: t('form.agent.knowledgeBase.add'),
					onClick: handleAddKnowledgeBase,
				},
			}}
		>
			<div className={styles.container}>
				{isLoading ? (
					<div className={styles.loadingContainer}>
						<Loader size='xs' />
						<Text size='xs' c='dimmed'>
							{t('form.agent.knowledgeBase.loading')}
						</Text>
					</div>
				) : error ? (
					<Text size='xs' c='red'>
						{t('form.agent.knowledgeBase.error')}
					</Text>
				) : selectedKnowledgeBases.length > 0 ? (
					selectedKnowledgeBases.map((kb) => (
						<div key={kb.id} className={styles.item}>
							<ThemeIcon
								variant='light'
								color={getTypeColor(kb.type)}
								size='md'
							>
								{getIconForKnowledgeBase(kb.type)}
							</ThemeIcon>
							<div className={styles.itemInfo}>
								<div className={styles.itemName}>{kb.name}</div>
								<div className={styles.itemMeta}>
									<span
										className={styles.itemType}
										style={{
											color: `var(--mantine-color-${getTypeColor(kb.type)}-6)`,
										}}
									>
										{kb.type}
									</span>
									{kb.createdAt && (
										<>
											<span className={styles.metaDot}>·</span>
											<Tooltip
												label={dayjs
													.utc(kb.createdAt)
													.local()
													.format('MMM D, YYYY HH:mm')}
												position='top'
												withArrow
											>
												<span className={styles.itemDate}>
													{timeAgo(kb.createdAt)}
												</span>
											</Tooltip>
										</>
									)}
								</div>
							</div>
							<Tooltip
								label={t('form.agent.knowledgeBase.remove')}
								position='left'
							>
								<ActionIcon
									variant='subtle'
									color='red'
									size='sm'
									onClick={() => handleUnassignKnowledgeBase(kb.id)}
									aria-label={t('form.agent.knowledgeBase.removeAria', {
										name: kb.name,
									})}
								>
									<IconTrash size={15} />
								</ActionIcon>
							</Tooltip>
						</div>
					))
				) : (
					<Text size='xs' c='dimmed'>
						{t('form.agent.knowledgeBase.noSelection')}
					</Text>
				)}
			</div>
			<CampaignConfigurationKnowledgeBaseAddModal
				opened={isModalOpen}
				onClose={handleCloseModal}
				selectedIds={selectedKbIds}
				onSave={handleSaveSelections}
			/>
		</RightSectionCard>
	);
};

export default CampaignConfigurationKnowledgeBase;
