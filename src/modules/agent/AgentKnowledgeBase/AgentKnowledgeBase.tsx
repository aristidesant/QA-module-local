import React, { useState } from 'react';
import { IconFileText, IconPlus } from '@tabler/icons-react';
import styles from './AgentKnowledgeBase.module.css';
import SectionCard from '~/components/SectionCard';
import { ThemeIcon, Loader, Text, Badge } from '@mantine/core';
import { useAgentStore } from '~/stores/agentStore';
import { useGetAgentKnowledgeBases } from '~/queries/agentKnowledgeBaseQueries';
import AddKnowledgeBaseModal from './AddKnowledgeBaseModal';

export const AgentKnowledgeBase: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const agent = useAgentStore((state) => state.selectedAgent);
	const {
		data: knowledgeBases,
		isLoading,
		error,
	} = useGetAgentKnowledgeBases(agent?.id || '');

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
										<Badge
											size='sm'
											color={getStatusColor(item.knowledgeBaseStatus)}
											variant='light'
											className={styles.statusBadge}
										>
											{item.knowledgeBaseStatus}
										</Badge>
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
