import React, { useState } from 'react';
import {
	Modal,
	Button,
	Text,
	Loader,
	Group,
	Stack,
	Badge,
	ThemeIcon,
} from '@mantine/core';
import { IconFileText, IconWorld, IconApi } from '@tabler/icons-react';
import { useKnowledgeBases } from '~/queries/knowledgeBaseQueries';
import { useAssignKnowledgeBase } from '~/queries/agentKnowledgeBaseQueries';
import {
	KnowledgeBaseType,
	KnowledgeBaseStatus,
} from '~/models/KnowledgeBaseModel';
import styles from './AddKnowledgeBaseModal.module.css';
import { useAgentStore } from '~/stores/agentStore';

interface AddKnowledgeBaseModalProps {
	opened: boolean;
	onClose: () => void;
}

export const AddKnowledgeBaseModal: React.FC<AddKnowledgeBaseModalProps> = ({
	opened,
	onClose,
}) => {
	const selectedAgent = useAgentStore((state) => state.selectedAgent);
	const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<
		number | null
	>(null);

	const { data: knowledgeBases, isLoading, error } = useKnowledgeBases();
	const assignMutation = useAssignKnowledgeBase();

	const getIconForType = (type: KnowledgeBaseType) => {
		switch (type) {
			case KnowledgeBaseType.FILE:
				return <IconFileText size={16} />;
			case KnowledgeBaseType.URL:
				return <IconWorld size={16} />;
			default:
				return <IconApi size={16} />;
		}
	};

	const handleSubmit = async () => {
		if (!selectedKnowledgeBaseId || !selectedAgent?.id) return;

		try {
			await assignMutation.mutateAsync({
				agentId: selectedAgent.id,
				knowledgeBaseId: selectedKnowledgeBaseId,
				isActive: true,
			});
			onClose();
			setSelectedKnowledgeBaseId(null);
		} catch (error) {
			console.error('Error assigning knowledge base:', error);
		}
	};

	const handleClose = () => {
		setSelectedKnowledgeBaseId(null);
		onClose();
	};

	// Filter out only active knowledge bases
	const activeKnowledgeBases =
		knowledgeBases?.filter((kb) => kb.status === KnowledgeBaseStatus.ACTIVE) ||
		[];

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title='Add Knowledge Base'
			size='md'
		>
			<Stack gap='md'>
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
				) : activeKnowledgeBases.length === 0 ? (
					<Text size='sm' c='dimmed'>
						No active knowledge bases available
					</Text>
				) : (
					<div>
						<Text size='sm' fw={500} mb='sm'>
							Select a knowledge base to assign:
						</Text>
						<Stack gap='xs'>
							{activeKnowledgeBases.map((kb) => (
								<div
									key={kb.id}
									className={`${styles.knowledgeBaseItem} ${
										selectedKnowledgeBaseId === kb.id ? styles.selected : ''
									}`}
									onClick={() => setSelectedKnowledgeBaseId(kb.id)}
								>
									<div className={styles.itemContent}>
										<ThemeIcon variant='subtle' color='gray' size='sm'>
											{getIconForType(kb.type)}
										</ThemeIcon>
										<div className={styles.itemInfo}>
											<div className={styles.itemHeader}>
												<div className={styles.itemTitle}>{kb.name}</div>
												<Badge
													size='xs'
													variant='light'
													className={styles.typeBadge}
												>
													{kb.type}
												</Badge>
											</div>
											{kb.description && (
												<div className={styles.description}>
													{kb.description}
												</div>
											)}
											{kb.sourceUrl && (
												<div className={styles.sourceUrl}>{kb.sourceUrl}</div>
											)}
										</div>
									</div>
								</div>
							))}
						</Stack>
					</div>
				)}

				<Group justify='flex-end' mt='md'>
					<Button variant='subtle' onClick={handleClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!selectedKnowledgeBaseId}
						loading={assignMutation.isPending}
					>
						Add Knowledge Base
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
