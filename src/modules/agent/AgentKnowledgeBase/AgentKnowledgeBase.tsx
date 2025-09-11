import React, { useState } from 'react';
import { IconFileText, IconFileXFilled, IconPlus } from '@tabler/icons-react';
import styles from './AgentKnowledgeBase.module.css';
import SectionCard from '~/components/SectionCard';
import {
	ThemeIcon,
	Loader,
	Text,
	Badge,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import { useAgentStore } from '~/stores/agentStore';
import {
	useGetAgentKnowledgeBases,
	useUnassignKnowledgeBase,
} from '~/queries/agentKnowledgeBaseQueries';
import AddKnowledgeBaseModal from './AddKnowledgeBaseModal';
import { modals } from '@mantine/modals';

export const AgentKnowledgeBase: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [unassigningKbId, setUnassigningKbId] = useState<number | null>(null);
	const agent = useAgentStore((state) => state.selectedAgent);
	const {
		data: knowledgeBases,
		isLoading,
		error,
	} = useGetAgentKnowledgeBases(agent?.id || '');
	const unassignMutation = useUnassignKnowledgeBase();

	const getIconForKnowledgeBase = () => {
		// Since AgentKnowledgeBase doesn't have type info, use a generic icon
		return <IconFileText size={20} />;
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
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

	const handleUnassignKnowledgeBase = (
		knowledgeBaseId: number,
		knowledgeBaseName: string
	) => {
		modals.openConfirmModal({
			title: 'Unassign Knowledge Base',
			children: (
				<Text size='sm'>
					Are you sure you want to unassign <strong>{knowledgeBaseName}</strong>{' '}
					from this agent? This action cannot be undone.
				</Text>
			),
			labels: { confirm: 'Unassign', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				if (!agent?.id) return;

				setUnassigningKbId(knowledgeBaseId);
				try {
					await unassignMutation.mutateAsync({
						agentId: agent.id,
						knowledgeBaseId,
					});
					// The mutation's onSuccess callback will automatically invalidate and refetch the queries
				} catch (error) {
					console.error('Error unassigning knowledge base:', error);
				} finally {
					setUnassigningKbId(null);
				}
			},
		});
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
				) : knowledgeBases && knowledgeBases.length > 0 ? (
					knowledgeBases.map((item) => (
						<div key={item.id} className={styles.item}>
							<div className={styles.itemContent}>
								<ThemeIcon variant='subtle' color='gray'>
									{getIconForKnowledgeBase()}
								</ThemeIcon>
								<div className={styles.itemInfo}>
									<div className={styles.itemHeader}>
										<div className={styles.label}>{item.knowledgeBaseName}</div>
										<div className={styles.itemActions}>
											<Badge
												size='sm'
												color={getStatusColor(item.knowledgeBaseStatus)}
												variant='light'
												className={styles.statusBadge}
											>
												{item.knowledgeBaseStatus}
											</Badge>
											<Tooltip label='Unassign knowledge base' position='left'>
												<ActionIcon
													variant='subtle'
													color='red'
													size='md'
													onClick={() =>
														handleUnassignKnowledgeBase(
															item.knowledgeBaseId,
															item.knowledgeBaseName
														)
													}
													loading={unassigningKbId === item.knowledgeBaseId}
													aria-label={`Remove ${item.knowledgeBaseName}`}
												>
													<IconFileXFilled size={18} />
												</ActionIcon>
											</Tooltip>
										</div>
									</div>
									{item.assignedAt && (
										<div className={styles.assignedDate}>
											Assigned: {new Date(item.assignedAt).toLocaleDateString()}
										</div>
									)}
								</div>
							</div>
						</div>
					))
				) : (
					<Text size='sm' c='dimmed'>
						No knowledge bases found
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

			<AddKnowledgeBaseModal opened={isModalOpen} onClose={handleCloseModal} />
		</SectionCard>
	);
};
