import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	Alert,
	Button,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { isAxiosError } from 'axios';
import {
	IconAlertCircle,
	IconArrowLeft,
	IconPlus,
	IconSearch,
	IconUsersGroup,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable/BaseTable';
import { FilterContainer } from '~/components/FilterContainer';
import PaginationControls from '~/components/PaginationControls/PaginationControls';
import type { AgentWithCampaignListItem } from '~/models/AgentListObject';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import {
	useAgentsWithCampaigns,
	useCreateAgentWithCampaign,
} from '~/queries/agentQueries';
import { useGetSimpleCampaigns } from '~/queries/campaignsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import useAgentSelectionColumns from '~/modules/campaigns/CampaignsForm/AgentSection/AgentCampaignAdd/useAgentSelectionColumns';
import {
	ADD_CAMPAIGN_AGENT_CREATE_MODAL_SIZE,
	ADD_CAMPAIGN_AGENT_LIST_MODAL_SIZE,
	ADD_CAMPAIGN_AGENT_MODAL_ID,
} from './AgentCampaignAdd.constants';
import classes from './AgentCampaignAdd.module.css';
import CloneAgentModal from './CloneAgentModal';

interface AgentCampaignAddProps {
	campaignId: number;
	excludedAgents: string[];
	onCreated?: (campaignAgentId: number) => void;
}

type AddMode = 'list' | 'create';

const resolveCreateErrorMessage = (error: unknown, fallback: string) => {
	if (!isAxiosError(error)) {
		if (error instanceof Error && error.message.trim().length > 0) {
			return error.message;
		}

		return fallback;
	}

	const responseData = error.response?.data;
	if (
		typeof responseData === 'object' &&
		responseData !== null &&
		typeof (responseData as { message?: unknown }).message === 'string'
	) {
		return (responseData as { message: string }).message;
	}

	return fallback;
};

const toNumber = (value: string | number | undefined | null) => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === 'string') {
		const parsed = Number(value);
		return Number.isNaN(parsed) ? null : parsed;
	}

	return null;
};

const resolveCreatedCampaignAgentId = (response: unknown) => {
	if (!response || typeof response !== 'object') {
		return null;
	}

	const typedResponse = response as {
		id?: string | number;
		campaignAgentId?: string | number;
		agentId?: string;
		campaignAgent?: {
			id?: string | number;
			agentId?: string;
		} | null;
		agent?: {
			id?: string;
		} | null;
	};

	const directCandidates = [
		typedResponse.campaignAgentId,
		typedResponse.campaignAgent?.id,
		typeof typedResponse.id === 'number' ? typedResponse.id : null,
	];

	for (const candidate of directCandidates) {
		const normalized = toNumber(candidate);
		if (normalized != null) {
			return normalized;
		}
	}

	return null;
};

const resolveCreatedAgentId = (response: unknown) => {
	if (!response || typeof response !== 'object') {
		return null;
	}

	const typedResponse = response as {
		id?: string | number;
		agentId?: string;
		agent?: {
			id?: string;
		} | null;
		campaignAgent?: {
			agentId?: string;
		} | null;
	};

	if (
		typeof typedResponse.agentId === 'string' &&
		typedResponse.agentId.trim()
	) {
		return typedResponse.agentId;
	}

	if (
		typeof typedResponse.agent?.id === 'string' &&
		typedResponse.agent.id.trim()
	) {
		return typedResponse.agent.id;
	}

	if (
		typeof typedResponse.campaignAgent?.agentId === 'string' &&
		typedResponse.campaignAgent.agentId.trim()
	) {
		return typedResponse.campaignAgent.agentId;
	}

	if (typeof typedResponse.id === 'string' && typedResponse.id.trim()) {
		return typedResponse.id;
	}

	return null;
};

const AgentCampaignAdd: React.FC<AgentCampaignAddProps> = ({
	campaignId,
	excludedAgents,
	onCreated,
}) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const { selectedCampaign } = useCampaignsStore((state) => state);
	const [mode, setMode] = useState<AddMode>('list');
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearch] = useDebouncedValue(searchTerm, 400);
	const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
		null
	);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [playingAgentId, setPlayingAgentId] = useState<string | null>(null);
	const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(
		null
	);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const createMutation = useCreateAgentWithCampaign();
	const { data: campaignAgents, refetch: refetchCampaignAgents } =
		useGetCampaignAgents(campaignId || 0, false);

	const createForm = useForm({
		initialValues: {
			name: '',
		},
		validate: {
			name: (value) => {
				const trimmed = value.trim();
				if (!trimmed) {
					return t('form.agent.add.createNameRequired');
				}
				if (trimmed.length > 100) {
					return t('form.agent.add.createNameMaxLength');
				}
				return null;
			},
		},
	});

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
	const resolvedAgentType =
		selectedCampaign?.type === 'INBOUND' ? 'INBOUND' : 'OUTBOUND';
	const createTypeLabel =
		resolvedAgentType === 'INBOUND'
			? t('form.agent.sync.type.inbound')
			: t('form.agent.sync.type.outbound');

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

	const tableData = useMemo(() => data?.data ?? [], [data]);

	const getRowClassName = (row: { original: AgentWithCampaignListItem }) =>
		excludedAgents.includes(row.original.id) ? classes.excludedRow : undefined;

	const totalItems = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	const isCreateMode = mode === 'create';
	const isCreateLoading = createMutation.isPending;
	const isBusy = isCreateLoading;
	const modalSize = isCreateMode
		? ADD_CAMPAIGN_AGENT_CREATE_MODAL_SIZE
		: ADD_CAMPAIGN_AGENT_LIST_MODAL_SIZE;

	const nameInputProps = createForm.getInputProps('name');

	useEffect(() => {
		modals.updateModal({
			modalId: ADD_CAMPAIGN_AGENT_MODAL_ID,
			size: modalSize,
		});
	}, [modalSize]);

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

	const openCreateMode = () => {
		setMode('create');
		setCreateErrorMessage(null);
		createForm.reset();
	};

	const returnToListMode = () => {
		setMode('list');
		setCreateErrorMessage(null);
		createForm.reset();
	};

	const handleCreateSubmit = async (values: { name: string }) => {
		setCreateErrorMessage(null);

		try {
			const response = await createMutation.mutateAsync({
				name: values.name.trim(),
				type: resolvedAgentType,
				campaignId,
			});

			const createdAgentId = resolveCreatedAgentId(response);
			let campaignAgentId = resolveCreatedCampaignAgentId(response);

			if (!campaignAgentId) {
				const refreshedCampaignAgents = await refetchCampaignAgents();
				const refreshedAgents =
					refreshedCampaignAgents.data ?? campaignAgents ?? [];

				if (createdAgentId) {
					const matchingAgent = refreshedAgents.find(
						(agent) => agent.agentId === createdAgentId
					);
					campaignAgentId = matchingAgent?.id ?? null;
				}

				if (!campaignAgentId) {
					const latestAgent = [...refreshedAgents].sort((a, b) => {
						const aTime = new Date(a.createdAt).getTime();
						const bTime = new Date(b.createdAt).getTime();
						return bTime - aTime;
					})[0];
					campaignAgentId = latestAgent?.id ?? null;
				}
			}

			if (!campaignAgentId) {
				throw new Error(t('form.agent.add.createUnableToResolve'));
			}

			modals.close(ADD_CAMPAIGN_AGENT_MODAL_ID);
			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('form.agent.add.createSuccess'),
				color: 'green',
			});
			onCreated?.(campaignAgentId);
		} catch (error) {
			const message = resolveCreateErrorMessage(
				error,
				t('form.agent.add.createError')
			);
			setCreateErrorMessage(message);
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message,
				color: 'red',
			});
		}
	};

	const columns = useAgentSelectionColumns({
		onPlay: handlePlay,
		onClone: handleClone,
		isPlaying: (row) => playingAgentId === row.id,
	});

	const shouldShowTable = isLoading || tableData.length > 0;

	return (
		<Stack className={classes.container} gap='lg'>
			<div key={mode} className={classes.modePanel}>
				{isCreateMode ? (
					<Stack gap='md' className={classes.createMode}>
						<Group justify='space-between' align='flex-start' wrap='nowrap'>
							<Stack gap={4} className={classes.headerText}>
								<Text fw={700} size='md' className={classes.createTitle}>
									{t('form.agent.add.createTitle')}
								</Text>
								<Text size='sm' c='dimmed' className={classes.createLead}>
									{t('form.agent.add.createDescription', {
										type: createTypeLabel,
									})}
								</Text>
							</Stack>
							<Button
								variant='subtle'
								color='gray'
								size='sm'
								leftSection={<IconArrowLeft size={16} />}
								onClick={returnToListMode}
								disabled={isBusy}
								className={classes.backButton}
							>
								{t('form.agent.add.backToList')}
							</Button>
						</Group>

						<form onSubmit={createForm.onSubmit(handleCreateSubmit)}>
							<Stack gap='md' className={classes.formBody}>
								{createErrorMessage ? (
									<Alert
										icon={<IconAlertCircle size={16} />}
										color='red'
										variant='light'
										className={classes.errorAlert}
										withCloseButton={false}
									>
										<Text size='sm'>{createErrorMessage}</Text>
									</Alert>
								) : null}

								<TextInput
									label={t('form.agent.add.createNameLabel')}
									placeholder={t('form.agent.add.createNamePlaceholder')}
									maxLength={100}
									disabled={isBusy}
									{...nameInputProps}
									onChange={(event) => {
										setCreateErrorMessage(null);
										nameInputProps.onChange(event);
									}}
									size='sm'
									className={classes.nameInput}
									autoFocus
								/>

								<Group justify='flex-end' gap='sm' className={classes.actions}>
									<Button
										variant='default'
										type='button'
										onClick={returnToListMode}
										disabled={isBusy}
									>
										{t('form.agent.add.cancel')}
									</Button>
									<Button type='submit' loading={isBusy}>
										{t('form.agent.add.createAction')}
									</Button>
								</Group>
							</Stack>
						</form>
					</Stack>
				) : (
					<>
						<Group justify='space-between' align='flex-start' wrap='nowrap'>
							<Stack gap={2} className={classes.headerText}>
								<Text fw={600} size='sm'>
									{t('form.agent.list.title')}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('form.agent.list.description')}
								</Text>
							</Stack>
							<Button
								variant='light'
								size='xs'
								leftSection={<IconPlus size={14} />}
								onClick={openCreateMode}
							>
								{t('form.agent.add.createNewAgent')}
							</Button>
						</Group>

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
									<Button
										variant='light'
										size='xs'
										leftSection={<IconPlus size={14} />}
										onClick={openCreateMode}
									>
										{t('form.agent.add.createNewAgent')}
									</Button>
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
					</>
				)}
			</div>
		</Stack>
	);
};

export default AgentCampaignAdd;
