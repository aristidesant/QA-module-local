// CampaignConfigurationKnowledgeBaseAddModal.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Button, Text, TextInput, Select, Group } from '@mantine/core';
import { IconSearch, IconPlus, IconArrowLeft } from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import { useKnowledgeBaseModalStore } from '~/stores/knowledgeBaseModalStore';
import KnowledgeBaseWizardForm from '~/modules/campaigns/CampaignWizard/StepTwoAgent/KnowledgeBaseSection/KnowledgeBaseWizardForm/KnowledgeBaseWizardForm';
import useKnowledgeBaseSelectionColumns from './useKnowledgeBaseSelectionColumns';
import classes from './CampaignConfigurationKnowledgeBaseAddModal.module.css';

interface CampaignConfigurationKnowledgeBaseAddModalProps {
	opened: boolean;
	onClose: () => void;
	selectedIds: number[];
	onSave: (selectedIds: number[]) => void;
	allKnowledgeBases: KnowledgeBaseModel[];
}

const CampaignConfigurationKnowledgeBaseAddModal: React.FC<
	CampaignConfigurationKnowledgeBaseAddModalProps
> = ({ opened, onClose, selectedIds, onSave, allKnowledgeBases }) => {
	const [tempSelectedIds, setTempSelectedIds] = useState<number[]>(selectedIds);
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState<string | null>(null);

	const { view, showCreateView, showListView, reset } =
		useKnowledgeBaseModalStore();

	// Reset modal state when closed
	useEffect(() => {
		if (!opened) {
			reset();
		}
	}, [opened, reset]);

	React.useEffect(() => {
		if (opened) {
			setTempSelectedIds(selectedIds);
		}
	}, [opened, selectedIds]);

	const handleToggle = (kbId: number, checked: boolean) => {
		if (checked) {
			setTempSelectedIds((prev) => [...prev, kbId]);
		} else {
			setTempSelectedIds((prev) => prev.filter((id) => id !== kbId));
		}
	};

	const handleSave = () => {
		onSave(tempSelectedIds);
	};

	const toggleFromRow = (kb: KnowledgeBaseModel) => {
		const isSelected = tempSelectedIds.includes(kb.id);
		handleToggle(kb.id, !isSelected);
	};

	const handleCreateSuccess = (createdKb: KnowledgeBaseModel) => {
		// Auto-select the newly created knowledge base
		setTempSelectedIds((prev) => [...prev, createdKb.id]);
		// Go back to list view
		showListView();
	};

	const columns = useKnowledgeBaseSelectionColumns({
		selectedIds: tempSelectedIds,
		onToggle: handleToggle,
	});

	const filteredKnowledgeBases = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		return allKnowledgeBases.filter((kb) => {
			const matchesTerm =
				term.length === 0 ||
				kb.name.toLowerCase().includes(term) ||
				(kb.description || '').toLowerCase().includes(term);
			const matchesType =
				!typeFilter || kb.type.toLowerCase() === typeFilter.toLowerCase();
			return matchesTerm && matchesType;
		});
	}, [allKnowledgeBases, searchTerm, typeFilter]);

	const modalTitle =
		view === 'create' ? 'Create Knowledge Base' : 'Select Knowledge Bases';

	return (
		<Modal opened={opened} onClose={onClose} title={modalTitle} size='xl'>
			{view === 'create' ? (
				<div className={classes.modalContent}>
					<div className={classes.backButton}>
						<Button
							variant='subtle'
							size='xs'
							leftSection={<IconArrowLeft size={14} />}
							onClick={showListView}
						>
							Back to list
						</Button>
					</div>
					<KnowledgeBaseWizardForm
						onSuccess={handleCreateSuccess}
						onCancel={showListView}
					/>
				</div>
			) : (
				<div className={classes.modalContent}>
					<div className={classes.modalHeader}>
						<Text className={classes.subtitle}>
							Pick the knowledge bases that should power this agent. Click a row
							or toggle the checkbox to select.
						</Text>
					</div>

					<Group className={classes.filtersRow} justify='space-between'>
						<Group className={classes.filters} gap='sm'>
							<TextInput
								placeholder='Search by name or description'
								leftSection={<IconSearch size={14} />}
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.currentTarget.value)}
							/>
							<Select
								placeholder='Filter by type'
								data={[
									{ value: '', label: 'All types' },
									{ value: KnowledgeBaseType.FILE, label: 'File' },
									{ value: KnowledgeBaseType.URL, label: 'Link' },
									{ value: KnowledgeBaseType.TEXT, label: 'Text' },
								]}
								value={typeFilter || ''}
								onChange={(value) => setTypeFilter(value || null)}
							/>
						</Group>
						<Button
							variant='light'
							size='sm'
							leftSection={<IconPlus size={14} />}
							onClick={showCreateView}
						>
							Create new
						</Button>
					</Group>

					<div className={classes.tableSurface}>
						<BaseTable<KnowledgeBaseModel>
							data={filteredKnowledgeBases}
							columns={columns}
							density='compact'
							enablePagination
							showPaginationControls
							pageSize={10}
							emptyMessage='No knowledge bases available'
							onRowClick={toggleFromRow}
							className={classes.compactTable}
						/>
					</div>

					<Text className={classes.tableNote}>
						Need to narrow the list? Use filters or create a new knowledge base.
					</Text>

					<div className={classes.footer}>
						<Text className={classes.selectionCount}>
							{tempSelectedIds.length} selected
						</Text>
						<div className={classes.actions}>
							<Button variant='default' onClick={onClose}>
								Cancel
							</Button>
							<Button onClick={handleSave}>Save selections</Button>
						</div>
					</div>
				</div>
			)}
		</Modal>
	);
};

export default CampaignConfigurationKnowledgeBaseAddModal;
