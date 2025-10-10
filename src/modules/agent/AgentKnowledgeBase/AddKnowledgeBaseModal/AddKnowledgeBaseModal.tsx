import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Text, Loader, Group, Stack } from '@mantine/core';
import { useKnowledgeBases } from '~/queries/knowledgeBaseQueries';
import { useAssignKnowledgeBase } from '~/queries/agentKnowledgeBaseQueries';
import {
	KnowledgeBaseType,
	KnowledgeBaseStatus,
} from '~/models/KnowledgeBaseModel';
import styles from './AddKnowledgeBaseModal.module.css';
import { useAgentStore } from '~/stores/agentStore';
import BaseTable from '~/components/BaseTable';
import useKnowledgeBaseColumns from './useKnowledgeBaseColumns';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';

interface AddKnowledgeBaseModalProps {
	opened: boolean;
	onClose: () => void;
}

const getSourceDetail = (knowledgeBase: KnowledgeBaseModel) => {
	if (knowledgeBase.sourceUrl) {
		return knowledgeBase.sourceUrl;
	}

	if (knowledgeBase.type === KnowledgeBaseType.FILE && knowledgeBase.file) {
		return knowledgeBase.file.name;
	}

	if (knowledgeBase.textContent) {
		return knowledgeBase.textContent;
	}

	if (knowledgeBase.identifier) {
		return knowledgeBase.identifier;
	}

	return 'No source information available.';
};

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
	const columns = useKnowledgeBaseColumns();

	const activeKnowledgeBases = useMemo(
		() =>
			(knowledgeBases ?? []).filter(
				(kb) => kb.status === KnowledgeBaseStatus.ACTIVE
			),
		[knowledgeBases]
	);

	const selectedKnowledgeBase = useMemo(
		() =>
			activeKnowledgeBases.find((kb) => kb.id === selectedKnowledgeBaseId) ??
			null,
		[activeKnowledgeBases, selectedKnowledgeBaseId]
	);

	useEffect(() => {
		if (selectedKnowledgeBaseId && !selectedKnowledgeBase) {
			setSelectedKnowledgeBaseId(null);
		}
	}, [selectedKnowledgeBase, selectedKnowledgeBaseId]);

	const handleRowSelect = (knowledgeBase: KnowledgeBaseModel) => {
		setSelectedKnowledgeBaseId(knowledgeBase.id);
	};

	const handleSubmit = async () => {
		if (!selectedKnowledgeBase || !selectedAgent?.id) {
			return;
		}

		try {
			await assignMutation.mutateAsync({
				agentId: selectedAgent.id,
				knowledgeBaseId: selectedKnowledgeBase.id,
				isActive: true,
			});
			onClose();
			setSelectedKnowledgeBaseId(null);
		} catch (submitError) {
			console.error('Error assigning knowledge base:', submitError);
		}
	};

	const handleClose = () => {
		setSelectedKnowledgeBaseId(null);
		onClose();
	};

	const errorMessage =
		error instanceof Error
			? error.message
			: 'Error loading knowledge bases. Please try again later.';

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title='Add Knowledge Base'
			size='xl'
		>
			<Stack gap='lg' className={styles.content}>
				{isLoading ? (
					<div className={styles.feedback}>
						<Loader size='sm' />
						<Text size='sm' c='dimmed'>
							Loading knowledge bases...
						</Text>
					</div>
				) : error ? (
					<Text size='sm' c='red' className={styles.feedbackText}>
						{errorMessage}
					</Text>
				) : activeKnowledgeBases.length === 0 ? (
					<div className={styles.feedback}>
						<Text size='sm' c='dimmed'>
							No active knowledge bases available
						</Text>
					</div>
				) : (
					<>
						<div className={styles.instructions}>
							<Text size='sm' fw={500}>
								Select a knowledge base to assign to the agent.
							</Text>
						</div>
						<BaseTable
							data={activeKnowledgeBases}
							columns={columns}
							initialSort={[{ id: 'name', desc: false }]}
							onRowClick={handleRowSelect}
							className={styles.table}
							density='compact'
							getRowClassName={(row) => {
								const classNames = [styles.tableRow];
								if (row.original.id === selectedKnowledgeBaseId) {
									classNames.push(styles.tableRowSelected);
								}
								return classNames.join(' ');
							}}
						/>
						<div className={styles.selectionPanel}>
							{selectedKnowledgeBase ? (
								<Stack gap={4}>
									<Text size='sm' fw={600} className={styles.selectionTitle}>
										{selectedKnowledgeBase.name}
									</Text>
									<Text size='xs' className={styles.selectionDescription}>
										{selectedKnowledgeBase.description ??
											'No description provided.'}
									</Text>
									<Text size='xs' c='dimmed' className={styles.selectionLabel}>
										Source
									</Text>
									<Text size='xs' className={styles.selectionSource}>
										{getSourceDetail(selectedKnowledgeBase)}
									</Text>
								</Stack>
							) : (
								<Text
									size='xs'
									c='dimmed'
									className={styles.selectionPlaceholder}
								>
									Select a row above to preview its details.
								</Text>
							)}
						</div>
					</>
				)}
				<Group justify='flex-end' mt='md'>
					<Button variant='subtle' onClick={handleClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!selectedKnowledgeBase}
						loading={assignMutation.isPending}
					>
						Add Knowledge Base
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
