import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Group, Loader, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	IconAlertCircle,
	IconHistory,
	IconRotate2,
	IconScissors,
	IconTrash,
	IconUser,
} from '@tabler/icons-react';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard';
import { usePagination } from '~/hooks/usePagination';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import { useSyncCampaignByAgent } from '~/queries/campaignsQueries';
import {
	useDeleteVersionCommits,
	useEnableAgentVersioning,
	useGetAgentBranchDetails,
	useGetAgentBranches,
	useGetAgentVersionCommits,
	useGetAgentVersionSnapshot,
	useGetAgentVersioningStatus,
	useRevertAgentVersion,
} from '~/queries/agentVersioningQueries';
import agentVersioningApi from '~/api/agentVersioningApi';
import type { CampaignAgent } from '~/models/CampaignAgentModel';
import type { Campaign } from '~/models/CampaignsModel';
import type {
	AgentVersionCommit,
	AgentVersionSummary,
} from '~/models/AgentVersioningModel';
import useVersionHistoryColumns from './useVersionHistoryColumns';
import VersionDiffModal from './VersionDiffModal';
import {
	findCommitForVersion,
	formatCommittedAgo,
	formatCommittedAt,
} from './VersioningSection.helpers';
import classes from './VersioningSection.module.css';

interface VersioningSectionProps {
	campaign?: Partial<Campaign>;
}

const VersioningSection = ({ campaign }: VersioningSectionProps) => {
	const { t } = useTranslation(['campaign.form.versioning', 'common']);
	const { setSelectedTab } = useCampaignsStore((state) => state);
	const [selectedVersion, setSelectedVersion] =
		useState<AgentVersionSummary | null>(null);
	const [selectedCampaignAgentId, setSelectedCampaignAgentId] = useState<
		string | null
	>(null);
	const [selectedVersionIds, setSelectedVersionIds] = useState<Set<string>>(
		new Set()
	);
	const [deletedVersionIds, setDeletedVersionIds] = useState<Set<string>>(
		new Set()
	);
	const versionPagination = usePagination({ initialItemsPerPage: 10 });

	const campaignId = campaign?.id ?? 0;
	const {
		data: campaignAgents = [],
		isLoading: isLoadingCampaignAgents,
		isError: isCampaignAgentsError,
		refetch: refetchCampaignAgents,
	} = useGetCampaignAgents(campaignId);

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
	const { limit: versionPageLimit, offset: versionPageOffset } =
		versionPagination.getApiParams();
	const historyApiOffset = 1 + versionPageOffset;

	// Lightweight call: fetches the two most recent non-deleted versions for the
	// summary card and the "Revert Latest" button — cached independently.
	const { data: summaryBranchDetails, isLoading: isLoadingSummaryBranch } =
		useGetAgentBranchDetails(agentId, mainBranch?.id, {
			limit: 2,
			offset: 0,
			filter: 'ACTIVE',
		});

	// Paginated call: drives the history table. offset=1 skips the current
	// version shown in the summary card. filter=ACTIVE excludes soft-deleted
	// versions server-side so pagination totals are accurate.
	const {
		data: historyBranchDetails,
		isLoading: isLoadingHistoryBranch,
		isFetching: isFetchingHistoryBranch,
	} = useGetAgentBranchDetails(agentId, mainBranch?.id, {
		limit: versionPageLimit,
		offset: historyApiOffset,
		filter: 'ACTIVE',
	});
	const { data: versionCommitsData } = useGetAgentVersionCommits(
		agentId,
		{ branchId: mainBranch?.id, filter: 'ACTIVE' },
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
	const { mutateAsync: deleteVersionCommits, isPending: isDeleting } =
		useDeleteVersionCommits();
	const { mutateAsync: syncCampaignByAgent } = useSyncCampaignByAgent();

	const historicalVersions: AgentVersionSummary[] =
		historyBranchDetails?.mostRecentVersions.data ?? [];

	// Optimistic filter: hides rows instantly after delete while the branch
	// query refetches in the background. Server already excludes deleted versions
	// via filter=ACTIVE, so this only covers the brief refetch window.
	const filteredHistoricalVersions = useMemo(() => {
		const seen = new Set<string>();
		return historicalVersions.filter((v) => {
			if (deletedVersionIds.has(v.id)) return false;
			if (seen.has(v.id)) return false;
			seen.add(v.id);
			return true;
		});
	}, [historicalVersions, deletedVersionIds]);

	const latestCurrentVersion = summaryBranchDetails?.mostRecentVersions.data[0];
	const latestRevertTarget = summaryBranchDetails?.mostRecentVersions.data[1];
	const isVersioningEnabled = Boolean(agentRecord?.versioningEnabled);
	const latestVersionAuthor = useMemo(() => {
		if (!latestCurrentVersion) return null;
		const { appUser, accessInfo } = latestCurrentVersion;
		const name =
			appUser?.userName ||
			appUser?.userEmail ||
			accessInfo?.creatorName ||
			t('history.unknownAuthor');
		const email = appUser?.userEmail || accessInfo?.creatorEmail;
		return { name, email };
	}, [latestCurrentVersion, t]);

	const isBusy =
		isLoadingCampaignAgents ||
		(!requiresAgentSelection && isLoadingAgentRecord) ||
		isLoadingBranches ||
		(isVersioningEnabled && isLoadingSummaryBranch);

	const totalHistoricalItems = Math.max(
		0,
		(summaryBranchDetails?.mostRecentVersions.total ?? 0) - 1
	);
	const totalVersionPages =
		versionPagination.calculateTotalPages(totalHistoricalItems);

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
		setSelectedVersionIds(new Set());
		setDeletedVersionIds(new Set());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [agentId, selectedCampaignAgentId]);

	// Clear selection when page changes
	useEffect(() => {
		setSelectedVersionIds(new Set());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [versionPagination.currentPage]);

	const getApiErrorMessage = (error: unknown, fallback: string) => {
		if (isAxiosError(error)) {
			return (
				(error.response?.data as { message?: string } | undefined)?.message ??
				fallback
			);
		}

		return fallback;
	};

	const handleToggleSelect = useCallback((versionId: string) => {
		setSelectedVersionIds((prev) => {
			const next = new Set(prev);
			if (next.has(versionId)) next.delete(versionId);
			else next.add(versionId);
			return next;
		});
	}, []);

	const handleSelectAll = useCallback(() => {
		setSelectedVersionIds(new Set(filteredHistoricalVersions.map((v) => v.id)));
	}, [filteredHistoricalVersions]);

	const handleDeselectAll = useCallback(() => {
		setSelectedVersionIds(new Set());
	}, []);

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
									setSelectedTab('agents');
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

	const handleDeleteVersions = useCallback(
		(versions: AgentVersionSummary[]) => {
			if (!agentId || versions.length === 0) return;

			const commitIds = versions
				.map((v) => findCommitForVersion(v, versionCommits)?.id)
				.filter((id): id is number => id !== undefined);

			if (commitIds.length === 0) {
				notifications.show({
					title: t('delete.errorTitle'),
					message: t('delete.noCommitError'),
					color: 'red',
				});
				return;
			}

			const count = versions.length;
			const modalId = 'delete-agent-versions';
			modals.open({
				modalId,
				title: t('delete.confirmTitle', { count }),
				children: (
					<Stack gap='sm'>
						<Text size='sm'>{t('delete.confirmMessage', { count })}</Text>
						<Text size='xs' c='dimmed'>
							{t('delete.revertHint')}
						</Text>
						<Group justify='flex-end'>
							<Button
								variant='default'
								onClick={() => modals.close(modalId)}
								disabled={isDeleting}
							>
								{t('actions.cancel')}
							</Button>
							<Button
								color='red'
								loading={isDeleting}
								onClick={async () => {
									try {
										await deleteVersionCommits({ agentId, ids: commitIds });
										modals.close(modalId);
										setDeletedVersionIds((prev) => {
											const next = new Set(prev);
											versions.forEach((v) => next.add(v.id));
											return next;
										});
										setSelectedVersionIds((prev) => {
											const next = new Set(prev);
											versions.forEach((v) => next.delete(v.id));
											return next;
										});
										notifications.show({
											title: t('delete.successTitle', { count }),
											message: t('delete.successMessage', { count }),
											color: 'green',
										});
									} catch (error) {
										notifications.show({
											title: t('delete.errorTitle'),
											message: getApiErrorMessage(
												error,
												t('delete.errorMessage')
											),
											color: 'red',
										});
									}
								}}
							>
								{t('actions.delete')}
							</Button>
						</Group>
					</Stack>
				),
			});
		},
		[agentId, deleteVersionCommits, isDeleting, t, versionCommits]
	);

	const handleCompare = useCallback(
		(version: AgentVersionSummary) => setSelectedVersion(version),
		[]
	);

	const handleDeleteSingleVersion = useCallback(
		(version: AgentVersionSummary) => handleDeleteVersions([version]),
		[handleDeleteVersions]
	);

	const handleRevertAndDeleteSubsequent = useCallback(
		async (targetVersion: AgentVersionSummary) => {
			if (!agentId || !mainBranch?.id) return;

			// Fetch all active versions to find those newer than the target
			let allVersions: AgentVersionSummary[] = [];
			try {
				const api = agentVersioningApi();
				const data = await api.getBranchDetails(agentId, mainBranch.id, {
					limit: 1000,
					offset: 0,
					filter: 'ACTIVE',
				});
				allVersions = data.mostRecentVersions.data;
			} catch {
				notifications.show({
					title: t('revertAndDelete.errorTitle'),
					message: t('revertAndDelete.loadError'),
					color: 'red',
				});
				return;
			}

			const subsequentVersions = allVersions.filter(
				(v) => v.seqNoInBranch > targetVersion.seqNoInBranch
			);

			if (subsequentVersions.length === 0) {
				notifications.show({
					title: t('revertAndDelete.noSubsequentTitle'),
					message: t('revertAndDelete.noSubsequentMessage', {
						version: targetVersion.seqNoInBranch,
					}),
					color: 'blue',
				});
				return;
			}

			const commitIds = subsequentVersions
				.map((v) => findCommitForVersion(v, versionCommits)?.id)
				.filter((id): id is number => id !== undefined);

			const deleteCount = subsequentVersions.length;
			const targetVersionNo = targetVersion.seqNoInBranch;
			const modalId = `revert-and-delete-${targetVersion.id}`;

			modals.open({
				modalId,
				title: t('revertAndDelete.confirmTitle', { version: targetVersionNo }),
				children: (
					<Stack gap='sm'>
						<Text size='sm'>
							{t('revertAndDelete.confirmMessage', {
								version: targetVersionNo,
								count: deleteCount,
							})}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('revertAndDelete.deleteHint', { count: deleteCount })}
						</Text>
						<Group justify='flex-end'>
							<Button variant='default' onClick={() => modals.close(modalId)}>
								{t('actions.cancel')}
							</Button>
							<Button
								color='red'
								leftSection={<IconScissors size={14} />}
								onClick={async () => {
									try {
										if (commitIds.length > 0) {
											await deleteVersionCommits({
												agentId,
												ids: commitIds,
											});
										}
										await revertVersion({
											agentId,
											branchId: mainBranch.id,
											versionId: targetVersion.id,
										});
										await syncCampaignByAgent(agentId);
										modals.close(modalId);
										setDeletedVersionIds((prev) => {
											const next = new Set(prev);
											subsequentVersions.forEach((v) => next.add(v.id));
											return next;
										});
										setSelectedVersionIds((prev) => {
											const next = new Set(prev);
											subsequentVersions.forEach((v) => next.delete(v.id));
											return next;
										});
										setSelectedVersion(null);
										setSelectedTab('agents');
										notifications.show({
											title: t('revertAndDelete.successTitle', {
												version: targetVersionNo,
											}),
											message: t('revertAndDelete.successMessage', {
												version: targetVersionNo,
												count: deleteCount,
											}),
											color: 'green',
										});
									} catch (error) {
										notifications.show({
											title: t('revertAndDelete.errorTitle'),
											message: getApiErrorMessage(
												error,
												t('revertAndDelete.errorMessage')
											),
											color: 'red',
										});
									}
								}}
							>
								{t('actions.revertAndDelete', { count: deleteCount })}
							</Button>
						</Group>
					</Stack>
				),
			});
		},
		[
			agentId,
			mainBranch,
			versionCommits,
			deleteVersionCommits,
			revertVersion,
			syncCampaignByAgent,
			t,
			setSelectedTab,
		]
	);

	const handleRevertAndDeletePrevious = useCallback(
		async (targetVersion: AgentVersionSummary) => {
			if (!agentId || !mainBranch?.id) return;

			let allVersions: AgentVersionSummary[] = [];
			try {
				const api = agentVersioningApi();
				const data = await api.getBranchDetails(agentId, mainBranch.id, {
					limit: 1000,
					offset: 0,
					filter: 'ACTIVE',
				});
				allVersions = data.mostRecentVersions.data;
			} catch {
				notifications.show({
					title: t('revertAndDeletePrevious.errorTitle'),
					message: t('revertAndDeletePrevious.loadError'),
					color: 'red',
				});
				return;
			}

			const previousVersions = allVersions.filter(
				(v) => v.seqNoInBranch < targetVersion.seqNoInBranch
			);

			if (previousVersions.length === 0) {
				notifications.show({
					title: t('revertAndDeletePrevious.noVersionsTitle'),
					message: t('revertAndDeletePrevious.noVersionsMessage', {
						version: targetVersion.seqNoInBranch,
					}),
					color: 'blue',
				});
				return;
			}

			const commitIds = previousVersions
				.map((v) => findCommitForVersion(v, versionCommits)?.id)
				.filter((id): id is number => id !== undefined);

			const deleteCount = previousVersions.length;
			const targetVersionNo = targetVersion.seqNoInBranch;
			const modalId = `revert-and-delete-previous-${targetVersion.id}`;

			modals.open({
				modalId,
				title: t('revertAndDeletePrevious.confirmTitle', {
					version: targetVersionNo,
				}),
				children: (
					<Stack gap='sm'>
						<Text size='sm'>
							{t('revertAndDeletePrevious.confirmMessage', {
								version: targetVersionNo,
								count: deleteCount,
							})}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('revertAndDeletePrevious.deleteHint', { count: deleteCount })}
						</Text>
						<Group justify='flex-end'>
							<Button variant='default' onClick={() => modals.close(modalId)}>
								{t('actions.cancel')}
							</Button>
							<Button
								color='red'
								leftSection={<IconScissors size={14} />}
								onClick={async () => {
									try {
										if (commitIds.length > 0) {
											await deleteVersionCommits({
												agentId,
												ids: commitIds,
											});
										}
										await revertVersion({
											agentId,
											branchId: mainBranch.id,
											versionId: targetVersion.id,
										});
										await syncCampaignByAgent(agentId);
										modals.close(modalId);
										setDeletedVersionIds((prev) => {
											const next = new Set(prev);
											previousVersions.forEach((v) => next.add(v.id));
											return next;
										});
										setSelectedVersionIds((prev) => {
											const next = new Set(prev);
											previousVersions.forEach((v) => next.delete(v.id));
											return next;
										});
										setSelectedVersion(null);
										setSelectedTab('agents');
										notifications.show({
											title: t('revertAndDeletePrevious.successTitle', {
												version: targetVersionNo,
											}),
											message: t('revertAndDeletePrevious.successMessage', {
												version: targetVersionNo,
												count: deleteCount,
											}),
											color: 'green',
										});
									} catch (error) {
										notifications.show({
											title: t('revertAndDeletePrevious.errorTitle'),
											message: getApiErrorMessage(
												error,
												t('revertAndDeletePrevious.errorMessage')
											),
											color: 'red',
										});
									}
								}}
							>
								{t('actions.revertAndDelete', { count: deleteCount })}
							</Button>
						</Group>
					</Stack>
				),
			});
		},
		[
			agentId,
			mainBranch,
			versionCommits,
			deleteVersionCommits,
			revertVersion,
			syncCampaignByAgent,
			t,
			setSelectedTab,
		]
	);

	const allVersionsSelected =
		filteredHistoricalVersions.length > 0 &&
		filteredHistoricalVersions.every((v) => selectedVersionIds.has(v.id));

	const someVersionsSelected =
		!allVersionsSelected &&
		filteredHistoricalVersions.some((v) => selectedVersionIds.has(v.id));

	const columns = useVersionHistoryColumns({
		onCompare: handleCompare,
		onRevert: handleRevert,
		onDelete: handleDeleteSingleVersion,
		onRevertAndDeleteSubsequent: handleRevertAndDeleteSubsequent,
		onRevertAndDeletePrevious: handleRevertAndDeletePrevious,
		isReverting,
		isDeleting,
		activeVersionId: selectedVersion?.id,
		versionCommits,
		selectedVersionIds,
		onToggleSelect: handleToggleSelect,
		onSelectAll: handleSelectAll,
		onDeselectAll: handleDeselectAll,
		allSelected: allVersionsSelected,
		someSelected: someVersionsSelected,
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
								<div className={classes.summaryCard}>
									<Group gap='xs' mb={4}>
										<IconUser size={16} />
										<Text size='xs' c='dimmed'>
											{t('summary.author')}
										</Text>
									</Group>
									<Text size='sm' fw={600}>
										{latestVersionAuthor?.name ?? '—'}
									</Text>
									{latestVersionAuthor?.email ? (
										<Text size='xs' c='dimmed'>
											{latestVersionAuthor.email}
										</Text>
									) : null}
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
								<Group gap='xs' wrap='nowrap'>
									{selectedVersionIds.size > 0 ? (
										<Button
											size='sm'
											variant='light'
											color='red'
											leftSection={<IconTrash size={16} />}
											loading={isDeleting}
											onClick={() => {
												const selected = filteredHistoricalVersions.filter(
													(v) => selectedVersionIds.has(v.id)
												);
												handleDeleteVersions(selected);
											}}
										>
											{t('actions.deleteSelected', {
												count: selectedVersionIds.size,
											})}
										</Button>
									) : null}
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
								</Group>
							</div>

							{filteredHistoricalVersions.length === 0 &&
							!isLoadingHistoryBranch ? (
								<div className={classes.emptyState}>
									<Text size='sm'>{t('history.empty')}</Text>
								</div>
							) : (
								<div className={classes.tableWrap}>
									<BaseTable<AgentVersionSummary>
										data={filteredHistoricalVersions}
										columns={columns}
										density='compact'
										emptyMessage={t('history.empty')}
										isLoading={isFetchingHistoryBranch}
										getRowId={(row) => row.id}
									/>
									<PaginationControls
										currentPage={versionPagination.currentPage}
										totalPages={totalVersionPages}
										itemsPerPage={versionPagination.itemsPerPage}
										totalItems={totalHistoricalItems}
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
