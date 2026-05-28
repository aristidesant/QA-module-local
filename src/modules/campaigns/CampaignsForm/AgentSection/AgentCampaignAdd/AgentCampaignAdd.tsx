import React, { useMemo, useState, useRef } from 'react';
import { Alert, Button, Select, Stack, Text, TextInput } from '@mantine/core';
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
import { useGetSimpleCampaigns } from '~/queries/campaignsQueries';
import type { AgentWithCampaignListItem } from '~/models/AgentListObject';
import classes from './AgentCampaignAdd.module.css';
import { FilterContainer } from '~/components/FilterContainer';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { modals } from '@mantine/modals';
import CloneAgentModal from './CloneAgentModal';
import { useTranslation } from 'react-i18next';

interface AgentCampaignAddProps {
	campaignId: number;
	excludedAgents: string[];
}

export const AgentCampaignAdd: React.FC<AgentCampaignAddProps> = ({
	campaignId,
	excludedAgents,
}) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearch] = useDebouncedValue(searchTerm, 400);
	const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
		null
	);
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
			...(selectedCampaignId && !Number.isNaN(Number(selectedCampaignId))
				? { campaignId: Number(selectedCampaignId) }
				: {}),
		}),
		[page, limit, debouncedSearch, selectedCampaignId]
	);
	const agentTypeFilter =
		selectedCampaign?.type === 'HYBRID' ? undefined : selectedCampaign?.type;

	const {
		data: campaigns,
		isLoading: isCampaignsLoading,
		isError: isCampaignsError,
	} = useGetSimpleCampaigns();

	const campaignOptions = useMemo(
		() =>
			(campaigns ?? []).map((campaign) => ({
				value: String(campaign.id),
				label: campaign.name,
			})),
		[campaigns]
	);

	const { data, isLoading, isError, refetch } = useAgentsWithCampaigns({
		...queryParams,
		agentType: agentTypeFilter,
	});

	const tableData = useMemo(
		() => data?.data ?? [],
		[data]
	);

	const getRowClassName = (row: { original: AgentWithCampaignListItem }) =>
		excludedAgents.includes(row.original.id) ? classes.excludedRow : undefined;

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

	const handleItemsPerPageChange = (value: string | null) => {
		const parsedValue = value ? Number(value) : limit;
		if (!Number.isNaN(parsedValue)) {
			setLimit(parsedValue);
			setPage(1);
		}
	};

	const handleCampaignChange = (value: string | null) => {
		if (!value) {
			setSelectedCampaignId(null);
			setPage(1);
			return;
		}

		setSelectedCampaignId(value);
		setPage(1);
	};

	const handleClone = (agent: AgentWithCampaignListItem) => {
		modals.open({
			title: t('form.agent.add.cloneTitle'),
			modalId: 'clone-agent-modal',
			size: 'md',
			centered: true,
			children: (
				<CloneAgentModal
					agent={agent}
					campaignId={campaignId}
					onSuccess={() => refetch()}
				/>
			),
		});
	};

	const columns = useAgentSelectionColumns({
		onPlay: handlePlay,
		onClone: handleClone,
		isPlaying: (row) => playingAgentId === row.id,
	});

	const shouldShowTable = isLoading || tableData.length > 0;

	return (
		<Stack className={classes.container} gap='lg'>
			<FilterContainer>
				<div className={classes.filterInputs}>
					<TextInput
						className={classes.searchInput}
						label={t('form.agent.add.searchLabel')}
						placeholder={t('form.agent.add.searchPlaceholder')}
						value={searchTerm}
						onChange={(event) => {
							setSearchTerm(event.currentTarget.value);
							setPage(1);
						}}
						aria-label={t('form.agent.add.searchLabel')}
						size='sm'
						leftSection={<IconSearch size={16} />}
					/>
					<Select
						className={classes.searchInput}
						label={t('form.agent.add.campaignNameLabel')}
						placeholder={t('form.agent.add.campaignNamePlaceholder')}
						data={campaignOptions}
						searchable
						loading={isCampaignsLoading}
						value={selectedCampaignId}
						onChange={handleCampaignChange}
						aria-label={t('form.agent.add.campaignNameLabel')}
						size='sm'
						clearable
						allowDeselect
						nothingFoundMessage={
							isCampaignsLoading
								? t('form.agent.add.loadingCampaigns')
								: isCampaignsError
									? t('form.agent.add.loadCampaignsError')
									: t('form.agent.add.noCampaignsFound')
						}
					/>
				</div>
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
							<Text fw={600}>{t('form.agent.add.loadError')}</Text>
							<Text className={classes.subText}>
								{t('form.agent.add.loadErrorDesc')}
							</Text>
							<Button
								variant='outline'
								color='red'
								size='xs'
								onClick={() => refetch()}
							>
								{t('form.agent.add.tryAgain')}
							</Button>
						</Stack>
					</Alert>
				) : shouldShowTable ? (
					<BaseTable<AgentWithCampaignListItem>
						data={tableData}
						columns={columns}
						isLoading={isLoading}
						density='compact'
						getRowClassName={getRowClassName}
					/>
				) : (
					<div className={classes.emptyState}>
						<div className={classes.emptyIcon}>
							<IconUsersGroup size={24} />
						</div>
						<Text fw={500}>{t('form.agent.add.noAgents')}</Text>
						<Text className={classes.subText}>
							{t('form.agent.add.noAgentsDesc')}
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
