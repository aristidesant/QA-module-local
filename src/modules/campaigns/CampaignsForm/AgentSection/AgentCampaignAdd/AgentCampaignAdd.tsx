import React, { useMemo, useState, useRef } from 'react';
import { Alert, Button, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
	IconAlertCircle,
	IconSearch,
	IconUsersGroup,
} from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable/BaseTable';
import PaginationControls from '~/components/PaginationControls/PaginationControls';
import useAgentSelectionColumns from '~/modules/campaigns/CampaignsForm/AgentSection/AgentCampaignAdd/useAgentSelectionColumns';
import { useAgentsWithCampaigns } from '~/queries/agentQueries';
import { useCreateCampaignAgent } from '~/queries/campaignAgentsQueries';
import type { AgentWithCampaignListItem } from '~/models/AgentListObject';
import classes from './AgentCampaignAdd.module.css';
import { isAxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { FilterContainer } from '~/components/FilterContainer';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { modals } from '@mantine/modals';
import CloneAgentModal from './CloneAgentModal';

interface AgentCampaignAddProps {
	campaignId: number;
	excludedAgents: string[];
	onComplete: () => void;
}

export const AgentCampaignAdd: React.FC<AgentCampaignAddProps> = ({
	campaignId,
	excludedAgents,
	onComplete,
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearch] = useDebouncedValue(searchTerm, 400);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [playingAgentId, setPlayingAgentId] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const { selectedCampaign } = useCampaignsStore((state) => state);

	const queryParams = useMemo(
		() => ({
			page,
			limit,
			...(debouncedSearch ? { name: debouncedSearch } : {}),
		}),
		[page, limit, debouncedSearch]
	);

	const { data, isLoading, isError, refetch } = useAgentsWithCampaigns({
		...queryParams,
		agentType: selectedCampaign?.type,
	});

	const tableData = useMemo(
		() =>
			(data?.data ?? []).filter((agent) => !excludedAgents.includes(agent.id)),
		[data, excludedAgents]
	);

	const totalItems = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	const handlePlay = (agent: AgentWithCampaignListItem) => {
		if (!agent.voicePreviewUrl) return;

		if (playingAgentId === agent.id) {
			audioRef.current?.pause();
			setPlayingAgentId(null);
		} else {
			if (audioRef.current) {
				audioRef.current.pause();
			}
			audioRef.current = new Audio(agent.voicePreviewUrl);
			audioRef.current.play();
			setPlayingAgentId(agent.id);
			audioRef.current.onended = () => setPlayingAgentId(null);
		}
	};

	const createMutation = useCreateCampaignAgent();

	const handleAdd = (agent: AgentWithCampaignListItem) => {
		createMutation.mutate(
			{ campaignId, agentId: agent.id },
			{
				onSuccess: onComplete,
				onError: (error) => {
					let apiMessage = 'Failed to add agent to campaign';
					if (isAxiosError(error)) {
						apiMessage = error.response?.data?.message || apiMessage;
					}
					notifications.show({
						title: 'Error',
						message: apiMessage,
						color: 'red',
					});
				},
			}
		);
	};

	const handleItemsPerPageChange = (value: string | null) => {
		const parsedValue = value ? Number(value) : limit;
		if (!Number.isNaN(parsedValue)) {
			setLimit(parsedValue);
			setPage(1);
		}
	};

	const handleClone = (agent: AgentWithCampaignListItem) => {
		modals.open({
			title: 'Clone Agent',
			modalId: 'clone-agent-modal',
			size: 'md',
			centered: true,
			children: <CloneAgentModal agent={agent} onSuccess={() => refetch()} />,
		});
	};

	const columns = useAgentSelectionColumns({
		onAdd: handleAdd,
		onPlay: handlePlay,
		onClone: handleClone,
		isDisabled: (row) => !!row.campaignName,
		isPlaying: (row) => playingAgentId === row.id,
	});

	const shouldShowTable = isLoading || tableData.length > 0;

	return (
		<Stack className={classes.container} gap='lg'>
			<FilterContainer>
				<TextInput
					className={classes.searchInput}
					placeholder='Search agents by name'
					value={searchTerm}
					onChange={(event) => {
						setSearchTerm(event.currentTarget.value);
						setPage(1);
					}}
					aria-label='Search agents by name'
					size='sm'
					leftSection={<IconSearch size={16} />}
				/>
			</FilterContainer>

			<>
				{isError ? (
					<Alert
						icon={<IconAlertCircle size={16} />}
						color='red'
						className={classes.errorAlert}
						withCloseButton={false}
					>
						<Stack gap='xs'>
							<Text fw={600}>Failed to load agents</Text>
							<Text className={classes.subText}>
								We could not load the agent list. Please try again.
							</Text>
							<Button
								variant='outline'
								color='red'
								size='xs'
								onClick={() => refetch()}
							>
								Try again
							</Button>
						</Stack>
					</Alert>
				) : shouldShowTable ? (
					<BaseTable<AgentWithCampaignListItem>
						data={tableData}
						columns={columns}
						isLoading={isLoading}
						density='compact'
					/>
				) : (
					<div className={classes.emptyState}>
						<div className={classes.emptyIcon}>
							<IconUsersGroup size={24} />
						</div>
						<Text fw={500}>No available agents</Text>
						<Text className={classes.subText}>
							Adjust your filters or pagination to see more results.
						</Text>
					</div>
				)}
			</>

			<PaginationControls
				currentPage={page}
				totalPages={totalPages}
				itemsPerPage={limit}
				totalItems={totalItems}
				onPageChange={setPage}
				onItemsPerPageChange={handleItemsPerPageChange}
				searchTerm={debouncedSearch}
				isLoading={isLoading}
				itemLabel='agents'
			/>
		</Stack>
	);
};

export default AgentCampaignAdd;
