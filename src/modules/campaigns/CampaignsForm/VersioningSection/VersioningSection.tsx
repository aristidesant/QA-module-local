import { useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Button,
	Group,
	Loader,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	IconAlertCircle,
	IconGitBranch,
	IconHistory,
	IconRotate2,
} from '@tabler/icons-react';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard';
import { usePagination } from '~/hooks/usePagination';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import { useSyncCampaignByAgent } from '~/queries/campaignsQueries';
import {
	useEnableAgentVersioning,
	useGetAgentBranchDetails,
	useGetAgentBranches,
	useGetAgentVersionCommits,
	useGetAgentVersionSnapshot,
	useGetAgentVersioningStatus,
	useRevertAgentVersion,
} from '~/queries/agentVersioningQueries';
import type { CampaignAgent } from '~/models/CampaignAgentModel';
import type { Campaign } from '~/models/CampaignsModel';
import type {
	AgentVersionCommit,
	AgentVersionSummary,
} from '~/models/AgentVersioningModel';
import useVersionHistoryColumns from './useVersionHistoryColumns';
import VersionDiffModal from './VersionDiffModal';
import {
	formatCommittedAgo,
	formatCommittedAt,
	getHistoricalVersions,
} from './VersioningSection.helpers';
import classes from './VersioningSection.module.css';

interface VersioningSectionProps {
	campaign?: Partial<Campaign>;
}

const VersioningSection = ({ campaign }: VersioningSectionProps) => {
	const { t } = useTranslation(['campaign.form.versioning', 'common']);
	const [selectedVersion, setSelectedVersion] =
		useState<AgentVersionSummary | null>(null);
	const [selectedCampaignAgentId, setSelectedCampaignAgentId] = useState<
		string | null
	>(null);
	const versionPagination = usePagination({ initialItemsPerPage: 10 });

	const campaignId = campaign?.id ?? 0;
	const {
		data: campaignAgents = [],
		isLoading: isLoadingCampaignAgents,
		isError: isCampaignAgentsError,
		refetch: refetchCampaignAgents,
	} = useGetCampaignAgents(campaignId);

	const agentOptions = useMemo(
		() =>
			campaignAgents.map((campaignAgent: CampaignAgent) => ({
				value: campaignAgent.agentId,
				label:
					campaignAgent.agent?.name?.trim() ||
					t('selector.fallbackAgentLabel', {
						agentId: campaignAgent.agentId,
					}),
			})),
		[campaignAgents, t]
	);

	const effectiveSelectedCampaignAgentId =
		selectedCampaignAgentId ??
		(campaignAgents.length === 1 ? campaignAgents[0].agentId : null);

	const selectedCampaignAgent = useMemo(
		() =>
			campaignAgents.find(
				(campaignAgent: CampaignAgent) =>
					campaignAgent.agentId === effectiveSelectedCampaignAgentId
			) ?? null,
		[campaignAgents, effectiveSelectedCampaignAgentId]
	);
	const agentId = selectedCampaignAgent?.agentId ?? '';
	const isMultiAgentCampaign = campaignAgents.length > 1;
	const requiresAgentSelection =
		isMultiAgentCampaign && !effectiveSelectedCampaignAgentId;

	const { data: agentRecord, isLoading: isLoadingAgentRecord } =
		useGetAgentVersioningStatus(agentId);
	const { mutateAsync: enableVersioning, isPending: isEnabling } =
		useEnableAgentVersioning();
	const { data: branches, isLoading: isLoadingBranches } = useGetAgentBranches(
		agentId,
		false
	);
	const mainBranch = useMemo(
		() =>
			branches?.results.find(
				(branch) => branch.name.trim().toLowerCase() === 'main'
			),
		[branches]
	);
	const { data: branchDetails, isLoading: isLoadingBranchDetails } =
		useGetAgentBranchDetails(agentId, mainBranch?.id);
	const { data: versionCommitsData } = useGetAgentVersionCommits(
		agentId,
		mainBranch?.id,
		Boolean(agentId && mainBranch?.id)
	);
	const versionCommits: AgentVersionCommit[] =
		versionCommitsData?.results ?? [];
	const { data: currentSnapshot, isLoading: isLoadingCurrentSnapshot } =
		useGetAgentVersionSnapshot(
			agentId,
			{ branchId: mainBranch?.id },
			!!mainBranch?.id
		);
	const {
		data: selectedSnapshot,
		isLoading: isLoadingSelectedSnapshot,
		refetch: refetchSelectedSnapshot,
	} = useGetAgentVersionSnapshot(
		agentId,
		{ versionId: selectedVersion?.id },
		Boolean(selectedVersion?.id)
	);
	const { mutateAsync: revertVersion, isPending: isReverting } =
		useRevertAgentVersion();
	const { mutateAsync: syncCampaignByAgent } = useSyncCampaignByAgent();

	const historicalVersions = useMemo(
		() => getHistoricalVersions(branchDetails),
		[branchDetails]
	);
	const latestCurrentVersion = branchDetails?.mostRecentVersions?.[0];
	const latestRevertTarget = historicalVersions[0];
	const isVersioningEnabled = Boolean(agentRecord?.versioningEnabled);
	const isBusy =
		isLoadingCampaignAgents ||
		(!requiresAgentSelection && isLoadingAgentRecord) ||
		isLoadingBranches ||
		(isVersioningEnabled && isLoadingBranchDetails);

	const { limit: versionPageLimit, offset: versionPageOffset } =
		versionPagination.getApiParams();
	const paginatedVersions = historicalVersions.slice(
		versionPageOffset,
		versionPageOffset + versionPageLimit
	);
	const totalVersionPages = versionPagination.calculateTotalPages(
		historicalVersions.length
	);

	const handleVersionPageSizeChange = (value: string | null) => {
		if (value) versionPagination.setItemsPerPage(Number(value));
	};

	useEffect(() => {
		if (
			selectedCampaignAgentId &&
			!campaignAgents.some(
				(campaignAgent: CampaignAgent) =>
					campaignAgent.agentId === selectedCampaignAgentId
			)
		) {
			setSelectedCampaignAgentId(null);
		}
	}, [campaignAgents, selectedCampaignAgentId]);

	useEffect(() => {
		setSelectedVersion(null);
	}, [effectiveSelectedCampaignAgentId]);

	useEffect(() => {
		versionPagination.setCurrentPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [agentId, selectedCampaignAgentId]);

	const getApiErrorMessage = (error: unknown, fallback: string) => {
		if (isAxiosError(error)) {
			return (
				(error.response?.data as { message?: string } | undefined)?.message ??
				fallback
			);
		}

		return fallback;
	};

	const handleEnableVersioning = () => {
		if (!agentId) return;

		const modalId = 'enable-agent-versioning';
		modals.open({
			modalId,
			title: t('enable.confirmTitle'),
			children: (
				<Stack gap='sm'>
					<Text size='sm'>{t('enable.confirmMessage')}</Text>
					<Group justify='flex-end'>
						<Button
							variant='default'
							onClick={() => modals.close(modalId)}
							disabled={isEnabling}
						>
							{t('actions.cancel')}
						</Button>
						<Button
							color='blue'
							loading={isEnabling}
							onClick={async () => {
								try {
									await enableVersioning(agentId);
									modals.close(modalId);
									notifications.show({
										title: t('enable.successTitle'),
										message: t('enable.successMessage'),
										color: 'green',
									});
								} catch (error) {
									notifications.show({
										title: t('enable.errorTitle'),
										message: getApiErrorMessage(
											error,
											t('enable.errorMessage')
										),
										color: 'red',
									});
								}
							}}
						>
							{t('enable.confirmAction')}
						</Button>
					</Group>
				</Stack>
			),
		});
	};

	const handleRevert = async (version: AgentVersionSummary) => {
		if (!agentId || !mainBranch?.id) return;

		const modalId = `revert-agent-version-${version.id}`;
		modals.open({
			modalId,
			title: t('revert.confirmTitle'),
			children: (
				<Stack gap='sm'>
					<Text size='sm'>
						{t('revert.confirmMessage', {
							version: version.seqNoInBranch,
						})}
					</Text>
					<Group justify='flex-end'>
						<Button
							variant='default'
							onClick={() => modals.close(modalId)}
							disabled={isReverting}
						>
							{t('actions.cancel')}
						</Button>
						<Button
							color='orange'
							loading={isReverting}
							onClick={async () => {
								try {
									await revertVersion({
										agentId,
										branchId: mainBranch.id,
										versionId: version.id,
									});
									await syncCampaignByAgent(agentId);
									modals.close(modalId);
									setSelectedVersion(null);
									notifications.show({
										title: t('revert.successTitle'),
										message: t('revert.successMessage'),
										color: 'green',
									});
								} catch (error) {
									notifications.show({
										title: t('revert.errorTitle'),
										message: getApiErrorMessage(
											error,
											t('revert.errorMessage')
										),
										color: 'red',
									});
								}
							}}
						>
							{t('actions.revertVersion')}
						</Button>
					</Group>
				</Stack>
			),
		});
	};

	const columns = useVersionHistoryColumns({
		onCompare: (version) => setSelectedVersion(version),
		onRevert: handleRevert,
		isReverting,
		activeVersionId: selectedVersion?.id,
		versionCommits,
	});

	if (!campaign?.id) {
		return (
			<SectionCard
				title={t('section.title')}
				description={t('section.description')}
			>
				<div className={classes.emptyState}>
					<Text size='sm'>{t('empty.unsavedCampaign')}</Text>
				</div>
			</SectionCard>
		);
	}

	return (
		<>
			<SectionCard
				title={t('section.title')}
				description={t('section.description')}
			>
				<Stack gap='sm' className={classes.panel}>
					{isCampaignAgentsError ? (
						<Alert
							icon={<IconAlertCircle size={16} />}
							color='red'
							variant='light'
						>
							<Stack gap='xs'>
								<Text size='sm'>{t('errors.agentLoadFailed')}</Text>
								<Group justify='flex-start'>
									<Button
										size='xs'
										variant='light'
										onClick={() => refetchCampaignAgents()}
									>
										{t('actions.retry')}
									</Button>
								</Group>
							</Stack>
						</Alert>
					) : null}

					{campaignAgents.length > 0 ? (
						<div className={classes.selectorCard}>
							<Stack gap='xs'>
								<Text size='sm' fw={600}>
									{t('selector.title')}
								</Text>
								<Text size='sm' c='dimmed'>
									{isMultiAgentCampaign
										? t('selector.descriptionMulti')
										: t('selector.descriptionSingle')}
								</Text>
								<Group gap='sm' align='end' className={classes.selectorRow}>
									<Select
										label={t('selector.label')}
										placeholder={t('selector.placeholder')}
										data={agentOptions}
										value={effectiveSelectedCampaignAgentId}
										onChange={setSelectedCampaignAgentId}
										size='sm'
										className={classes.selectorControl}
										allowDeselect={false}
										disabled={campaignAgents.length === 1}
									/>
									{selectedCampaignAgent ? (
										<Text size='sm' c='dimmed'>
											{t('selector.agentId', {
												agentId: selectedCampaignAgent.agentId,
											})}
										</Text>
									) : null}
								</Group>
							</Stack>
						</div>
					) : null}

					{isBusy ? (
						<Group justify='center' py='xl'>
							<Loader size='sm' />
						</Group>
					) : campaignAgents.length === 0 ? (
						<div className={classes.emptyState}>
							<Text size='sm'>{t('empty.noAssignedAgents')}</Text>
						</div>
					) : requiresAgentSelection ? (
						<div className={classes.emptyState}>
							<Text size='sm'>{t('empty.selectAgent')}</Text>
						</div>
					) : !isVersioningEnabled ? (
						<div className={classes.emptyState}>
							<Stack gap='xs'>
								<Text size='sm' fw={600}>
									{t('enable.title')}
								</Text>
								<Text size='sm' c='dimmed'>
									{t('enable.description')}
								</Text>
								<Group justify='flex-start'>
									<Button size='sm' onClick={handleEnableVersioning}>
										{t('enable.action')}
									</Button>
								</Group>
							</Stack>
						</div>
					) : !mainBranch ? (
						<Alert
							icon={<IconAlertCircle size={16} />}
							color='red'
							variant='light'
						>
							{t('errors.mainBranchMissing')}
						</Alert>
					) : (
						<>
							<div className={classes.summaryGrid}>
								<div className={classes.summaryCard}>
									<Group gap='xs' mb={4}>
										<IconGitBranch size={16} />
										<Text size='xs' c='dimmed'>
											{t('summary.branch')}
										</Text>
									</Group>
									<Text size='sm' fw={600}>
										{mainBranch.name}
									</Text>
									<Text size='xs' c='dimmed'>
										{t('summary.liveTraffic', {
											percentage: mainBranch.currentLivePercentage,
										})}
									</Text>
								</div>
								<div className={classes.summaryCard}>
									<Group gap='xs' mb={4}>
										<IconHistory size={16} />
										<Text size='xs' c='dimmed'>
											{t('summary.currentVersion')}
										</Text>
									</Group>
									<Text size='sm' fw={600}>
										{latestCurrentVersion
											? t('history.versionBadge', {
													version: latestCurrentVersion.seqNoInBranch,
												})
											: t('summary.notAvailable')}
									</Text>
									<Text size='xs' c='dimmed'>
										{latestCurrentVersion
											? formatCommittedAt(
													latestCurrentVersion.timeCommittedSecs
												)
											: '—'}
									</Text>
								</div>
								<div className={classes.summaryCard}>
									<Group gap='xs' mb={4}>
										<IconRotate2 size={16} />
										<Text size='xs' c='dimmed'>
											{t('summary.lastCommit')}
										</Text>
									</Group>
									<Text size='sm' fw={600}>
										{formatCommittedAgo(mainBranch.lastCommittedAt)}
									</Text>
									<Text size='xs' c='dimmed'>
										{formatCommittedAt(mainBranch.lastCommittedAt)}
									</Text>
								</div>
							</div>

							<div className={classes.historyHeader}>
								<Stack gap={2}>
									<Text size='sm' fw={600}>
										{t('history.title')}
									</Text>
									<Text size='sm' c='dimmed'>
										{t('history.description')}
									</Text>
								</Stack>
								<Button
									size='sm'
									variant='light'
									color='orange'
									leftSection={<IconRotate2 size={16} />}
									disabled={!latestRevertTarget}
									onClick={() =>
										latestRevertTarget && handleRevert(latestRevertTarget)
									}
								>
									{t('actions.revertLatest')}
								</Button>
							</div>

							{historicalVersions.length === 0 ? (
								<div className={classes.emptyState}>
									<Text size='sm'>{t('history.empty')}</Text>
								</div>
							) : (
								<div className={classes.tableWrap}>
									<BaseTable<AgentVersionSummary>
										data={paginatedVersions}
										columns={columns}
										density='compact'
										emptyMessage={t('history.empty')}
									/>
									<PaginationControls
										currentPage={versionPagination.currentPage}
										totalPages={totalVersionPages}
										itemsPerPage={versionPagination.itemsPerPage}
										totalItems={historicalVersions.length}
										onPageChange={versionPagination.setCurrentPage}
										onItemsPerPageChange={handleVersionPageSizeChange}
										itemLabel={t('history.itemLabel')}
									/>
								</div>
							)}
						</>
					)}
				</Stack>
			</SectionCard>

			<VersionDiffModal
				opened={Boolean(selectedVersion)}
				onClose={() => setSelectedVersion(null)}
				currentSnapshot={currentSnapshot}
				selectedSnapshot={selectedSnapshot}
				selectedVersion={selectedVersion}
				isLoading={isLoadingCurrentSnapshot || isLoadingSelectedSnapshot}
				isReverting={isReverting}
				onRevert={async () => {
					if (selectedVersion) {
						if (!selectedSnapshot) {
							await refetchSelectedSnapshot();
						}
						await handleRevert(selectedVersion);
					}
				}}
			/>
		</>
	);
};

export default VersioningSection;
