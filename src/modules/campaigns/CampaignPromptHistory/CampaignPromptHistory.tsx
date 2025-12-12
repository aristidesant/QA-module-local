import React, { useCallback, useMemo, useState } from 'react';
import { Text, Group, Modal, Badge } from '@mantine/core';
import {
	useGetCampaignPromptHistory,
	useGetCampaignPromptHistoryByPromptType,
} from '~/queries/campaignPromptHistoryQueries';
import { usePagination } from '~/hooks/usePagination';
import PaginationControls from '~/components/PaginationControls';
import BaseTable from '~/components/BaseTable';
import styles from './CampaignPromptHistory.module.css';
import { useCampaignPromptHistoryColumns } from './useCampaignPromptHistoryColumns';
import type { CampaignPromptHistoryItem } from '~/models/CampaignPromptHistoryModel';
import PromptHistoryModal from './PromptHistoryModal';

interface CampaignPromptHistoryProps {
	campaignId: string | number;
	campaignPromptTypeId?: string | number;
	currentPromptText?: string;
	onSelect: (promptText: string) => void;
}

const CampaignPromptHistory: React.FC<CampaignPromptHistoryProps> = ({
	campaignId,
	campaignPromptTypeId,
	currentPromptText,
	onSelect,
}) => {
	const [selectedItem, setSelectedItem] =
		useState<CampaignPromptHistoryItem | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const pagination = usePagination({
		initialItemsPerPage: 5,
		searchDebounceMs: 300,
	});

	const plainCampaignId = campaignPromptTypeId ? 0 : campaignId;

	const plainHistoryQuery = useGetCampaignPromptHistory(
		plainCampaignId,
		pagination.getApiParams()
	);

	const promptTypeHistoryQuery = useGetCampaignPromptHistoryByPromptType(
		campaignId,
		campaignPromptTypeId ?? 0,
		pagination.getApiParams()
	);

	const {
		data: promptHistoryResponse,
		isLoading,
		isError,
		error,
	} = campaignPromptTypeId ? promptTypeHistoryQuery : plainHistoryQuery;

	const totalPages = promptHistoryResponse?.total
		? pagination.calculateTotalPages(promptHistoryResponse.total)
		: 0;

	const handleViewPrompt = useCallback((item: CampaignPromptHistoryItem) => {
		setSelectedItem(item);
		setModalOpen(true);
	}, []);

	const columns = useCampaignPromptHistoryColumns({
		onSelect,
		onViewPrompt: handleViewPrompt,
	});

	const handleItemsPerPageChange = useCallback(
		(value: string | null) => {
			if (value) {
				pagination.setItemsPerPage(parseInt(value, 10));
			}
		},
		[pagination]
	);

	const historyList = useMemo<CampaignPromptHistoryItem[]>(() => {
		if (!promptHistoryResponse?.data) return [];
		// The first item returned by the backend is the current version; do not show it.
		return promptHistoryResponse.data.slice(1);
	}, [promptHistoryResponse?.data]);

	if (isError) {
		return (
			<div className={styles.errorContainer}>
				<Text c='red' size='sm'>
					{error instanceof Error
						? error.message
						: 'Failed to load prompt history.'}
				</Text>
			</div>
		);
	}

	return (
		<>
			<div className={styles.container}>
				<BaseTable
					data={historyList}
					columns={columns}
					isLoading={isLoading}
					density='compact'
				/>

				{promptHistoryResponse && promptHistoryResponse.total > 0 && (
					<PaginationControls
						currentPage={pagination.currentPage}
						totalPages={totalPages}
						itemsPerPage={pagination.itemsPerPage}
						totalItems={promptHistoryResponse.total}
						onPageChange={pagination.setCurrentPage}
						onItemsPerPageChange={handleItemsPerPageChange}
						isLoading={isLoading}
						itemLabel='prompt versions'
					/>
				)}
			</div>
			{selectedItem && (
				<Modal
					opened={modalOpen}
					onClose={() => setModalOpen(false)}
					title={
						<Group gap='sm'>
							<Text fw={600} size='lg'>
								Prompt History
							</Text>
							<Badge variant='filled' color='blue' size='lg'>
								v{selectedItem.version}
							</Badge>
						</Group>
					}
					size='xl'
					fullScreen
					padding='xl'
				>
					<PromptHistoryModal
						item={selectedItem}
						currentPromptText={currentPromptText}
						onRestore={(promptText: string) => {
							onSelect(promptText);
							setModalOpen(false);
						}}
						onClose={() => setModalOpen(false)}
					/>
				</Modal>
			)}
		</>
	);
};

export default CampaignPromptHistory;
